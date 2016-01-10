'use latest';

const express = require('express');
const Webtask = require('webtask-tools'); /* express app as a webtask */
const Auth0 = require('auth0');
const bodyParser = require('body-parser');
require('isomorphic-fetch');

// expose the express app as a webtask-compatible function if we are not in local
module.exports = process.env.NODE_ENV === 'bestofjs' ? (
  createServer // local environment => run a local Express server
) : (
  Webtask.fromExpress(createServer) // webtask.io environment
);

function createServer(context) {
  const credentials = context.data;
  const app = express();
  app.use(tokenMiddleware);

  // parse application/json
  app.use(bodyParser.json());

  const apiFetch = parseApiFetch(credentials);

  // GET: used to check the user profile,
  // for debugging purpose / monitoring the microservice
  app.get('/', function (req, res) {
    res.send(res.userProfile);
  });

  // GET: show all reviews
  app.get('/reviews', function (req, res) {
    console.log('Fetch reviews...');
    const settings = {
      url: '/classes/Review'
    };
    apiFetch(settings)
      .then(response => response.json())
      .then(json => res.send(json))
      .catch(err => res.status(err.statusCode).send(err.message));
  });

  // POST: create a new review
  app.post('/reviews', function (req, res) {
    const data = Object.assign({}, req.body, {
      createdBy: res.userProfile.nickname
    });
    console.log('POST request', data);
    const settings = {
      url: '/classes/Review',
      method: 'POST',
      body: data
    };
    apiFetch(settings)
      .then(response => response.json())
      .then(json => res.send(json))
      .catch(err => res.status(err.statusCode).send(err.message));
  });

  // PUT: update an existing review
  app.put('/reviews/:id', function (req, res) {
    const data = Object.assign({}, req.body, {
      updatedBy: res.userProfile.nickname
    });
    const id = req.params.id;
    console.log('PUT request to edit', id, data);
    const settings = {
      url: `/classes/Review/${id}`,
      method: 'PUT',
      body: data
    };
    apiFetch(settings)
      .then(response => response.json())
      .then(json => res.send(json))
      .catch(err => res.status(err.statusCode).send(err.message));
  });

  return app;
}

// Return a function used to make API calls, using `fetch` from `isomorphic-fetch` module
function parseApiFetch(credentials) {
  return function (settings) {
    console.log('API request', settings);
    const API_BASE_URL = 'https://api.parse.com/1';
    const defaultOptions = {
      method: 'GET',
      url: null,
      body: null,
      callback: null
    };
    const opts = Object.assign({}, defaultOptions, settings);

    const reqOpts = {
      method: opts.method,
      headers: {
        'X-Parse-Application-Id': credentials.application_id,
        'X-Parse-REST-API-Key': credentials.rest_api_key
      }
    };

    if (opts.method === 'POST' || opts.method === 'PUT') {
      reqOpts.headers['Accept'] = 'application/json';
      reqOpts.headers['Content-Type'] = 'application/json';
    }

    if (opts.body) {
      reqOpts.body = JSON.stringify(opts.body);
    }

    return fetch(API_BASE_URL + opts.url, reqOpts);
  };
}

function getUserProfile(token, done) {
  if (!token) return done(new Error('Token is missing!'));
  const options = {
    domain: 'bestofjs.auth0.com',
    userAccessToken: token
  };
  console.log('Auth0 API call', options);
  Auth0.getUserInfo(options, function (err, profile) {
    if (err) return done(err);
    done(null, profile);
  });
}

// Middleware applied to all routes
// Check the token from request headers and update the `res` object with the user profile.
function tokenMiddleware(req, res, done) {
  const token = req.headers.token;
  if(!token) return res.status(401).send('Token is required!');
  console.log('Checking access_token', token);
  getUserProfile(token, (err, profile) => {
    if (err) return res.status(err.statusCode).send('Authentication error!');
    res.userProfile = profile;
    done(null, profile);
  });
}
