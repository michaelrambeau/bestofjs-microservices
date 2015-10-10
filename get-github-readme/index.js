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

const t0 = process.hrtime();

console.log('Starting manually the webtask', context.data);

webtask(context, function(err, result) {
  if (err) {
    return console.log(err);
  } else {
    const t1 = process.hrtime(t0);
    console.log('Result length', result.readme.length);
    console.log('Duration (s):', (t1[0] + t1[1] / 1e9).toFixed(2));
  }
});
