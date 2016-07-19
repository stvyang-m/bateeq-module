'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var Inventory = BateeqModels.inventory.Inventory;
var InventoryMovement = BateeqModels.inventory.InventoryMovement;


module.exports = class InventoryManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.inventoryCollection = this.db.use(map.inventory.Inventory);
        this.inventoryMovementCollection = this.db.use(map.inventory.InventoryMovement);

        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var InventoryMovementManager = require('./inventory-movement-manager');
        this.inventoryMovementManager = new InventoryMovementManager(db, user);
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


            this.inventoryCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(inventorys => {
                    resolve(inventorys);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    readByStorageId(storageId, paging) {
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
            var query = {
                '$and': [deleted, storage]
            };

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCode = {
                    'articleVariant.code': {
                        '$regex': regex
                    }
                };
                var filterName = {
                    'articleVariant.name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterCode, filterName]
                };

                query['$and'].push($or);
            }


            this.inventoryCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(inventorys => {
                    resolve(inventorys);
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
                .then(inventory => {
                    resolve(inventory);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByStorageIdAndArticleVarianId(storageId, articleVariantId) {
        return new Promise((resolve, reject) => {
            var query = {
                storageId: new ObjectId(storageId),
                articleVariantId: new ObjectId(articleVariantId),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(inventory => {
                    resolve(inventory);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.inventoryCollection
                .single(query)
                .then(inventory => {
                    resolve(inventory);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(inventory) {
        return new Promise((resolve, reject) => {
            this._validate(inventory)
                .then(validInventory => {

                    this.inventoryCollection.insert(validInventory)
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

    update(inventory) {
        return new Promise((resolve, reject) => {
            this._validate(inventory)
                .then(validInventory => {
                    this.inventoryCollection.update(validInventory)
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

    delete(inventory) {
        return new Promise((resolve, reject) => {
            this._validate(inventory)
                .then(validInventory => {
                    validInventory._deleted = true;
                    this.inventoryCollection.update(validInventory)
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

    getInventory(storageId, articleVariantId) {
        var query = {
            '$and': [{
                storageId: new ObjectId(storageId)
            }, {
                articleVariantId: new ObjectId(articleVariantId)
            }, {
                _deleted: false
            }]
        };

        return new Promise((resolve, reject) => {
            this.inventoryCollection
                .singleOrDefault(query)
                .then(inventory => {
                    if (inventory)
                        resolve(inventory);
                    else {
                        var newInventory = new Inventory({
                            storageId: new ObjectId(storageId),
                            articleVariantId: new ObjectId(articleVariantId)
                        });
                        this.create(newInventory)
                            .then(docId => {
                                this.inventoryCollection
                                    .single({
                                        _id: docId
                                    })
                                    .then(inventory => {
                                        resolve(inventory);
                                    })
                                    .catch(e => {
                                        reject(e);
                                    });
                            })
                            .catch(e => {
                                reject(e);
                            });
                    }
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    out(storageId, refNo, articleVariantId, quantity, remark) {
        var absQuantity = Math.abs(quantity);
        return this.move(storageId, refNo, 'OUT', articleVariantId, absQuantity * -1, remark);
    }

    in (storageId, refNo, articleVariantId, quantity, remark) {
        var absQuantity = Math.abs(quantity);
        return this.move(storageId, refNo, 'IN', articleVariantId, absQuantity, remark);
    }

    move(storageId, refNo, type, articleVariantId, quantity, remark) {
        return new Promise((resolve, reject) => {
            this.getInventory(storageId, articleVariantId)
                .then(inventory => {
                    var originQuantity = inventory.quantity;
                    var movement = new InventoryMovement({
                        inventoryId: inventory._id,
                        data: new Date(),
                        reference: refNo,
                        type: type,
                        storageId: inventory.storageId,
                        articleVariantId: inventory.articleVariantId,
                        before: originQuantity,
                        quantity: quantity,
                        after: originQuantity + quantity,
                        remark: remark
                    });

                    inventory.quantity += quantity;

                    var updateInventory = this.update(inventory);
                    var createMovement = this.inventoryMovementManager.create(movement);

                    Promise.all([createMovement, updateInventory])
                        .then(results => {
                            var inventoryId = results[0];
                            var movementId = results[1];

                            resolve(movementId);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    _validate(inventory) {
        return new Promise((resolve, reject) => {
            var valid = new Inventory(inventory);

            var getStorage = this.storageManager.getById(inventory.storageId);
            var getArticleVariant = this.articleVariantManager.getById(inventory.articleVariantId);

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