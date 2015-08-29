# File used to test in local the micro-service.
# From the root folder run `coffee scan-github-links https://github.com/cheeaun/mooeditable/wiki/Javascript-WYSIWYG-editors`

require('dotenv').load()
argv = require('minimist')(process.argv.slice(2));
webtask = require './scan-github-links'

context =
  data:
    url: argv._[0]
    username: process.env.GITHUB_USERNAME
    client_id: process.env.GITHUB_CLIENT_ID
    client_secret: process.env.GITHUB_CLIENT_SECRET

webtask context, (err, result) ->
  if err
    console.log err
  else
    console.log 'webtask finished with the status:', result.status
    console.log result
