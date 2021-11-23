[![Build Status](https://travis-ci.com/vtfk/elevmappa-api.svg?branch=master)](https://travis-ci.com/vtfk/elevmappa-api)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

# elevmappa-api

Lambda for returning all your students. Used in [elevmappa](https://github.com/vtfk/elevmappa-web).
Supports multiple 360° instances.

## API

All calls requires a valid bearer token from Azure

### ```GET /api/students```

Returns an array of students

```JavaScript
[
 {
    "firstName": "Helga",
    "middleName": null,
    "lastName": "Durk",
    "fullName": "Helga Durk",
    "personalIdNumber": "02059711111",
    "mobilePhone": "+4798888888",
    "mail": "helgad@hotmail.com",
    "userName": "0205helgdurk",
    "contactTeacher": false,
    "unitId": "BAMVS",
    "unitName": "Bamble vgs. avd. Grasmyr",
    "organizationNumber": "NO974568098",
    "mainGroupName": "BAMVS:3ST",
    "groups": [
      {
        "id": "BAMVS:3ST/151FSP5098",
        "description": "Spansk I+II",
        "unitId": "BAMVS",
        "unitName": "Bamble vgs. avd. Grasmyr",
        "organizationNumber": "NO974568098",
        "contactTeacher": false
      }
    ]
 },
 {
    "firstName": "Halgrim",
    "middleName": "",
    "lastName": "Durk",
    "fullName": "Halgrim Durk",
    "personalIdNumber": "02109911111",
    "mobilePhone": "+4741111111",
    "mail": "halgrimdurk@gmail.com",
    "userName": "0101durk",
    "contactTeacher": true,
    "unitId": "BAMVS",
    "unitName": "Bamble vgs. avd. Grasmyr",
    "organizationNumber": "NO974568098",
    "mainGroupName": "BAMVS:1ST",
    "groups": [
      {
        "id": "BAMVS:1ST/151FSP5091",
        "description": "Spansk I, 1. år",
        "unitId": "BAMVS",
        "unitName": "Bamble vgs. avd. Grasmyr",
        "organizationNumber": "NO974568098",
        "contactTeacher": true
      }
    ]
  }
]
```

### ```GET /api/students/:id```

Returns an object of given student with available documents

```JavaScript
{
  "firstName": "Helge Grim",
  "middleName": null,
  "lastName": "Grim",
  "fullName": "Helge Grim",
  "personalIdNumber": "02059711111",
  "mobilePhone": "+4798888888",
  "mail": "helgeg@hotmail.com",
  "userName": "0205helgeg",
  "contactTeacher": false,
  "unitId": "BAMVS",
  "unitName": "Bamble vgs. avd. Grasmyr",
  "organizationNumber": "NO974568098",
  "mainGroupName": "BAMVS:3ST",
  "groups": [
    {
      "id": "BAMVS:3ST/151FSP5098",
      "description": "Spansk I+II",
      "unitId": "BAMVS",
      "unitName": "Bamble vgs. avd. Grasmyr",
      "organizationNumber": "NO974568098",
      "contactTeacher": false
    }
  ],
  "documents": [
    {
      "source": "TFK",
      "id": "16/03875-1",
      "title": "Lullabies from the edge",
      "files": [
        {
          "from": "PPT",
          "to": "Bamble Videregående skole",
          "title": "Sakkyndig vurdering.pdf",
          "file": "1234"
        }
      ]
    },
    {
      "source": "TFK",
      "id": "16/03875-2",
      "title": "Salige reker",
      "files": [
        {
          "from": "PPT",
          "to": "Bamble Videregående skole",
          "title": "Sakkyndig vurdering.pdf",
          "file": "1234"
        }
      ]
    },
    {
      "source": "VTFK Sikker",
      "id": "20/00345-1",
      "title": "It came from Søre Ål",
      "files": [
        {
          "from": "PPT",
          "to": "Bamble Videregående skole",
          "title": "Sakkyndig vurdering.pdf",
          "file": "1234"
        }
      ]
    }
  ]
}
```

## Setup

You'll need an azure tenant and a jwt and endpoint url for your Tjommi service.

Environment

```
TJOMMI_SERVICE_URL=https://tjommi.service.io
TJOMMI_JWT_SECRET=Louie Louie, oh no, I got to go Louie Louie, oh no, I got to go
MOA_TENANT_ID=your-azure-tenant
MOA_APP_ID=your-app-id
P360_TFK_ENABLED=false
P360_TFK_WS_USERNAME=username
P360_TFK_WS_PASSWORD=password
P360_TFK_WS_BASE_URL=http://p360server/SI.WS.Core/SIF/
P360_TFK_TYPE=SOAP
P360_VTFKINT_ENABLED=true
P360_VTFKINT_TOKEN=token-from-P360
P360_VTFKINT_WS_BASE_URL=p360.no
P360_VTFKINT_TYPE=RPC
PAPERTRAIL_HOST=example.papertrailapp.com
PAPERTRAIL_PORT=port
PAPERTRAIL_HOSTNAME=minelev-elevmappa
MONGODB_CONNECTION=mongodb+srv://<user>:<pwd>@<mongoserver>?retryWrites=true&w=majority
MONGODB_NAME=minelev-elevmappa
MONGODB_COLLECTION=minelev-elevmappa
DEMO=false
DEMO_USER=noen.andre@vtfk.no
DEMO_ACCESS_GROUPS=HJV-TILGANGELEVMAPPA,KRV-TILGANGELEVMAPPA
```

## DEMO

:warning: `DEMO mode will bypass authorization check and ALL calls will be performed as DEMO_USER. DO NOT USE IN PRODUCTION`

When debugging locally there can be conveniant to experience exactly what a end-user sees.

Set `DEMO` to **true** and `DEMO_USER` to **end-users email address** in `.env`

If you want to debug end-user as a **rådgiver**, set `DEMO_ACCESS_GROUPS` to a comma separated list. See example above in *Setup\Environment*

Set `DEMO_SKIP_DB` to **true** to disable logging to mongo `OR` **false** to enable logging

## Docker local build

### Build docker image
```
docker build --tag elevmappa-api .
```

### Run docker image
```
docker run -d -p 8080:8080 -it elevmappa-api
```

## Related

- [minelev-tjommi-api](https://github.com/telemark/minelev-tjommi-api) - Tjommi service for MinElev

## License

[MIT](LICENSE)
