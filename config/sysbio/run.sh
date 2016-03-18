# export MONGO_URL="mongodb://localhost:27017/pCHIP"

settingsPath=/projects/sysbio/pCHIPS_webapp/Patient-pCHIP/config/sysbio/settings.json

if [ -z "$1" ]; then
    # run the app in headless mode
    nohup meteor --port 3000 --settings $settingsPath &
else
    meteor $1 --port 3000 --settings $settingsPath
fi
