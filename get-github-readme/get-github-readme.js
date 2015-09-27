"use latest";
const request = require('request');
//const async = require('async');

var githubRequest = function(project, path, cb) {
  var options, url;
  url = project.repository.replace(/https\:\/\/github.com/, 'https://api.github.com/repos');
  url = `${url}${path}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;
  options = {
    url: url,
    headers: {
      'User-Agent': process.env.GITHUB_USERNAME,
      'Accept': 'application/vnd.github.quicksilver-preview+json'
    }
  };
  console.log('Github request', options);
  request.get(options, function(error, response, body) {
    var json;
    if (!error && response.statusCode === 200) {
      try {
        json = JSON.parse(body);
        return cb(null, json);
      } catch (error1) {
        error = error1;
        return cb(new Error("Unable to parse JSON response from Github for url " + url + ": " + error));
      }
    } else {
      return cb(new Error("Invalid response from Github for url " + url));
    }
  });
};


const getGithubReadme = function(project, cb) {
  githubRequest(project, '/readme', function(err, json) {
    var buffer, readme;
    if (err) {
      return cb(err);
    } else {
      buffer = new Buffer(json.content, 'base64');
      readme = buffer.toString('utf8');
      return cb(null, readme);
    }
  });
};

var getReadMe = function (project, cb) {
  getGithubReadme(project, function (err, readme) {
    if (err) console.log(err);
    console.log(readme);
    var root = project.repository;

    //Replace relative URL by absolute URL
    var getImagePath = function (url) {
      var path = url;

      //If the URL is absolute (start with http), we do nothing...
      if (path.indexOf('http') === 0) return path;

      //Special case: in Faceboox Flux readme, relative URLs start with './'
      //so we just remove './' from the UL
      if (path.indexOf('./') === 0) path = path.replace(/.\//, '');

      //...otherwise we create an absolute URL to the "raw image
      // example: images in "You-Dont-Know-JS" repo.
      return root + '/raw/master/' + path;
    };
    readme = readme.replace(/src=\"(.+?)\"/gi, function(match, p1) {
      return 'src="'+ getImagePath(p1) + '"';}
    );

    //data.readme = err ? 'Unable to access README.' : readme;
    cb(null, readme);
  });
};

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

  const project = {
    repository: url
  };
  getReadMe(project, function (err, result) {
    done(err, result);
  });

};
