'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var TransferInDoc = BateeqModels.inventory.TransferInDoc;
var TransferInItem = BateeqModels.inventory.TransferInItem;


module.exports = class TransferInDocManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.transferInDocCollection = this.db.use(map.inventory.TransferInDoc);
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


            this.transferInDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(transferInDocs => {
                    resolve(transferInDocs);
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
                .then(transferInDoc => {
                    resolve(transferInDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.transferInDocCollection
                .single(query)
                .then(transferInDoc => {
                    resolve(transferInDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(transferInDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferInDoc)
                .then(validTransferInDoc => {
                    var tasks = [this.transferInDocCollection.insert(validTransferInDoc)];

                    for (var item of validTransferInDoc.items) {
                        tasks.push(this.inventoryManager.in(validTransferInDoc.destinationId, validTransferInDoc.code, item.articleVariantId, item.quantity, item.remark));
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

    update(transferInDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferInDoc)
                .then(validTransferInDoc => {
                    this.transferInDocCollection.update(validTransferInDoc)
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

    delete(transferInDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferInDoc)
                .then(validTransferInDoc => {
                    validTransferInDoc._deleted = true;
                    this.transferInDocCollection.update(validTransferInDoc)
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


    _validate(transferInDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new TransferInDoc(transferInDoc);

            // 1. begin: Declare promises.
            var getTransferInDoc = this.transferInDocCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    code: valid.code
                }]
            });
            // 1. end: Declare promises.

            var getSource = this.storageManager.getByIdOrDefault(transferInDoc.sourceId);
            var getDestination = this.storageManager.getByIdOrDefault(transferInDoc.destinationId);
            var getItems = [];
            for (var item of valid.items) {
                getItems.push(this.articleVariantManager.getByIdOrDefault(item.articleVariantId));
            }

            Promise.all([getTransferInDoc,getSource, getDestination].concat(getItems))
                .then(results => {
                    var _transferInDoc = results[0];
                    var source = results[1];
                    var destination = results[2];
                    
                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_transferInDoc) {
                        errors["code"] = "code already exists";
                    }
                    
                    if (!valid.sourceId || valid.sourceId == '')
                        errors["sourceId"] = "sourceId is required";
                    if (!source) {
                        errors["sourceId"] = "sourceId not found";
                    }
                    else
                    {
                        valid.sourceId = source._id;
                        valid.source = source;
                    }
                    
                    if (!valid.destinationId || valid.destinationId == '')
                        errors["destinationId"] = "destinationId is required";
                    if (!destination) {
                        errors["destinationId"] = "destinationId not found";
                    }
                    else
                    {
                        valid.destinationId = destination._id;
                        valid.destination = destination;
                    }
                      
                    // if (results.length > 3) {
                    //     var articleVariants = results.slice(3, results.length)
                    //     for (var variant of articleVariants) {
                    //         var index = articleVariants.indexOf(variant);
                    //         var item = valid.items[index];
                    //         item.articleVariantId = variant._id;
                    //         item.articleVariant = variant;
                    //     }
                    // }

                    // 2a. begin: Validate error on item level.
                    var arrItem = 3;
                    var itemErrors = [];
                    for (var item of valid.items) {
                        var _articleVariant = results[arrItem];
                        arrItem++;
                        var itemError = {};

                        if (!item.articleVariantId || item.articleVariantId == '') {
                            itemError["articleVariantId"] = "articleVariantId is required";
                        } 
                        else {
                            for (var i = valid.items.indexOf(item) + 1; i < valid.items.length; i++) {
                                var otherItem = valid.items[i];
                                if (item.articleVariantId == otherItem.articleVariantId) {
                                    itemError["articleVariantId"] = "articleVariantId already exists on another detail";
                                }
                            }
                        } 
                        if(!_articleVariant) {
                            itemError["articleVariantId"] = "articleVariantId not found";
                        }
                        else { 
                            item.articleVariantId = _articleVariant._id;
                            item.articleVariant = _articleVariant; 
                        } 
                         var qty ;
                        qty= item.quantity.toString();
                        if (qty == '') {
                            itemError["quantity"] = "quantity is required";
                        }
                        else if(item.quantity <= 0) {
                            itemError["quantity"] = "quantity must be greater than 0";
                        }
                        itemErrors.push(itemError);
                    }
                    // 2a. end: Validate error on item level.
                    // 2b. add item level errors to parent error, if any.
                    for (var itemError of itemErrors) {
                        for (var prop in itemError) {
                            errors.items = itemErrors;
                            break;
                        }
                        if (errors.items)
                            break;
                    }
                     
                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
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