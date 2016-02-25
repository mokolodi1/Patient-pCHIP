export MONGO_URL="mongodb://localhost:27017/pCHIP"

settingsPath=/Users/mokolodi1/work/evan/Patient-pCHIP/config/teo/settings.json

if [ -z "$1" ]; then
    meteor --port 3000 --settings $settingsPath
else
    meteor $1 --port 3000 --settings $settingsPath
fi
