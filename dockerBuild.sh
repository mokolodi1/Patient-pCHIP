# I can't get `meteor build` to run within the docker file so I'm just doing
# the build before running docker build
cd webapp
meteor build --directory ../build

cd ..
docker build -t patient-pchip .
