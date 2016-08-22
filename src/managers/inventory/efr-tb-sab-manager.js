'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var TransferInDoc = BateeqModels.inventory.TransferInDoc;
var TransferInItem = BateeqModels.inventory.TransferInItem;
var ArticleVariant = BateeqModels.core.article.ArticleVariant;
var generateCode = require('../../utils/code-generator');

const moduleId = "EFR-TB/SAB";
module.exports = class FinishingTerimaKomponenManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.transferInDocCollection = this.db.use(map.inventory.TransferInDoc);
        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../core/article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var InventoryManager = require('./inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);

        var TransferInDocManager = require('./transfer-in-doc-manager');
        this.transferInDocManager = new TransferInDocManager(db, user);

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
            var regexModuleId = new RegExp(moduleId, "i"); 
            var filter = {
                _deleted: false,
                'code': {
                    '$regex': regexModuleId
                }
            };
            var query = _paging.keyword ? {
                '$and': [filter]
            } : filter;

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

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
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

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.transferInDocCollection
                .singleOrDefault(query)
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
            //Validate Model Input
            this._validate(transferInDoc)
                .then(validTransferInDoc => {  
                    //Generate Code  
                    validTransferInDoc.code = generateCode(moduleId);
                    //Create Components to Article Variant if dont Any
                    this._validateFinishingVariant(validTransferInDoc)
                        .then(readyTransferInDoc => {
                            //Update Article Variant, add Finishings object
                            this._appendArticleVariant(readyTransferInDoc)
                                .then(latestTransferInDoc => { 
                                    // Create View Model to Transfer In
                                    var getTransferIns = [];
                                    var valid = latestTransferInDoc;  
                                    var NewTransferInDoc = {};
                                    NewTransferInDoc.sourceId = valid.sourceId;
                                    NewTransferInDoc.destinationId = valid.destinationId;
                                    NewTransferInDoc.code = valid.code;
                                    NewTransferInDoc.reference = valid.reference;
                                    NewTransferInDoc.items = []; 
                                    for (var item of valid.items) {    
                                        for (var finishing of item.articleVariant.finishings) {  
                                            var item = {};
                                            item.articleVariantId = finishing.articleVariant._id;
                                            item.quantity = finishing.quantity;
                                            NewTransferInDoc.items.push(item); 
                                        }  
                                    }   
                                    NewTransferInDoc = new TransferInDoc(NewTransferInDoc); 
                                    //Create Transfer In
                                    this.transferInDocManager.create(NewTransferInDoc)
                                        .then(id => {
                                            resolve(id); 
                                        })
                                        .catch(e => {
                                            reject(e);
                                        }) 
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

    update(transferInDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    delete(transferInDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    _validate(transferInDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = transferInDoc;
            
            if (!valid.sourceId || valid.sourceId == '')
                errors["sourceId"] = "sourceId is required";
             
            if (!valid.destinationId || valid.destinationId == '')
                errors["destinationId"] = "destinationId is required";
           
            if (!valid.items || valid.items.length == 0) {
                errors["items"] = "items is required";
            } 
            else {
                var itemErrors = [];
                for(var item of valid.items) {
                    var itemError = {};
                    if(!item.articleVariantId || item.articleVariantId == "") {
                        itemError["articleVariantId"] = "articleVariantId is required";
                    }
                    else { 
                        for (var i = valid.items.indexOf(item) + 1; i < valid.items.length; i++) {
                            var otherItem = valid.items[i];
                            if (item.articleVariantId == otherItem.articleVariantId) {
                                itemError["articleVariantId"] = "articleVariantId already exists on another detail";
                            }
                        } 
                        
                        var articleVariantError = {}; 
                        if(item.articleVariant) { 
                            if(!item.articleVariant.finishings || item.articleVariant.finishings.length == 0) { 
                                articleVariantError["finishings"] = "Component is required";
                            }
                            else {
                                var finishingErrors = [];
                                for(var finishing of item.articleVariant.finishings) {
                                    var finishingError = {};
                                    if(!finishing.articleVariantId || finishing.articleVariantId == "") {
                                        //finishingError["articleVariantId"] = "Component ArticleVariantId is required";
                                    }
                                    else {
                                        for (var i = item.articleVariant.finishings.indexOf(finishing) + 1; i < item.articleVariant.finishings.length; i++) {
                                            var otherItem = item.articleVariant.finishings[i];
                                            if (finishing.articleVariantId == otherItem.articleVariantId) {
                                                finishingError["articleVariantId"] = "Component articleVariantId already exists on another detail"; 
                                            }
                                        } 
                                    }
                                    
                                    if (finishing.quantity == undefined || (finishing.quantity && finishing.quantity == '')) {
                                        finishingError["quantity"] = "quantity is required";
                                    }
                                    else if (parseInt(finishing.quantity) <= 0) {
                                        finishingError["quantity"] = "quantity must be greater than 0";
                                    }
                             
                                    finishingErrors.push(finishingError);
                                }
                                for (var finishingError of finishingErrors) {
                                    for (var prop in finishingError) {
                                        articleVariantError.finishings = finishingErrors;
                                        break;
                                    }
                                    if (articleVariantError.finishings)
                                        break;
                                }
                
                            }
                        } 
                        for (var prop in articleVariantError) {
                            itemError["articleVariant"] = articleVariantError;
                            break;
                        } 
                    } 
                    itemErrors.push(itemError);
                }
                for (var itemError of itemErrors) {
                    for (var prop in itemError) {
                        errors.items = itemErrors;
                        break;
                    }
                    if (errors.items)
                        break;
                }
            }
             
             for (var prop in errors) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data does not pass validation', errors));
            }
                    
            resolve(valid);
        });
    }
    
    _validateFinishingVariant(transferInDoc) {
        return new Promise((resolve, reject) => { 
            var valid = transferInDoc; 
            var getFinishings = [];
            for (var item of valid.items) {  
                for (var finishing of item.articleVariant.finishings) {  
                    if(!finishing.articleVariantId || finishing.articleVariantId == ""){
                        var now = new Date();
                        var stamp = now / 1000 | 0;
                        var code = stamp.toString(36);
            
                        //finishing.articleVariant = {};
                        finishing.articleVariant.code = code;
                        finishing.articleVariant.size = "Component";
                        finishing.articleVariant.description = "Component Finishings";
                        finishing.articleVariant = new ArticleVariant(finishing.articleVariant); 
                        getFinishings.push(this.articleVariantManager.create(finishing.articleVariant));
                    }
                    else{
                        getFinishings.push(Promise.resolve(null));
                    }
                }  
            }  
            Promise.all(getFinishings)
                .then(results => { 
                    var index = 0;
                    for (var item of valid.items) {  
                        for (var finishing of item.articleVariant.finishings) {  
                            if(!finishing.articleVariantId || finishing.articleVariantId == ""){
                                finishing.articleVariant._id = results[index]; 
                                finishing.articleVariantId = results[index]; 
                                finishing.articleVariant = new ArticleVariant(finishing.articleVariant); 
                            } 
                            index++;
                        }  
                    }   
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }  
    
    _appendArticleVariant(transferInDoc) {
        return new Promise((resolve, reject) => { 
            var valid = transferInDoc; 
            var getItems = [];
            for (var item of valid.items) {      
                var av = new ArticleVariant(item.articleVariant)
                getItems.push(this.articleVariantManager.update(av));  
            }  
            Promise.all(getItems)
                .then(results => {  
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
};