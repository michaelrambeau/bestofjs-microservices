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

In Github.com README pages, relative links in URL are replaced by absolute links to the resources of the current branch.

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


## Check the result in the browser

Launch the Express web server

```
babel-node get-github-readme/server
```

Check the links and the images in the following links

* http://localhost:3000/?url=https://github.com/caolan/async
* http://localhost:3000/?url=https://github.com/node-inspector/node-inspector
* http://localhost:3000/?url=https://github.com/facebook/flux
* http://localhost:3000/?url=https://github.com/rackt/react-router
* http://localhost:3000/?url=https://github.com/MostlyAdequate/mostly-adequate-guide



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
