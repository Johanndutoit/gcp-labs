# pull in a small nginx image
FROM nginx:alpine

# add our default file
ADD nginx.conf /etc/nginx/nginx.conf

# make sure the directory exists
RUN mkdir -p /usr/share/nginx/html/

# add our default file
ADD index.html /usr/share/nginx/html/index.html

# create log dir configured in nginx.conf
RUN mkdir -p /var/log/app_engine

# Create a simple file to handle heath checks. Health checking can be disabled
# in app.yaml, but is highly recommended. Google App Engine will send an HTTP
# request to /_ah/health and any 2xx or 404 response is considered healthy.
# Because 404 responses are considered healthy, this could actually be left
# out as nginx will return 404 if the file isn't found. However, it is better
# to be explicit.
RUN mkdir -p /usr/share/nginx/html/_ah && \
    echo "healthy" > /usr/share/nginx/html/_ah/health