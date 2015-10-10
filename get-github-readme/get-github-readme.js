"use latest";
const request = require('request');

//Generic function to make a Github request for a given repository
//Parameters:
// - repo: full URL of the Github repository
// - path (optional): added to the repository (ex: '/readme')
const githubRequest = function(repo, path, options, cb) {
  const { credentials } = options;
  let url = repo.replace(/https\:\/\/github.com/, 'https://api.github.com/repos');
  url = `${url}${path}?client_id=${credentials.client_id}&client_secret=${credentials.client_secret}`;
  var requestOptions = {
    url: url,
    headers: {
      'User-Agent': credentials.username,
      'Accept': 'application/vnd.github.VERSION.html'
    }
  };
  console.log('Github request', requestOptions);
  request.get(requestOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('==> response OK!!!', body.length);
      return cb(null, body);
    } else {
      return cb(new Error("Invalid response from Github for url " + url));
    }
  });
};


const getGithubReadme = function(project, options, cb) {
  githubRequest(project, '/readme', options, function(err, text) {
    if (err) {
      return cb(err);
    } else {
      return cb(null, text);
    }
  });
};

var getReadMe = function (repo, options, cb) {
  getGithubReadme(repo, options, function (err, readme) {
    if (err) return cb(err);

    var root = repo;

    //STEP1: replace relative anchor link URL
    //[Quick Start](#quick-start) => [Quick Start](https://github.com/node-inspector/node-inspector#quick-start)"
    readme = readme.replace(/<a href="\#([^"]+)">/gi, function(match, p1) {
      console.log('Replace link relative anchors', p1);
      return `<a href="${root}#${p1}">`;
    });
    //STEP1.2: replace relative link URL
    //[Guides and API Docs](/docs) => [Guides and API Docs](https://github.com/rackt/react-router/tree/master/docs)"
    readme = readme.replace(/<a href="\/(.+?)">/gi, function(match, p1) {
      console.log('Replace link relative URL', p1);
      return `<a href="${root}/blob/master/${p1}">`;
    });

    //markdown images seen on https://github.com/MostlyAdequate/mostly-adequate-guide
    //![cover](images/cover.png)] => ![cover](https://github.com/MostlyAdequate/mostly-adequate-guide/raw/master/images/cover.png)
    readme = readme.replace(/\!\[(.+?)\]\(\/(.+?)\)/gi, function(match, p1, p2) {
      console.log('Replace md image relative URL', p1);
      return `[${p1}](${root}/blob/master/${p2})`;
     });



    //STEP2: replace relative image URL
    readme = readme.replace(/src=\"(.+?)\"/gi, function(match, p1) {
      console.log('Replace image relative URL', p1);
      return 'src="'+ getImagePath(root, p1) + '"';
    });

    //STEP3 remove self closed anchors (seen on async repo)
    //the regexp matches: <a name=\"forEach\"> and <a name="forEach">
    readme = readme.replace(/<a name=\\?"(.+?)\\?" \/>/gi, function(match, p1) {
      console.log('Remove self closed anchor', p1);
      return '';
    });
    //matches <a name="constant">
    readme = readme.replace(/<a name="(.+?)">/gi, function(match, p1) {
      console.log('Remove anchor', p1);
      return '';
    });


    //data.readme = err ? 'Unable to access README.' : readme;
    cb(null, readme);
  });
};

//Replace relative URL by absolute URL
function getImagePath (root, url) {
  var path = url;

  //If the URL is absolute (start with http), we do nothing...
  if (path.indexOf('http') === 0) return path;

  //Special case: in Faceboox Flux readme, relative URLs start with './'
  //so we just remove './' from the UL
  if (path.indexOf('./') === 0) path = path.replace(/.\//, '');

  //...otherwise we create an absolute URL to the "raw image
  // example: images in "You-Dont-Know-JS" repo.
  return root + '/raw/master/' + path;
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

  const options = {
    credentials
  };
  getReadMe(url, options, function (err, readme) {
    if (err) console.log(err);
    var result = {
      readme: readme
    };
    done(err, result);
  });

};
