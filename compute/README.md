# Google Compute Engine

Open up the Cloud Shell and follow the tutorial in there.

Export your Projects ID to the environment:

```sh
export PROJECT_ID=YOUR_PROJECT_ID
```

And set your default zone:

```sh
gcloud config set compute/zone europe-north1-a
```

## Create a compute engine instance

```sh
gcloud compute instances create myinstance \
--project=$PROJECT_ID
```

Note down the `EXTERNAL_IP` - that's important later on.

The instance was created with some default values:

* The zone that you choose. All instances live in a [zone](https://cloud.google.com/compute/docs/zones).
You can select a zone at instance creation time by using the `--zone` flag or you can set a default zone (as we did in the initial setup) and omit the `--zone` flag.
* The latest [Debian 9 Stretch](https://cloud.google.com/compute/docs/images) image. If you are using your own custom image, provide the image name here instead. For example, `--image my-own-image`.
* The `n1-standard-1` [machine type](https://cloud.google.com/compute/docs/machine-types). You can select another machine type such as `n1-highmem-4` or `n1-highcpu-6`. If none of the predefined machine types match your needs, use [a custom machine type](https://cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type).
* A root persistent disk with the same name as the instance; the disk is automatically attached to the instance.

Run `gcloud compute instances create --help` to see all the defaults.

## Enable Firewall for port 80

By default, Google Cloud Platform only allows few port accesses. Since we'll be installing Nginx soon - let's enable port 80 in the firewall configuration first.

```sh
gcloud compute firewall-rules create allow-80 \
--project=$PROJECT_ID \
--allow tcp:80
```

This will create a firewall rule named `allow-80` that has the following default values:

* The list of IP address blocks that are allowed to make inbound connections (`--source-ranges`) are set to `0.0.0.0/0` (Everywhere).
* The list of instance tags indicating the set of instances on the network which may accept inbound connections is set to none which means the firewall rule is applicable to all instances.

Run `gcloud compute firewall-rules create --help` to see all the defaults.

## SSH Into the Instance

To SSH into the instance from the command line:

```sh
gcloud compute ssh myinstance \
--project=$PROJECT_ID
```

That's it! pretty easy. (In production, make sure you enter a passphrase :)

Alternatively, you can also SSH into the instance directly from the console by navigating to **Compute Engine** > **VM Instances**, and clicking on **SSH**.

## Install Nginx

Log into `myinstance`, the newly created instance, and install nginx:

```sh
sudo su - 
apt-get update
apt-get install -y nginx
service nginx start
exit
```

Test that the server is running using `wget` from `myinstance` and exit the instance:

```sh
wget -q -O - localhost:80
exit
```

Find the external IP for your instance by listing your instances either via the web UI or from the command line:

```sh
gcloud compute instances list \
--project=$PROJECT_ID
```

Then navigate to `http://EXTERNAL_IP/` where `EXTERNAL_IP` is the public IP of myinstance and you should be able to see the Nginx page.

## Startup Script

Rather than setting up the instance every time, you can use a startup script to initialize the instance upon startup.

In your Cloud Shell create a file named `startup.sh` with following contents:

```sh
#! /bin/bash
apt-get update && apt-get install -y nginx
service nginx start
sed -i -- 's/nginx/Google Cloud Platform - '"$HOSTNAME"'/' /var/www/html/index.nginx-debian.html
```

Then create an instance with the startup script, this may take up to 2 to 3 minutes:

```sh
gcloud compute instances create nginx \
--project=$PROJECT_ID \
--metadata-from-file startup-script=startup.sh 
```

Browse to `http://EXTERNAL_IP/` and you should see the updated home page. If the page doesn't show immediately retry after a couple of seconds, the host might be still starting nginx.

## Create a cluster of servers

To create a cluster of servers, you first need to create an [Instance Template](https://cloud.google.com/compute/docs/instance-templates).
Once an instance template is created, you can then create an instance group to manage the number of instances to create.

First, create an instance template using the startup script, this could take a few minutes:

```sh
gcloud compute instance-templates create nginx-template \
--project=$PROJECT_ID \
--metadata-from-file startup-script=startup.sh
```

Second, let's create a target pool. A target pool allows us to have a single access point to all the instances in a group and is necessary for load balancing in the future steps.

```sh
gcloud compute target-pools create nginx-pool \
--project=$PROJECT_ID
```

Finally, create an instance group using the template:

```sh
gcloud compute instance-groups managed create nginx-group \
--project=$PROJECT_ID \
--base-instance-name nginx \
--size 2 \
--template nginx-template \
--target-pool nginx-pool
```

This will create 2 Compute Engine instances with names that are prefixed with `nginx-`.

List the compute engine instances and you should see all of the instances created!

```sh
gcloud compute instances list \
--project=$PROJECT_ID
```

## Create a Network Load Balancer

There are two types of [load balancers in Google Cloud Platform](https://cloud.google.com/compute/docs/load-balancing-and-autoscaling#network_load_balancing):

* a L3 [Network Load Balancer](https://cloud.google.com/load-balancing/docs/network/) and
* a L7 [HTTP(s) Load Balancer](https://cloud.google.com/load-balancing/docs/https/).

Let's create a network load balancer targeting our instance group:

```sh
gcloud compute forwarding-rules create nginx-lb \
--project=$PROJECT_ID \
--ports 80 \
--target-pool nginx-pool
```

You can then visit the load balancer from the browser `http://IP_ADDRESS/` where `IP_ADDRESS` is the address shown as the result of running the previous command.

## Cleanup

Don't forget to shut down your cluster, otherwise they'll keep running and accruing costs. The following commands will delete the Google Compute Engine instances, Instance Group, Targeting Group, and the Load Balancer.

```sh
gcloud compute forwarding-rules delete nginx-lb \
--project=$PROJECT_ID

gcloud compute instance-groups managed delete nginx-group \
--project=$PROJECT_ID

gcloud compute target-pools delete nginx-pool \
--project=$PROJECT_ID

gcloud compute instance-templates delete nginx-template \
--project=$PROJECT_ID

gcloud compute instances delete myinstance \
--project=$PROJECT_ID

gcloud compute instances delete nginx \
--project=$PROJECT_ID

gcloud compute firewall-rules delete allow-80 \
--project=$PROJECT_ID
```
