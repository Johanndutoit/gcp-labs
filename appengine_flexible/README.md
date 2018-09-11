# App Engine Flexible / Veikkaus Infra+Dev training

## Before running anything in this repository

Load the environment variables:

```sh
export ENV=qvik # qvik, veikkaus
source init.environment
```

## Enable App Engine Flexible

The app engine service flexible service is disabled in your project, to enable run:

```sh
gcloud services enable appengineflex.googleapis.com \
--project=$PROJECT_ID
```

## Deploying and run on App Engine

Then deploy to App Engine Flexible using:

```sh
gcloud --project=$PROJECT_ID app deploy app.yaml
```

Which will then build the app and run it on: 

[https://$PROJECT_ID.appspot.com](https://$PROJECT_ID.appspot.com)

## Deploy a change and promote to live

Edit the version number in `index.html` from:

```html
<p>Hello World from NGINX - v1</p>
```

to:

```html
<p>Hello World from NGINX - v2</p>
```

then run the following command to deploy your changes:

```sh
gcloud --project=$PROJECT_ID app deploy --no-promote app.yaml
```

once done this will have deployed a app 

## List the versions

To list the deployed versions on your app, first pull all the services:

```sh
gcloud --project=$PROJECT_ID app versions list
```

Then revert back to the previous flexible version to see `Hello World from NGINX - v1` as the output again