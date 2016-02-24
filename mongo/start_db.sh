# make sure it exists
if [ ! -d "$db" ]; then
    mkdir db
fi

cd db
mongod --dbpath .
