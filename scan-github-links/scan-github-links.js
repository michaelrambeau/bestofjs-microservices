"use latest";
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

function openInputURL(url, cb) {
  //Open the given URL (where to search for Github links)
  var options = {
    url: url
  };
  request.get(options, function (error, response, body) {
    if (error) cb(error);
    if (response.statusCode !== 200) cb(new Error('Invalid http response'));
    cb(null, body);
  });
}

function getGithubLinks(body) {
  //Return an array of all Github URLs from a given HTML page body.

  var $ = cheerio.load(body);

  //Find all links (jQuery objets)
  var links = $('body').find('a');

  //Get all URLs from links (Cheerio map function produces a new Cheerio object)
  var urls = [];
  links.each( function (i, link) {
    var url = $(link).attr('href');
    urls.push(url);
  } );

  //Filter to keep only Github URLs
  var githubUrls = urls.filter(filterGithubRepoURL).map(getApiUrl);
  return githubUrls;
}

function filterGithubRepoURL(url) {
  //Return true if the URL is a Guthub repository URL
  var re = {
    repo: new RegExp('https\://github\.com/.*/.*'),
    site: new RegExp('https\://github\.com/site/.*')
  };
  if (!re.repo.test(url)) return false;
  return !(re.site.test(url));
}

function getApiUrl(url) {
  //Return the Github API URL from a Github repository URL
  var re=new RegExp('https\://github\.com/([^/]+)/([^/]+)');
  var array = re.exec(url);
  if (array.length < 3) return '';
  var username = array[1];
  var reponame = array[2];
  return 'https://api.github.com/repos/' + username + '/' + reponame;
}

function getGithubDataRepo(url, credentials, cb) {
  //Fetch Github data for a given repository
  console.log('Get Github data', url);
  var options = {
    url: url + '?client_id=' + credentials.client_id + '&client_secret=' + credentials.client_secret,
    headers: {
      'User-Agent': credentials.username,
      'Accept': 'application/vnd.github.quicksilver-preview+json'
    }
  };
  request.get(options, function (error, response, body) {
    if (error) cb(error);
    if (response.statusCode !== 200) cb(new Error('Invalid http response from Github!'));
    try {
      var json = JSON.parse(body);
      cb(null, json);
    }
    catch (error) {
      cb(new Error("Unable to parse JSON response from Github for url #{url}: #{error}"));
    }
  });
}

function getGithubDataAll(urls, credentials, cb) {
  //Fetch Github data for an array of urls
  var projects = [];
  var fn = function (url, cb) {
    getGithubDataRepo(url, credentials, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      var project = {
        name: result.name,
        fullname: result.full_name,
        description: result.description,
        stars: result.watchers,
        pushed_at: result.pushed_at
      };
      projects.push(project);
      cb(null, true);
    });
  };
  async.eachLimit(urls, 10, fn, function (err) {
    if (err) return cb(err);
    cb(null, projects);
  });
}

//Sort repository by star number (called by Array.sort() function)
function sortRepo(repoA, repoB) {
  return - (repoA.stars - repoB.stars);
}

/*
The main function run by the microservice
*/

module.exports = function (context, done) {
  //Define an helper to send the error message
  var sendError = function (msg) {
    done(new Error(msg));
  };

  //Check the input
  var url = context.data.url;
  if (!url) return sendError('No `url` parameter');

  //Check if credentials are provided
  var credentials = {
    username: context.data.username,
    client_id: context.data.client_id,
    client_secret: context.data.client_secret
  };
  if (!credentials.username) return sendError('No Github credentials `username`');
  if (!credentials.client_id) return sendError('No Github credentials `client_id`');
  if (!credentials.client_secret) return sendError('No Github credentials `client_secret`');

  //STEP 1: open the source URL and extract the Github links.
  var f1 = function (callback) {
    openInputURL(url, function(err, body) {
      if (err) return sendError(err.message);
      var links = getGithubLinks(body);
      callback(null, links);
    });
  };

  //STEP 2: Get Github repository data
  var f2 = function (links, cb) {
    getGithubDataAll(links, credentials, function (err, projects) {
      if (err) return sendError(err.message);
      var sortedProjects = projects.sort(sortRepo);
      var json = {
        status: 'OK',
        url: url,
        links: links,
        projects: sortedProjects
      };
      cb(null, json);
    });
  };

  async.waterfall([f1, f2], done);
};
