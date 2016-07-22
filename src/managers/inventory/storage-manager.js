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
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCode = {
                    'code': {
                        '$regex': regex
                    }
                };
                var filterName = {
                    'name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterCode, filterName]
                };

                query['$and'].push($or);
            }


            this.storageCollection
                .where(query)
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
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
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

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
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

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.storageCollection
                .singleOrDefault(query)
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
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new Storage(storage);
            // 1. begin: Declare promises.
            var getStorage = this.storageCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getStorage])
                .then(results => {
                    var _storage = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_storage) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required"; 

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
};