require('dotenv').load();
//var argv = require('minimist')(process.argv.slice(2));

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
    return console.log(result);
  }
});
