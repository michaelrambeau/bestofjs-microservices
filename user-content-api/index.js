require('dotenv').load();
const webtask = require('./user-content-express');

// parse.com credentials
const context = {
  data: {
    applicationId: process.env.PARSE_APPLICATION_ID,
    restAPIKey: process.env.PARSE_RESTAPI_KEY
  }
};

console.log('Starting manually the Express server', context.data);
const app = webtask(context);
const PORT = 3000;
console.log('Express server listening on port', PORT);
app.listen(PORT);
