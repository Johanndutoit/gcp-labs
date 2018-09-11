# Datastore / Veikkaus Infra+Dev training

## Before running anything in this repository

Load the environment variables:

```sh
export ENV=qvik # qvik, veikkaus
source init.environment
```

## Take a look at the source for the example app

Take some time to understand how the app is querying the datastore in `index.js`.

The following routes exist:

* / - lists all contacts (with the upper of a 1000 as imposed by Datastore per query)
* /add - displays a form and the POST handles adding a new contact
* /edit/<contact-id> - displays a form to edit and the POST handles editing a contact
* /delete/<contact-id> - just deletes the requested contact and redirects back to the homepage where the contacts are listed

## Deploy the app to App Engine Standard

```sh
gcloud app deploy app.yaml \
--project=$PROJECT_ID
```

## Create/edit and some contacts

Quickly use the app to generate some data for datastore.

Once created, head to Entities in the Datastore tab to browse at [https://console.cloud.google.com/datastore/entities/query?project=$PROJECT_ID&ns=&kind=Entry](https://console.cloud.google.com/datastore/entities/query?project=$PROJECT_ID&ns=&kind=Entry).

## Delete contacts using the app and datastore viewer

Delete the contacts using the app and verify that they are being removed from the datastore UI.

Head to the [Datastore Viewer](https://console.cloud.google.com/datastore/entities/query?project=$PROJECT_ID&ns=&kind=Entry) and delete a few entries; refreshing your app to see the changes in realtime.