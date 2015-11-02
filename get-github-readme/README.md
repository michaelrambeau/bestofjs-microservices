# "Get Github README" micro-service

## Objective

From a given repository URL, return "README.md" content in HTML, so that it can be included in any web page.

## The problems

### Links to anchors `<a href="#quickstart">`

Links to anchor have to be replaced by absolute URLs.

Example 1: [node-inspector](https://github.com/node-inspector/node-inspector)

`<a href="#quick-start">Quick Start</a>` => `<a href="https://github.com/node-inspector/node-inspector#quick-start">Quick Start</a>`

Example 2: [react-router](https://github.com/rackt/react-router)

### Relative links

When Github.com renders README pages, relative links in URL are replaced by absolute links to the resources of the current branch.

Example 1: Mostly adequate guide to FP

[Github API](https://api.github.com/repos/MostlyAdequate/mostly-adequate-guide/readme)

```
<img src="images/cover.png" alt="cover" style="max-width:100%;">
```

[README page](https://github.com/MostlyAdequate/mostly-adequate-guide)

```
<img src="/MostlyAdequate/mostly-adequate-guide/raw/master/images/cover.png" alt="cover" style="max-width:100%;">
```

But when calling Github API, relative links are not replaced, so we have to process the links by ourselves!

Example 2: [Flux](https://github.com/facebook/flux)

### Anchors in async README

TODO


## Check the result in the browser

STEP 1: launch the Express web server

```
babel-node get-github-readme/server
```

STEP 2: check the links and the images in the following pages

* http://localhost:3000/?url=https://github.com/caolan/async
* http://localhost:3000/?url=https://github.com/node-inspector/node-inspector
* http://localhost:3000/?url=https://github.com/facebook/flux
* http://localhost:3000/?url=https://github.com/rackt/react-router
* http://localhost:3000/?url=https://github.com/MostlyAdequate/mostly-adequate-guide
* http://localhost:3000/?url=https://github.com/acdlite/recompose



## Command line to run the task locally

```
babel-node get-github-readme https://github.com/sindresorhus/awesome
```

## micro-service on webtask.io

The "webtask" has been created from Github "raw" code URL.

### `master` branch => production (used by bestofjs.org)

```
wt create https://raw.githubusercontent.com/michaelrambeau/microservices/master/get-github-readme/get-github-readme.js  --secret client_id=*** --secret client_secret=*** --secret username=michaelrambeau
```

Generated URL:

```
https://webtask.it.auth0.com/api/run/wt-***-gmail_com-0/85801138b3a9d89112d0a04eef536d1f?webtask_no_cache=1
```

### `dev` branch => developpement (local)

```
wt create https://raw.githubusercontent.com/michaelrambeau/microservices/dev/get-github-readme/get-github-readme.js  --secret client_id=*** --secret client_secret=*** --secret username=michaelrambeau
```

Generated URL:

```
https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/d4bf0bb7021ce02e77d5e2dceac010c7?webtask_no_cache=1
```
