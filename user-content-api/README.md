## user-content-api microservice

This microservice is used to manage user-generated content: reviews and links.
Basically, it is a REST API built with an Express web server listening for requests POST and PULL requests.

#### Command line used to deploy the service on webtask.io

Don't forget to add the extra parameters `--no-parse --no-merge`, as mentioned in this page: https://github.com/auth0/wt-cli/tree/master/sample-webtasks#expressjs

Otherwise JSON body parsing middleware will fail silently... it was really difficult to debug!

Production (using the code from the `master` branch):

```
wt create https://raw.githubusercontent.com/michaelrambeau/bestofjs-microservices/master/user-content-api/user-content-express.js  --secret application_id=*** --secret rest_api_key=*** --no-parse --no-merge
```

#### Microservice URLs

Production

```
https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/d3dfe580f1eaa143b3dfb176f454ab66?webtask_no_cache=1
```

Dev

```
https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/8df41e6c061eb057d6dfe22c85815057?webtask_no_cache=1
```
