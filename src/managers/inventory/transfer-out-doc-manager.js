'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var TransferOutItem = BateeqModels.inventory.TransferOutItem;


module.exports = class TransferOutDocManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.transferOutDocCollection = this.db.use(map.inventory.TransferOutDoc);
        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var InventoryManager = require('./inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);
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
                var $or = {
                    '$or': [filterCode]
                };

                query['$and'].push($or);
            }


            this.transferOutDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(transferOutDocs => {
                    resolve(transferOutDocs);
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
                .then(transferOutDoc => {
                    resolve(transferOutDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.transferOutDocCollection
                .single(query)
                .then(transferOutDoc => {
                    resolve(transferOutDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {
                    var tasks = [this.transferOutDocCollection.insert(validTransferOutDoc)];
                    
                    for (var item of validTransferOutDoc.items) {
                        tasks.push(this.inventoryManager.out(validTransferOutDoc.sourceId, validTransferOutDoc.code, item.articleVariantId, item.quantity, item.remark))
                    }

                    Promise.all(tasks)
                        .then(results => {
                            var id = results[0];
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

    update(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {
                    this.transferOutDocCollection.update(validTransferOutDoc)
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

    delete(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {
                    validTransferOutDoc._deleted = true;
                    this.transferOutDocCollection.update(validTransferOutDoc)
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


    _validate(transferOutDoc) {
        return new Promise((resolve, reject) => {
            var valid = new TransferOutDoc(transferOutDoc);

            var getSource = this.storageManager.getById(transferOutDoc.sourceId);
            var getDestination = this.storageManager.getById(transferOutDoc.destinationId);
            
            var getItems = [];
            for (var item of valid.items) {
                getItems.push(this.articleVariantManager.getById(item.articleVariantId));
            }

            Promise.all([getSource, getDestination].concat(getItems))
                .then(results => {
                    var source = results[0];
                    var destination = results[1];
                    
                    valid.sourceId = source._id;
                    valid.source = source;
                    
                    valid.destinationId = destination._id;
                    valid.destination = destination;

                    if (results.length > 2) {
                        var articleVariants = results.slice(2, results.length)
                        for(var variant of articleVariants)
                        {
                            var index = articleVariants.indexOf(variant);
                            var item = valid.items[index];
                            item.articleVariantId = variant._id;
                            item.articleVariant = variant;
                        }
                    }
                    
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid)
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
};