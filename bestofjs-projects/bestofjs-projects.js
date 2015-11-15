"use latest";
var mongodb = require('mongodb');
var { MongoClient } = mongodb;
var {waterfall, parallel, eachLimit}   = require('async');
var moment = require('moment');
const DEBUG = false;

/*

The main function run by the microservice

*/

module.exports = function (context, done) {

  //Define an helper to send the error message
  var sendError = function (msg) {
    done(new Error(msg));
  };

  //Check if credentials are provided
  var credentials = {
    mongo_uri: context.data.MONGO_URI,
  };
  if (!credentials.mongo_uri) return sendError('No `MONGO_URI` parameter');

  var f1 = function (callback) {
    openDb(credentials.mongo_uri, function(err, db) {
      if (err) return sendError(err.message);
      callback(null, db);
    });
  };

  var f2 = function (db, cb) {
    console.log('Get projects and tags from', db.databaseName);
    fetchData(db, function (err, result) {
      if (err) return sendError(err.message);
      var json = {
        status: 'OK',
        date: new Date(),
        projects: populateProjects(result.projects, result.tags),
        tags: result.tags.map( tag => tag.code )
      };
      db.close();
      cb(null, json);
    });
  };

  waterfall([f1, f2], done);

};

/*

Sub-functions

*/

function openDb(url, cb) {
  //Return the database instance
  console.log('Connecting db', url);
  MongoClient.connect(url, function(err, db) {
    console.log('Connected!', db.databaseName);
    if(err) return cb(err);
    cb(null, db);
  });
}

function getProjects(db, cb) {
  //Fetch projects
  var superprojects = [];
  if (!db) return cb(new Error('No db!'));
  var snapshotCollection = db.collection('snapshot');

  var processProject = function (project, cb) {
    if (DEBUG) console.log('Processing', project);
    getSnapshotData(project, snapshotCollection, function (report) {
      var superproject = createSuperproject(project, report);
      superprojects.push(superproject);
      return cb(null, superprojects);
    });
  };

  // {'github.name': 'express'}
  // { $exists: true }
  db.collection('project').find({ 'github.name': { $exists: true } }).toArray(function (err, docs) {
    if (err) return cb(err);
    if (DEBUG) console.log(docs.length, 'projects to process...');
    eachLimit(docs, 10, processProject, function(err) {
      if (err) console.error('Error', err);
      if (DEBUG) console.log('End of the project loop');
      var result = {
        projects: superprojects,
      };
      cb(null, result);
    });
  });
}

function getTags(db, cb) {
  //Fetch projects
  if (!db) return cb(new Error('No db!'));
  db.collection('tag').find({}).toArray(function (err, docs) {
    if (err) return cb(err);
    var result = {
      tags: docs,
    };
    cb(null, result);
  });
}

function fetchData(db, done) {
  //Fetch all data, using parallel requests
  var f1 = function (cb) {
    getProjects(db, function (err, result) {
      cb(null, result.projects);
    });
  };
  var f2 = function (cb) {
    getTags(db, function (err, result) {
      cb(null, result.tags);
    });
  };
  parallel([f1, f2], function (err, results) {
    var json = {
      projects: results[0],
      tags: results[1]
    };
    done(null, json);
  });
}

var getSnapshotData = function(project, snapshotCollection, cb) {
  var d, report;
  d = moment().subtract(30, 'days').toDate();
  d.setHours(0, 0, 0, 0);
  report = {
    stars: 0
  };
  snapshotCollection.find({
    project: project._id,
    createdAt: {$gt: d}
  }).sort({
    createdAt: -1
  }).toArray(function(err, docs) {
     var deltas = createDailyDeltas(docs);
     report = {
       deltas: deltas,
       stars: docs.length > 0 ? docs[0].stars : 0
     };
     return cb(report);
   });
  // options.Snapshot
  // .find()
  //   .where('project').equals(project._id)
  //   .where('createdAt').gt(d)
  //   .sort({
  //     createdAt: -1
  //   })
  //   .exec(function(err, docs) {
  //     var deltas = createDailyDeltas(docs);
  //     report = {
  //       deltas: deltas,
  //       stars: docs.length > 0 ? docs[0].stars : 0
  //     };
  //     return cb(report);
  //   });
};

function createDailyDeltas(snapshots) {
  var deltas, points;
  points = createAllPoints(snapshots);
  deltas = pointsToDeltas(points);
  return deltas;
}

function createAllPoints(snapshots) {
  var points;
  points = snapshots.map(function(doc) {
    return createPoint(doc);
  });
  points.sort(function(a, b) {
    return a.t - b.t;
  });
  return points;
}

function createPoint(snapshot) {
  var point, snapshotDate;
  snapshotDate = new Date(snapshot.createdAt);
  point = {
    stars: snapshot.stars,
    t: getTimeValue(snapshotDate)
  };
  return point;
}

function dateOnly(d) {
  d.setHours(d.getHours() + 9, 0, 0, 0);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getTimeValue(date) {
  var d, delta, moment0, moment1, today;
  d = dateOnly(date);
  today = dateOnly(new Date());
  moment0 = moment(today);
  moment1 = moment(d);
  delta = moment0.diff(moment1, 'days');
  return delta;
}

function pointsToDeltas(points) {
  var deltas, reducer;
  deltas = [];
  reducer = function(pointA, pointB) {
    if (pointA.t > -1) {
      deltas.push(pointA.stars - pointB.stars);
    }
    return pointB;
  };
  points.reduce(reducer, {
    t: -1
  });
  return deltas;
}

//Return the JSON object to save later in the filesystem
function createSuperproject(project, report) {
  var data = {
    name: project.name,//Project name entered in the application (not the one from Github)
    stars: report.stars,
    repository: project.repository,
    deltas: report.deltas.slice(0, 10),
    url: project.github.homepage ? project.github.homepage : '',
    full_name: project.github.full_name,//'strongloop/express' for example.
    description: project.github.description ? project.github.description : project.description,
    pushed_at: project.github.pushed_at,

    //use .pluck to select ids only if populate() is used when making a find() request
    tags: project.tags
    //tags: _.pluck(project.tags, 'code')
  };
  return data;
}

function populateProjects(allProjects, allTags) {
  var populate = function (project) {
    var tags = allTags
      .filter( tag => project.tags.map( tag => tag.toString() ).indexOf(tag._id.toString()) > -1 )
      .map( tag => tag.code );
    return Object.assign({}, project, { tags });
  };
  var projects = allProjects.map( project => populate(project) );
  if (DEBUG) console.log('Populated projects', projects);
  return projects;
}
