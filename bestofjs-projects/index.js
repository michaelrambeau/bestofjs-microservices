require('dotenv').load();
//var argv = require('minimist')(process.argv.slice(2));

var fs = require('fs-extra');

var webtask = require('./bestofjs-projects');

var context = {
  data: {
    //url: argv._[0],
    MONGO_URI: process.env.MONGO_URI,
  }
};

webtask(context, function(err, result) {
  if (err) {
    return console.log(err);
  } else {
    console.log('webtask finished with the status:', result.status);
    saveJson(result, {}, function (err, cb) {
      if (err) return cb();
      console.log('JSON file written');
    });
  }
});

function saveJson(json, options, cb) {

  // I use createOutputStream(file, [options]) from fs-extra package
  // Exactly like createWriteStream, but if the directory does not exist, it's created.
  var writer = fs.createOutputStream('./build/projects.json');
  json.date = new Date();
  writer.write(JSON.stringify(json));
  writer.end();
  cb(null, {
    'msg': 'JSON file created.'
  });
}
