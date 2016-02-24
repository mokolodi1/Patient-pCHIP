FROM node:0.10
MAINTAINER Teo Fleming

# install Meteor
RUN apt-get update
RUN apt-get install -y curl
RUN curl https://install.meteor.com | /bin/sh

# Install the Python stuff
# Building Scipy may need more than 1G RAM to complete succssfully.
# Some minimal cloud VPS servers are not sufficient.
RUN apt-get -y update && apt-get install -y git
RUN apt-get -y update && apt-get install -y make
RUN apt-get -y update && apt-get install -y python python-pip python-dev python-numpy
RUN pip install networkx

EXPOSE 3000
ENV PORT 3000

RUN mkdir /bundle
ENV RELEASE=1.2.1

RUN meteor --release $RELEASE update
ADD ./build /build
WORKDIR /build

# RUN meteor build --release $RELEASE --directory ..
# WORKDIR /app/build/bundle/programs/server
# RUN npm install
# WORKDIR /app/build/bundle

WORKDIR /build/bundle

CMD ["node", "main.js"]
