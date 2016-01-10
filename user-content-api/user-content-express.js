"use latest";

const express = require('express');
const Webtask = require('webtask-tools'); /* express app as a webtask */
const bodyParser = require('body-parser');
const _ = require('lodash');
require('isomorphic-fetch');

// expose the express app as a webtask-compatible function if we are not in local
module.exports = process.env.NODE_ENV === 'bestofjs' ? (
  createServer // local environment => run a local Express server
) : (
  Webtask.fromExpress(createServer()) // webtask.io environment
);

function createServer(context) {
  console.log('START the Express server v2015-01-11');
  const app = express();

  // Apply custom middlewares to check user token and context credentials
  app.use(tokenMiddleware);
  app.use(credentialsMiddleware(context));

  // body-parser middleware to parse `application/json` content type
  app.use(bodyParser.json());

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
    const apiFetch = parseApiFetch(res.credentials);
    apiFetch(settings)
      .then(json => res.send(json))
      .catch(err => res.status(400).send(err.message));
  });

  // POST: create a new review
  app.post('/reviews', function (req, res) {
    const data = {};
    _.assign(data, req.body, {
      createdBy: res.userProfile.nickname
    });
    console.log('POST request', data);
    const settings = {
      url: '/classes/Review',
      method: 'POST',
      body: data
    };
    const apiFetch = parseApiFetch(res.credentials);
    apiFetch(settings)
      .then(json => res.send(json))
      .catch(err => res.status(400).send(err.message));
  });

  // PUT: update an existing review
  app.put('/reviews/:id', function (req, res) {
    const id = req.params.id;
    console.log('PUT request', id);
    const data = {};
    _.assign(data, req.body, {
      updatedBy: res.userProfile.nickname
    });
    console.log('Data to update', data);
    const settings = {
      url: `/classes/Review/${id}`,
      method: 'PUT',
      body: data
    };
    const apiFetch = parseApiFetch(res.credentials);
    apiFetch(settings)
      .then(json => res.send(json))
      .catch(err => res.status(400).send(err.message));
  });

  app.all('*', (req, res) => res.status(404).send('Bad request!'));

  return app;
}

// Return a function used to make API calls, using `fetch` from `isomorphic-fetch` module
function parseApiFetch(credentials) {
  return function (settings) {
    console.log('API request', settings);
    if (!credentials) throw new Error('No credentials passed to `parseFetch()!`');
    const API_BASE_URL = 'https://api.parse.com/1';
    const defaultOptions = {
      method: 'GET',
      url: null,
      body: null,
      callback: null
    };

    const opts = {};
    _.assign(opts, defaultOptions, settings);

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

    console.log('Fetching', reqOpts);
    return fetch(API_BASE_URL + opts.url, reqOpts)
      .then(response => checkStatus(response))
      .then(response => response.json());
  };
}

// Get user profile from `id_token` (16 characters token)
function getUserProfile(token, done) {
  if (!token) return done(new Error('Token is missing!'));
  console.log('Auth0 API call...');
  const options = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  const url = 'https://bestofjs.auth0.com/userinfo';
  fetch(url, options)
    .then(response => checkStatus(response))
    .then(response => response.json())
    .then(json => done(null, json))
    .catch(err => done(err));
}

//
// Middleware applied to all routes
//

// Check the token from request headers and update the `res` object with the user profile.
function tokenMiddleware(req, res, done) {
  const token = req.headers.token;
  if (!token) return res.status(401).send('Token is required!');
  console.log('Checking access_token', token);
  getUserProfile(token, function (err, profile) {
    if (err) return res.status(401).send('Authentication error');
    if (!profile) return res.status(401).send('No user profile');
    console.log('Auth0 Response OK!', profile.nickname);
    res.userProfile = profile;
    done();
  });
}

// Check if parse.com credentials are in the context
// and add them to reponse object
function credentialsMiddleware(context) {
  return function (req, res, done) {
    const reqContext = context || req.webtaskContext;
    const credentials = reqContext.data;
    if (!credentials) return res.status(401).send('No credentials!');
    if (!credentials.application_id) return res.status(401).send('No `application_id` key!');
    if (!credentials.rest_api_key) return res.status(401).send('No `rest_api_key` key!');
    res.credentials = credentials;
    done();
  };
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}
