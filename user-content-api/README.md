## user-content-api microservice

This microservice is used to manage user-generated content: reviews and links.
Basically, it is a REST API built with an Express web server listening for requests POST and PULL requests.

#### Command line used to deploy the service on webtask.io

Production (using the code from the `master` branch):

```
wt create https://raw.githubusercontent.com/michaelrambeau/bestofjs-microservices/master/user-content-api/user-content-express.js  --secret application_id=*** --secret rest_api_key=***
```

#### Microservice url

Production

```
https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/d3dfe580f1eaa143b3dfb176f454ab66?webtask_no_cache=1
```
