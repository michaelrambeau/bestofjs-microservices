require('dotenv').load();
const webtask = require('./user-content-express');

// parse.com credentials
const context = {
  data: {
    application_id: process.env.PARSE_APPLICATION_ID,
    rest_api_key: process.env.PARSE_REST_API_KEY
  }
};

console.log('Starting manually the Express server', context.data);
webtask(context, (err, app) => {
  const PORT = 3000;
  console.log('Express server listening on port', PORT);
  app.listen(PORT);
});
