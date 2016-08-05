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

        var ModuleSeedManager = require('../core/module-seed-manager');
        this.moduleSeedManager = new ModuleSeedManager(db, user);

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
                    var now = new Date();
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    
                    //Create Code
                    var getModules = [];
                    getModules.push(this.moduleSeedManager.getModuleSeed(moduleId, year, month));
                    //getModules.push(this.moduleSeedManager.getModuleSeed(moduleIdIn, year, month));
                    //getModules.push(this.moduleSeedManager.getModuleSeed(moduleIdOut, year, month));
                    Promise.all(getModules)
                        .then(resultModules => {
                            
                            var codeTransferIn = "";
                            var codeTransferOut = "";
                            var codeFinishedGood = "";
                            
                            //Code Finished Good
                            var number = ++resultModules[0].seed;
                            var zero = 4 - number.toString().length + 1;
                            var runningNumber = Array(+(zero > 0 && zero)).join("0") + number;
                            zero = 2 - month.toString().length + 1;
                            var formattedMonth = Array(+(zero > 0 && zero)).join("0") + month;
                            codeFinishedGood = `${runningNumber}/${moduleId}/${formattedMonth}/${year}`; 
                            codeTransferIn = `${runningNumber}/${moduleIdIn}/${formattedMonth}/${year}`; 
                            codeTransferOut = `${runningNumber}/${moduleIdOut}/${formattedMonth}/${year}`; 
                           
                            // //Code Transfer In
                            // number = ++resultModules[1].seed;
                            // zero = 4 - number.toString().length + 1;
                            // runningNumber = Array(+(zero > 0 && zero)).join("0") + number;
                            // zero = 2 - month.toString().length + 1;
                            // formattedMonth = Array(+(zero > 0 && zero)).join("0") + month;
                            // codeTransferIn = `${runningNumber}/${moduleIdIn}/${formattedMonth}/${year}`; 
                            
                            // //Code Transfer Out
                            // number = ++resultModules[2].seed;
                            // zero = 4 - number.toString().length + 1;
                            // runningNumber = Array(+(zero > 0 && zero)).join("0") + number;
                            // zero = 2 - month.toString().length + 1;
                            // formattedMonth = Array(+(zero > 0 && zero)).join("0") + month;
                            // codeTransferOut = `${runningNumber}/${moduleIdOut}/${formattedMonth}/${year}`; 
                           
                            var getMethods = [];
                              
                            //Update Counter Number Transfer In
                            getMethods.push(this.moduleSeedManager.update(resultModules[0]));
                            
                            // //Update Counter Number Transfer Out
                            // getMethods.push(this.moduleSeedManager.update(resultModules[2]));
                            
                            //Create Transfer In
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
                             
                            //Create Transfer Out
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
                                    
                            Promise.all(getMethods)
                                .then(results => {
                                    var transferInResultId = results[2];
                                    var transferOutResultId = results[3]; 
                                    getMethods = [];
                                    //Get Transfer In using ID
                                    getMethods.push(this.transferInDocManager.getByIdOrDefault(transferInResultId)); 
                                    //Get Transfer Out using ID
                                    getMethods.push(this.transferOutDocManager.getByIdOrDefault(transferOutResultId)); 
                                    Promise.all(getMethods)
                                        .then(transferResults => { 
                                            getMethods = [];
                                            var transferInData = transferResults[0];
                                            var transferOutData = transferResults[1];
                                            
                                            // //Update Counter Number Finished Good
                                            // getMethods.push(this.moduleSeedManager.update(resultModules[0]));
                                            
                                            //Create Finishing Good
                                            var validFinishedGoodDoc = {};
                                            validFinishedGoodDoc.code = codeFinishedGood;
                                            validFinishedGoodDoc.transferInDocumentId = transferInResultId;
                                            validFinishedGoodDoc.transferInDocument = transferInData;
                                            validFinishedGoodDoc.transferOutDocumentId = transferOutResultId;
                                            validFinishedGoodDoc.transferOutDocument = transferOutData;
                                            validFinishedGoodDoc.storageId = finishedGoodDoc.sourceId;
                                            validFinishedGoodDoc = new FinishedGoodsDoc(validFinishedGoodDoc); 
                                            getMethods.push(this.finishedGoodsDocCollection.insert(validFinishedGoodDoc));
                                             
                                            Promise.all(getMethods)
                                                .then(results => {
                                                    resolve(results[1]);
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
            
            resolve(valid);
            
        });
    } 
};