# "Github ReadMe" micro-service

## Objective

From a given repository URL, return "README.me" content, so that it can be included in any web page.

## Command line to run the task locally

```
babel-node get-github-readme https://github.com/sindresorhus/awesome
```

## micro-service on webtask.io

The "webtask" has been created from Github "raw" code URL

```
wt create https://raw.githubusercontent.com/michaelrambeau/microservices/master/get-github-readme/get-github-readme.js  --secret client_id=*** --secret client_secret=*** --secret username=michaelrambeau
```

Generated URL:

```
https://webtask.it.auth0.com/api/run/wt-***-gmail_com-0/85801138b3a9d89112d0a04eef536d1f?webtask_no_cache=1
```
