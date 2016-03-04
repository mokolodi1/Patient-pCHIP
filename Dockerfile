FROM node:0.10
MAINTAINER Teo Fleming

# install Meteor
RUN apt-get update
RUN apt-get install -y curl
RUN curl https://install.meteor.com | /bin/sh

# Install the Python stuff:
# Note: this is using PYTHON 2.7.X
# Building Scipy may need more than 1G RAM to complete succssfully.
# Some minimal cloud VPS servers are not sufficient.
RUN apt-get -y update && apt-get install -y git
RUN apt-get -y update && apt-get install -y make
RUN apt-get -y update && apt-get install -y python python-pip python-dev python-numpy
RUN pip install networkx
RUN pip install matplotlib

# install dependencies for scipy
RUN apt-get -y update && apt-get install -y python-setuptools python-dateutil
RUN apt-get install -y libblas-dev liblapack-dev libatlas-base-dev gfortran
RUN pip install scipy
RUN pip install pylab
RUN pip install pillow

EXPOSE 3000
ENV PORT 3000

WORKDIR ./build/bundle/programs/server
RUN npm install
WORKDIR ..

CMD ["node", "main.js"]
