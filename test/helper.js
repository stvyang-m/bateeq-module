"use strict";

function _getDb() {
    return new Promise((resolve, reject) => {
        let factory = require('mongo-factory');
        factory.getConnection(process.env.DB_CONNECTIONSTRING)
            .then(dbInstance => {
                // dbInstance.use = dbInstance.use ||((collectionName) => {
                //     return dbInstance.collection(collectionName);
                // });
                resolve(dbInstance);
            })
            .catch(e => {
                reject(e);
            });
    });
}

module.exports = {
    getDb: _getDb,

    getManager: function (ManagerType) {
        return _getDb()
            .then(db => {
                return Promise.resolve(new ManagerType(db, {
                    username: "dev"
                }));
            })
    }
}