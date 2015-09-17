## Objective

Goal: write a service that scans a web page, checks all the links to Github repositories and returns a list repositories with their stars, using Github API.

* Input: any webpage URL (string), POST or GET parameter
* Output: the list if Github repositories in the page (json)

## About the Github API

Credentials are needed to make Github API requests:

* Github username
* client_id
* client_secret

Example of response returned by Github API: https://api.github.com/repos/strongloop/express

```js

{
  "id": 237159,
  "name": "express",
  "full_name": "strongloop/express",
  "owner": {
    "login": "strongloop",
    "id": 3020012,
    "avatar_url": "https://avatars.githubusercontent.com/u/3020012?v=3",
    "gravatar_id": "",
    "url": "https://api.github.com/users/strongloop",
    "html_url": "https://github.com/strongloop",
    "followers_url": "https://api.github.com/users/strongloop/followers",
    "following_url": "https://api.github.com/users/strongloop/following{/other_user}",
    "gists_url": "https://api.github.com/users/strongloop/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/strongloop/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/strongloop/subscriptions",
    "organizations_url": "https://api.github.com/users/strongloop/orgs",
    "repos_url": "https://api.github.com/users/strongloop/repos",
    "events_url": "https://api.github.com/users/strongloop/events{/privacy}",
    "received_events_url": "https://api.github.com/users/strongloop/received_events",
    "type": "Organization",
    "site_admin": false
  },
  "private": false,
  "html_url": "https://github.com/strongloop/express",
  "description": "Fast, unopinionated, minimalist web framework for node.",
  "fork": false,
  "url": "https://api.github.com/repos/strongloop/express",
  "forks_url": "https://api.github.com/repos/strongloop/express/forks",
  "keys_url": "https://api.github.com/repos/strongloop/express/keys{/key_id}",
  "collaborators_url": "https://api.github.com/repos/strongloop/express/collaborators{/collaborator}",
  "teams_url": "https://api.github.com/repos/strongloop/express/teams",
  "hooks_url": "https://api.github.com/repos/strongloop/express/hooks",
  "issue_events_url": "https://api.github.com/repos/strongloop/express/issues/events{/number}",
  "events_url": "https://api.github.com/repos/strongloop/express/events",
  "assignees_url": "https://api.github.com/repos/strongloop/express/assignees{/user}",
  "branches_url": "https://api.github.com/repos/strongloop/express/branches{/branch}",
  "tags_url": "https://api.github.com/repos/strongloop/express/tags",
  "blobs_url": "https://api.github.com/repos/strongloop/express/git/blobs{/sha}",
  "git_tags_url": "https://api.github.com/repos/strongloop/express/git/tags{/sha}",
  "git_refs_url": "https://api.github.com/repos/strongloop/express/git/refs{/sha}",
  "trees_url": "https://api.github.com/repos/strongloop/express/git/trees{/sha}",
  "statuses_url": "https://api.github.com/repos/strongloop/express/statuses/{sha}",
  "languages_url": "https://api.github.com/repos/strongloop/express/languages",
  "stargazers_url": "https://api.github.com/repos/strongloop/express/stargazers",
  "contributors_url": "https://api.github.com/repos/strongloop/express/contributors",
  "subscribers_url": "https://api.github.com/repos/strongloop/express/subscribers",
  "subscription_url": "https://api.github.com/repos/strongloop/express/subscription",
  "commits_url": "https://api.github.com/repos/strongloop/express/commits{/sha}",
  "git_commits_url": "https://api.github.com/repos/strongloop/express/git/commits{/sha}",
  "comments_url": "https://api.github.com/repos/strongloop/express/comments{/number}",
  "issue_comment_url": "https://api.github.com/repos/strongloop/express/issues/comments{/number}",
  "contents_url": "https://api.github.com/repos/strongloop/express/contents/{+path}",
  "compare_url": "https://api.github.com/repos/strongloop/express/compare/{base}...{head}",
  "merges_url": "https://api.github.com/repos/strongloop/express/merges",
  "archive_url": "https://api.github.com/repos/strongloop/express/{archive_format}{/ref}",
  "downloads_url": "https://api.github.com/repos/strongloop/express/downloads",
  "issues_url": "https://api.github.com/repos/strongloop/express/issues{/number}",
  "pulls_url": "https://api.github.com/repos/strongloop/express/pulls{/number}",
  "milestones_url": "https://api.github.com/repos/strongloop/express/milestones{/number}",
  "notifications_url": "https://api.github.com/repos/strongloop/express/notifications{?since,all,participating}",
  "labels_url": "https://api.github.com/repos/strongloop/express/labels{/name}",
  "releases_url": "https://api.github.com/repos/strongloop/express/releases{/id}",
  "created_at": "2009-06-26T18:56:01Z",
  "updated_at": "2015-08-28T23:43:41Z",
  "pushed_at": "2015-08-25T18:03:25Z",
  "git_url": "git://github.com/strongloop/express.git",
  "ssh_url": "git@github.com:strongloop/express.git",
  "clone_url": "https://github.com/strongloop/express.git",
  "svn_url": "https://github.com/strongloop/express",
  "homepage": "http://expressjs.com",
  "size": 20997,
  "stargazers_count": 20419,
  "watchers_count": 20419,
  "language": "JavaScript",
  "has_issues": true,
  "has_downloads": true,
  "has_wiki": true,
  "has_pages": false,
  "forks_count": 4014,
  "mirror_url": null,
  "open_issues_count": 83,
  "forks": 4014,
  "open_issues": 83,
  "watchers": 20419,
  "default_branch": "master",
  "organization": {
    "login": "strongloop",
    "id": 3020012,
    "avatar_url": "https://avatars.githubusercontent.com/u/3020012?v=3",
    "gravatar_id": "",
    "url": "https://api.github.com/users/strongloop",
    "html_url": "https://github.com/strongloop",
    "followers_url": "https://api.github.com/users/strongloop/followers",
    "following_url": "https://api.github.com/users/strongloop/following{/other_user}",
    "gists_url": "https://api.github.com/users/strongloop/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/strongloop/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/strongloop/subscriptions",
    "organizations_url": "https://api.github.com/users/strongloop/orgs",
    "repos_url": "https://api.github.com/users/strongloop/repos",
    "events_url": "https://api.github.com/users/strongloop/events{/privacy}",
    "received_events_url": "https://api.github.com/users/strongloop/received_events",
    "type": "Organization",
    "site_admin": false
  },
  "network_count": 4014,
  "subscribers_count": 1249
}
```


## Developing the micro service

### Algorithm

* From the input URL, make a http request to open the web page content
* Parse the content, searching for all links
* Filter the links, to keep only Github repository links
* Call Github API for every repository
* Return a JSON object that contains an array of Github project data (including repository name and number of stars)

### Read input

```
module.exports = function (context, cb) {
  var url = context.data.url;
  var json = {
    status: 'OK',
    url: url
  };
  cb(null, json);
};
```

### Running the micro-service in local

Run `npm install` to install the following modules:

* request
* cheerio
* async
* dotenv

Secret keys are loaded using `dotenv` module, from the `.env` file

```
GITHUB_CLIENT_ID=***
GITHUB_CLIENT_SECRET=***
GITHUB_USERNAME=***
```

Launch the following command from the project root folder:

```
coffee scan-github-links/index.coffee  https://github.com/cheeaun/mooeditable/wiki/Javascript-WYSIWYG-editors
```


### Pass Github credential to webtask.io

Secret are passed to the task when the task is created.

```
wt create scan-github-links.js  --secret client_id=*** --secret client_secret=*** --secret username=***
```
