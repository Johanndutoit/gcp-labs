# Logging / Veikkaus Infra+Dev training

## Before running anything in this repository

Load the environment variables:

```sh
export ENV=qvik # qvik, veikkaus
source init.environment
```

## Ensure you have the required components

Start by ensuring you have the required components installed in gcloud:

```sh
gcloud components install beta
```

## Read the latest log entry

Let's read the latest logging entry from Stackdriver on Google Cloud.

To list the latest entry, we'll call `read` (which will access all our logs as we are not using a filter) and request only the latest log entry.

```sh
gcloud logging read \
    --project=$PROJECT_ID \
    --limit 1 \
    --order=desc
```

You should see a log entry in yaml, but let's pull the same entry in diff an format like JSON:

```sh
gcloud logging read \
    --project=$PROJECT_ID \
    --limit 1 \
    --format=json \
    --order=desc
```

## List the available logs to check

To see the available logs currently on Google Cloud use:

```sh
gcloud logging logs list \
    --project=$PROJECT_ID
```

Then use a filter while reading to only see entries for a specific log (in this case we'll look at the nginx request log from the previous tutorial):

```sh
gcloud logging read \
    "logName=projects/$PROJECT_ID/logs/appengine.googleapis.com%2Fnginx.request" \
    --project=$PROJECT_ID \
    --limit 1 \
    --order=desc
```

Now lets also only filter our by successful requests:

```sh
gcloud logging read \
    "logName=projects/$PROJECT_ID/logs/appengine.googleapis.com%2Fnginx.request AND httpRequest.status=200" \
    --project=$PROJECT_ID \
    --limit 1 \
    --order=desc
```

## Export logs as CSV for later parsing

Maybe we want to only get a few variables from each entry and save them in a easy to parse format for our other tools?

Easy enough using the `--format` argument. In this case we'll build a CSV that shows:

* The user agent
* The status code
* the remote ip of the user

of the top 100 entries.

To do this, we'll run the following command:

```sh
gcloud logging read \
    "logName=projects/$PROJECT_ID/logs/appengine.googleapis.com%2Fnginx.request" \
    --project=$PROJECT_ID \
    --limit 100 \
    --order=desc \
    --format="csv(httpRequest.userAgent,httpRequest.status,httpRequest.remoteIp)"
```

## Export logs to Google Cloud Storage for archiving

What we if we might want to export the logs to seperate service in Google Cloud? 

For these situations we are able to create "sinks", which will export to the target specified. 

Possible targets include:

* Google BigQuery
* Google Cloud Storage
* Google Cloud Pub/sub

For this example, we'll export to a bucket on Cloud Storage.

Sinks are configured to allow any future logs to be entered into the specified target (in this case Cloud Storage).

### Ensure Google Cloud Storage is enabled

Ensure Cloud Storage is enabled in your project using:

```sh
gcloud services enable storage-component.googleapis.com \
--project=$PROJECT_ID
```

### Create a bucket

To create a quick bucket to store the logs in:

```sh
gsutil mb -p $PROJECT_ID gs://logging-export-$PROJECT_ID/
```

### Create a sink

To do the actual export of the log entries we'll create a "sink".

This "sink" will be configure with where the log entries are coming from and where they are expected to be written to.

To create a sink, we'll call the following command:

```sh
gcloud beta logging sinks create appengine-gcs-logs storage.googleapis.com/logging-export-$PROJECT_ID \
        --log-filter='logName="projects/$PROJECT_ID/appengine.googleapis.com%2Fsyslog"' \
        --project=$PROJECT_ID
```

This will create a sink that would export all the syslog's of our App Engine instances to the specified bucket

### Export logs to Splunk

Using Sinks you can integrate other logging systems quite easily as well; like for example Splunk.

For more information on how to finnish this integration from Splunks side see [http://docs.splunk.com/Documentation/AddOns/released/GoogleCloud/Installationoverview](http://docs.splunk.com/Documentation/AddOns/released/GoogleCloud/Installationoverview).

One of the first steps for splunk to work from Google Cloud's side is to configure a topic on Pub/Sub that will receive the log entries:

```sh
gcloud beta pubsub topics create splunklogentries \
        --project=$PROJECT_ID
```

Then a subscription for the topic:

```sh
gcloud beta pubsub subscriptions create splunk \
        --topic=splunklogentries \
        --project=$PROJECT_ID
```

Now create a sink that will send all new matching logs to that topic:

```sh
gcloud beta logging sinks create splunk pubsub.googleapis.com/projects/$PROJECT_ID/topics/splunkentries \
        --log-filter='logName="projects/$PROJECT_ID/appengine.googleapis.com%2Fsyslog"' \
        --project=$PROJECT_ID
```

After this the Splunk addon must be installed and configured with a valid service account as per instructions from [http://docs.splunk.com/Documentation/AddOns/released/GoogleCloud/Installationoverview](http://docs.splunk.com/Documentation/AddOns/released/GoogleCloud/Installationoverview).