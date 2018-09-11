# Kubernetes&Container Engine / Veikkaus Infra+Dev training

## Before running anything in this repository

Load the environment variables:

```sh
export ENV=qvik # qvik, veikkaus
source init.environment
```

## Enable Container Engine

The container engine service is disabled in your project, to enable run:

```sh
gcloud services enable container.googleapis.com \
--project=$PROJECT_ID
```

## Install the kubectl component in GCloud

Ensure your gcloud installation has the `kubectl` component installed using:

```sh
gcloud components install kubectl
```

## Start a cluster with 3 nodes in your project

Once enabled, create a new cluster using:

```sh
gcloud beta container clusters create "cluster1" \
    --project "$PROJECT_ID" \
    --zone "us-central1-a" \
    --username "admin" \
    --cluster-version "1.9.7-gke.6" \
    --machine-type "n1-standard-1" \
    --image-type "COS" \
    --disk-type "pd-standard" \
    --disk-size "100" \
    --scopes    "https://www.googleapis.com/auth/compute","https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append"\
    --num-nodes "3" \
    --enable-cloud-logging \
    --enable-cloud-monitoring \
    --network "projects/$PROJECT_ID/global/networks/default" \
    --subnetwork "projects/$PROJECT_ID/regions/us-central1/subnetworks/default" \
    --addons HorizontalPodAutoscaling,HttpLoadBalancing,KubernetesDashboard \
    --no-enable-autoupgrade \
    --enable-autorepair
```

Take some time to check each of the parameters and what they allow you to configure.

## Connect to your newly created cluster

First we need to configure our local `kubectl` client to connect to the cluster in question:

```sh
gcloud container clusters get-credentials cluster1 --zone us-central1-a --project $PROJECT_ID
```

## List all the available nodes

Now let's take a look at the list of available nodes on your cluster:

```sh
kubectl get nodes
```

Which will list all the nodes; now to have a deeper look. Copy the name of the node and run:

```sh
kubectl describe node/<REPLACE-WITH-NODE-NAME>
```

## Deploy to Container Engine/Kubernetes

Now to deploy a simple NGINX container, luckily there are prebuilt options.

Have a look at `kube.yaml` which includes the configuration for Kubernetes to start and run the required pods/services.

> Take note of the `----` seperator in the file, this divides up the resources to be configured and allows multiple to be configured from one file.

In the file; we'll firstly create a pod, simply named nginx. Followed by a service that will configure a load balancer for us to the nginx pod.

To configure your cluster with this configuration use the following command:

```sh
kubectl apply -f kube.yaml
```

## List available pods in the cluster

Now that you have a pod running, they can be listed using:

```sh
kubectl get pods
```

## List available services in the cluster

List your available services on the cluster now using:

```sh
kubectl get services
```

Take this chance to get the public IP and access your service in your browser as well. 

> The public IP might take a minute or two, if you just see `<pending>` give it a some time and run the command again to get your ip

## Scale up pods

Let's imagine that your service is getting popular and you need to scale up to meet demand.

Let's tell our deployment to start 2 more pods of the nginx service to handle all this imaginary load:

```sh
kubectl scale deployment/nginx --replicas=3
```

Check the output of the following command to see the changes:

```sh
kubectl get pods
```

## Scale down pods

Let's imagine that the large traffic spike is over, and we want to scale back down to 1 instance of the pod:

```sh
kubectl scale deployment/nginx --replicas=1
```

Check the output of the following command to see the changes:

```sh
kubectl get pods
```

> Note you will not be billed less, as you are billed per node in the cluster not containers on those nodes

## Autoscaling

Maybe we want to enable autoscaling as demand increases, let's add the following to the end of the `kube.yaml` file:

```yaml
---
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: nginx
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      targetAverageUtilization: 50
```

And once saved, we'll apply the changes:

```sh
kubectl apply -f kube.yaml
```

Now our nginx service will scale up and down based on CPU usage.

Scaling up to 10 in heavy use and down back to 1 when not in use.

## Deleting your cluster

Once finished running through this tutorial, cleanup your resources using:

```sh
gcloud container clusters delete cluster1 \
    --project=$PROJECT_ID \
    --zone=us-central1-a
```
