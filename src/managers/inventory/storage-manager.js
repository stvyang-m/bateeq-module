'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var Storage = BateeqModels.inventory.Storage; 
 

module.exports = class StorageManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.storageCollection = this.db.use(map.inventory.Storage);
    }
    
    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);
        
        return new Promise((resolve, reject) => {
            this.storageCollection
                .where({_deleted:false})
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
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