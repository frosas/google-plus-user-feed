# DOCKER-VERSION 1.15

FROM ubuntu
RUN apt-get update && apt-get install -y nodejs nodejs-legacy npm
COPY . /opt/google-plus-user-feed
WORKDIR /opt/google-plus-user-feed
RUN npm install
ENTRYPOINT node src/main.js 
