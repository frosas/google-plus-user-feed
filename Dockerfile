# DOCKER-VERSION 1.15

FROM ubuntu
RUN apt-get update && apt-get install -y nodejs nodejs-legacy npm netcat
COPY . /opt/google-plus-user-feed
WORKDIR /opt/google-plus-user-feed
RUN npm install
CMD > /var/log/apps.log && \
    tail -f /var/log/app.log | nc tcp-fqxr-m555.data.splunkstorm.com 20948 & \
    node_modules/.bin/supervisor -q src/main.js >> /var/log/app.log    
EXPOSE 8080
