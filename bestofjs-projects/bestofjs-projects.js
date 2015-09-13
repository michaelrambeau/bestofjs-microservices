"use latest";
var MongoClient = require('mongodb').MongoClient;
var {waterfall, parallel}   = require('async');

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
        projects: result.projects,
        tags: result.tags
      };
      cb(null, json);
      //db.close();
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
  if (!db) return cb(new Error('No db!'));
  db.collection('Superproject').find({}).toArray(function (err, docs) {
    if (err) return cb(err);
    var result = {
      projects: docs,
    };
    cb(null, result);
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
