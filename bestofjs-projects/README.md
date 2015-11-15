## bestofjs-projects webtask

Microservice that returns Github project data to be consumed by the web application.
Used to generate `projects.json` file that will be pushed to Github pages later.
JSON format:

```
{
    "status": "OK",
    "projects": [
        {
            "name": "Express",
            "stars": 21524,
            "repository": "https://github.com/strongloop/express",
            "deltas": [
                8,
                15,
                19,
                5,
                16,
                17,
                14,
                6,
                12,
                23
            ],
            "url": "http://expressjs.com",
            "full_name": "strongloop/express",
            "description": "Fast, unopinionated, minimalist web framework for node.",
            "pushed_at": "2015-11-13T21:36:08.000Z",
            "tags": [
                null
            ]
        }
    ],
    "tags": [
        {
            "_id": "5568e479355ea6282ecae9a9",
            "name": "Utils",
            "description": "Utilis, swiss army tools...",
            "createdAt": "2015-05-04T00:00:00.000Z",
            "updatedAt": "2015-10-10T22:39:35.431Z",
            "code": "util",
            "updatedBy": "557280100218e0175774f1de"
        }
      ],
      "date": "2015-11-15T02:44:35.897Z"
    }        
```

Before it was a static JSON file pushed on a static hosting service (divshot.io)
