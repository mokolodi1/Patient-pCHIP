# export MONGO_URL="mongodb://localhost:27017/pCHIP"

settingsPath=/data/home/dtflemin/Patient-pCHIP/config/su2c-dev/settings.json

if [ -z "$1" ]; then
    meteor --port 3000 --settings $settingsPath
else
    meteor $1 --port 3000 --settings $settingsPath
fi
