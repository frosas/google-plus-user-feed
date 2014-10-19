# DOCKER-VERSION 1.15

FROM ubuntu
RUN apt-get update && apt-get install -y nodejs nodejs-legacy npm netcat
COPY . /opt/google-plus-user-feed
WORKDIR /opt/google-plus-user-feed
RUN npm install
# Piping reasoning: http://superuser.com/questions/261900/how-can-i-pipe-commands-to-a-netcat-that-will-stay-alive
ENTRYPOINT node_modules/.bin/supervisor src/main.js | nc tcp-fqxr-m555.data.splunkstorm.com 20948
EXPOSE 8080
