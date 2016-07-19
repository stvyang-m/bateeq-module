'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var InventoryMovement = BateeqModels.inventory.InventoryMovement;


module.exports = class InventoryMovementManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.inventoryMovementCollection = this.db.use(map.inventory.InventoryMovement);

        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);
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
                var filterArticleName = {
                    'articleVariant.name': {
                        '$regex': regex
                    }
                };
                var filterStorageName = {
                    'storage.name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterArticleName, filterStorageName]
                };

                query['$and'].push($or);
            }


            this.inventoryMovementCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(inventoryMovements => {
                    resolve(inventoryMovements);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    readByStorageIdAndArticleVariantId(storageId, articleVariantId, paging) {
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
            var storage = {
                storageId: new ObjectId(storageId)
            };
            var articleVariant = {
                articleVariantId: new ObjectId(articleVariantId)
            };
            var query = {
                '$and': [deleted, storage, articleVariant]
            };

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterArticleName = {
                    'articleVariant.name': {
                        '$regex': regex
                    }
                };
                var filterStorageName = {
                    'storage.name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterArticleName, filterStorageName]
                };

                query['$and'].push($or);
            }


            this.inventoryMovementCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(inventoryMovements => {
                    resolve(inventoryMovements);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(inventoryMovement => {
                    resolve(inventoryMovement);
                })
                .catch(e => {
                    reject(e);
                });
        });
    } 

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.inventoryMovementCollection
                .single(query)
                .then(inventoryMovement => {
                    resolve(inventoryMovement);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(inventoryMovement) {
        return new Promise((resolve, reject) => {
            this._validate(inventoryMovement)
                .then(validInventoryMovement => {

                    this.inventoryMovementCollection.insert(validInventoryMovement)
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

    update(inventoryMovement) {
        return new Promise((resolve, reject) => {
            this._validate(inventoryMovement)
                .then(validInventoryMovement => {
                    this.inventoryMovementCollection.update(validInventoryMovement)
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

    delete(inventoryMovement) {
        return new Promise((resolve, reject) => {
            this._validate(inventoryMovement)
                .then(validInventoryMovement => {
                    validInventoryMovement._deleted = true;
                    this.inventoryMovementCollection.update(validInventoryMovement)
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


    _validate(inventoryMovement) {
        return new Promise((resolve, reject) => {
            var valid = new InventoryMovement(inventoryMovement);

            var getStorage = this.storageManager.getById(inventoryMovement.storageId);
            var getArticleVariant = this.articleVariantManager.getById(inventoryMovement.articleVariantId);


            Promise.all([getStorage, getArticleVariant])
                .then(results => {
                    var storage = results[0];
                    var articleVariant = results[1];

                    valid.storageId = storage._id;
                    valid.storage = storage;

                    valid.articleVariantId = articleVariant._id;
                    valid.articleVariant = articleVariant;

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid)
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
};