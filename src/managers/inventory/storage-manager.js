'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
var Manager = require('mean-toolkit').Manager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var Storage = BateeqModels.inventory.Storage; 
 

module.exports = class StorageManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.storageCollection = this.db.use(map.inventory.Storage);
    }
    
    read() {
        return new Promise((resolve, reject) => {
            this.storageCollection
                .execute()
                .then(storages => {
                    resolve(storages);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id)
            };
            this.getSingleByQuery(query)
                .then(storage => {
                    resolve(storage);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.storageCollection
                .single(query)
                .then(storage => {
                    resolve(storage);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(storage) {
        return new Promise((resolve, reject) => {
            this._validate(storage)
                .then(validStorage => {

                    this.storageCollection.insert(validStorage)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(storage) {
        return new Promise((resolve, reject) => {
            this._validate(storage)
                .then(validStorage => {
                    this.storageCollection.update(validStorage)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    } 

    delete(storage) {
        return new Promise((resolve, reject) => {
            this._validate(storage)
                .then(validStorage => {
                    validStorage._deleted = true;
                    this.storageCollection.update(validStorage)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }


    _validate(storage) {
        return new Promise((resolve, reject) => { 
            var valid = new Storage(storage);
            valid.stamp(this.user.username,'manager');
            resolve(valid);
        });
    }
};