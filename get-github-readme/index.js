require('dotenv').load();

const argv = require('minimist')(process.argv.slice(2));
const webtask = require('./get-github-readme');
const context = {
  data: {
    url: argv._[0],
    username: process.env.GITHUB_USERNAME,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
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
