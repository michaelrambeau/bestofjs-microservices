# Micro-services with webtask.io

Running node.js micro-services using webtask.io.

## How to create your first micro-service with webtask.io

Requirement: sign up to [webtask.io](https://webtask.io/) (using your Github account for example).

STEP 1. Create a basic JavaScript file with a callback that returns a JSON object.

```js

module.exports = function (cb) {
  var json = {
    status: 'OK'
  };
  cb(null, json);
};
```

STEP 2. Install the command line tool

```
npm install wt-cli -g

```

STEP 3. Login from the command line

```
wt init ****r@gmail.com

```

STEP 4. Check your email and enter the verification number (6 digits).

STEP 5. Create the webtask, from the local JavaScript file.

```
wt create index.js
```

=> an URL is generated to launch the webtask!

```
curl https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/index
?webtask_no_cache=1
```
