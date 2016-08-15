'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var FinishedGoodsDoc = BateeqModels.inventory.FinishedGoodsDoc;
var TransferInDoc = BateeqModels.inventory.TransferInDoc;
var TransferInItem = BateeqModels.inventory.TransferInItem;
var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var TransferOutItem = BateeqModels.inventory.TransferOutItem;
var ArticleVariant = BateeqModels.core.article.ArticleVariant;
var generateCode = require('../../utils/code-generator');

const moduleId = "EFR-HP/FNG";
const moduleIdIn = "EFR-TB/FNG";
const moduleIdOut = "EFR-KB/SAB";
module.exports = class FinishedGoodsManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.finishedGoodsDocCollection = this.db.use(map.inventory.FinishedGoodsDoc);
        this.transferInDocCollection = this.db.use(map.inventory.TransferInDoc);
        this.transferOutDocCollection = this.db.use(map.inventory.TransferOutDoc);
        
        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../core/article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var InventoryManager = require('./inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);

        var TransferInDocManager = require('./transfer-in-doc-manager');
        this.transferInDocManager = new TransferInDocManager(db, user);

        var TransferOutDocManager = require('./transfer-out-doc-manager');
        this.transferOutDocManager = new TransferOutDocManager(db, user);
        
        var ModuleManager = require('../core/module-manager');
        this.moduleManager = new ModuleManager(db, user); 

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


            this.finishedGoodsDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(finishedGoodsDocs => {
                    resolve(finishedGoodsDocs);
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
                .then(finishedGoodsDoc => {
                    resolve(finishedGoodsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
                .then(finishedGoodsDoc => {
                    resolve(finishedGoodsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.finishedGoodsDocCollection
                .single(query)
                .then(finishedGoodsDoc => {
                    resolve(finishedGoodsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.finishedGoodsDocCollection
                .singleOrDefault(query)
                .then(finishedGoodsDoc => {
                    resolve(finishedGoodsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(finishedGoodDoc) {
        return new Promise((resolve, reject) => {
            this._validate(finishedGoodDoc)
                .then(validFinishedGoodDoc => { 
                    var codeTransferIn = generateCode(moduleIdIn);
                    var codeTransferOut = generateCode(moduleIdOut);
                    var codeFinishedGood = generateCode(moduleId);
                    var getMethods = [];
                    
                    //Create Promise Create Transfer In and generate Model
                    var validTransferInDoc = {};
                    validTransferInDoc.code = codeTransferIn;
                    validTransferInDoc.reference = codeFinishedGood;
                    validTransferInDoc.sourceId = finishedGoodDoc.sourceId;
                    validTransferInDoc.destinationId = finishedGoodDoc.destinationId;
                    validTransferInDoc.items = [];
                    for(var item of finishedGoodDoc.items){
                        var newitem = {};
                        newitem.articleVariantId = item.articleVariant._id;
                        newitem.quantity = item.quantity;
                        validTransferInDoc.items.push(newitem);
                    }  
                    validTransferInDoc = new TransferInDoc(validTransferInDoc);
                    getMethods.push(this.transferInDocManager.create(validTransferInDoc)); 
                        
                    //Create Promise Create Transfer Out and generate Model
                    var validTransferOutDoc = {};
                    validTransferOutDoc.code = codeTransferOut;
                    validTransferOutDoc.reference = codeFinishedGood;
                    validTransferOutDoc.sourceId = finishedGoodDoc.sourceId;
                    validTransferOutDoc.destinationId = finishedGoodDoc.destinationId;
                    validTransferOutDoc.items = [];
                    for(var item of finishedGoodDoc.items) {
                        for(var finishing of item.articleVariant.finishings){ 
                            var newitem = {}; 
                            newitem.articleVariantId = finishing.articleVariant._id;
                            newitem.quantity = finishing.quantity;
                            validTransferOutDoc.items.push(newitem);
                        }
                    } 
                    validTransferOutDoc = new TransferOutDoc(validTransferOutDoc);
                    getMethods.push(this.transferOutDocManager.create(validTransferOutDoc));  
                    
                    //Create Transfer In
                    //Create Transfer Out 
                    Promise.all(getMethods)
                        .then(results => {
                            var transferInResultId = results[0];
                            var transferOutResultId = results[1]; 
                            getMethods = [];
                            //Create Promise Get Transfer In using ID
                            getMethods.push(this.transferInDocManager.getByIdOrDefault(transferInResultId)); 
                            //Create Promise Get Transfer Out using ID
                            getMethods.push(this.transferOutDocManager.getByIdOrDefault(transferOutResultId)); 
                            
                            //Get Transfer In
                            //Get Transfer Out
                            Promise.all(getMethods)
                                .then(transferResults => { 
                                    getMethods = [];
                                    var transferInData = transferResults[0];
                                    var transferOutData = transferResults[1]; 
                                    
                                    //Create Finishing Good Model
                                    var validFinishedGoodDoc = {};
                                    validFinishedGoodDoc.code = codeFinishedGood;
                                    validFinishedGoodDoc.transferInDocumentId = transferInResultId;
                                    validFinishedGoodDoc.transferInDocument = transferInData;
                                    validFinishedGoodDoc.transferOutDocumentId = transferOutResultId;
                                    validFinishedGoodDoc.transferOutDocument = transferOutData;
                                    validFinishedGoodDoc.storageId = finishedGoodDoc.sourceId;
                                    validFinishedGoodDoc = new FinishedGoodsDoc(validFinishedGoodDoc);  
                                        
                                    //Create Finishing Good
                                    this.finishedGoodsDocCollection.insert(validFinishedGoodDoc)
                                        .then(id => {
                                            resolve(id);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });  
                                })
                                .catch(e => {
                                    reject(e);
                                }); 
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

    update(finishedGoodDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    delete(finishedGoodDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    _validate(finishedGoodDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = finishedGoodDoc;
            
            var getItem = [];
            for(var item of valid.items){
                for(var finishing of item.articleVariant.finishings){
                    // finishing.articleVariantId;
                    // finishing.quantity;
                    getItem.push(this.inventoryManager.getByStorageIdAndArticleVarianId(valid.sourceId, finishing.articleVariantId))
                }
            }
            Promise.all(getItem)
                .then(items => {
                    var isHaveError = false;
                    var index = 0; 
                    var errorItems = [];
                    for(var item of valid.items){
                        var errorItem = {};
                        var errorItemsFinishings = [];
                        for(var finishing of item.articleVariant.finishings){
                            // finishing.articleVariantId;
                            // finishing.quantity;
                            var errorFinishing = {};
                            var inventoryQuantity = items[index++].quantity
                            if(finishing.quantity > inventoryQuantity) {
                                errorFinishing["quantity"] = "Quantity is Bigger than Stock (" + inventoryQuantity + ")";
                                isHaveError = true;
                            }  
                            errorItemsFinishings.push(errorFinishing);
                        } 
                        errorItem.articleVariant = { finishings: errorItemsFinishings };  
                        errorItems.push(errorItem);
                    }
                    if(isHaveError){ 
                        errors.items = errorItems;
                        for (var prop in errors) {
                            var ValidationError = require('../../validation-error');
                            reject(new ValidationError('data does not pass validation', errors));
                        }
                    }
                    
                    resolve(valid);
                }) 
        });
    } 
};