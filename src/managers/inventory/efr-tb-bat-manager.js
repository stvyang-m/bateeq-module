'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var TransferInDoc = BateeqModels.inventory.TransferInDoc;
var TransferInItem = BateeqModels.inventory.TransferInItem;

const moduleId = "EFR-TB/BAT";

module.exports = class TokoTerimaAksesorisManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.transferInDocCollection = this.db.use(map.inventory.TransferInDoc);
        this.spkDocCollection = this.db.use(map.merchandiser.SPKDoc);

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

        var ModuleSeedManager = require('../core/module-seed-manager');
        this.moduleSeedManager = new ModuleSeedManager(db, user);
        
        var SPKManager = require('../merchandiser/efr-pk-manager');
        this.spkManager = new SPKManager(db, user);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            // var batRegex = { 'code': {
            //             '$regex': new RegExp("^[0-9]+\/[A-Z\-]+\/BAT\/[0-9]{2}\/[0-9]{4}$","i")}};

            var deleted = {
                _deleted: false,
                code: {
                        '$regex': new RegExp("^[0-9]+\/" + moduleId + "\/[0-9]{2}\/[0-9]{4}$","i")}
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

    readPendingSPK(paging){
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
            
            var regex = new RegExp("^[0-9]+\/[A-Z\-]+\/PBA\/[0-9]{2}\/[0-9]{4}$","i");
            var filterCode = {
                    'code': {
                        '$regex': regex
                    },
                    'expeditionDocumentId' : {"$ne" : {}}
                };

            var isReceived = {
                isReceived : false
            };

            var query = {$and:[
                deleted,
                filterCode,
                isReceived
            ]}

            this.spkDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(spkDocs => {
                    resolve(spkDocs);
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

    getSPKByReference(ref){
            return new Promise((resolve, reject) => {
                var query = {
                    packingList: ref,
                    _deleted: false
                };
                this.spkDocCollection.singleOrDefault(query)
                    .then(SPKDoc => {
                        resolve(SPKDoc);
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

    getPendingSPKById(id){
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false,
                isReceived:false
            };
            this.spkDocCollection.singleOrDefault(query)
                .then(SPKDoc => {
                    SPKDoc.password = '';
                    resolve(SPKDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    create(transferInDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferInDoc)
                .then(validTransferInDoc => { 
                    var now = new Date();
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1; 
                    this.moduleSeedManager
                        .getModuleSeed(moduleId, year, month)
                        .then(moduleSeed => {
                            var number = ++moduleSeed.seed;
                            var zero = 4 - number.toString().length + 1;
                            var runningNumber = Array(+(zero > 0 && zero)).join("0") + number; 
                            zero = 2 - month.toString().length + 1;
                            var formattedMonth = Array(+(zero > 0 && zero)).join("0") + month; 
                            validTransferInDoc.code = `${runningNumber}/${moduleId}/${formattedMonth}/${year}`; 
                            this.transferInDocManager.create(validTransferInDoc)
                                .then(id => { 
                                    var reference = transferInDoc.reference;
                                    
                                    this.spkManager.updateReceivedByRef(reference)
                                    .then(result => {
                                        resolve(result);
                                    }).catch(e=> reject(e));
                                    
                                    this.moduleSeedManager
                                        .update(moduleSeed)
                                        .then(seedId => {
                                            resolve(id);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        })
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
                })
        });
    }

    update(transferInDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferInDoc)
                .then(validTransferInDoc => {
                    this.transferInDocManager.update(validTransferInDoc)
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
                    this.transferInDocManager.update(validTransferInDoc)
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
            this.spkManager.getByReference(transferInDoc.reference).
            then(spkDoc => {
                if(spkDoc){
                    if(transferInDoc.password != spkDoc.password){
                        errors["password"] = "invalid password";
                    }
                    if(transferInDoc.reference == ""){
                        errors["reference"] = "reference is required";
                    }
                    if(transferInDoc.items.length <= 0){
                        errors["items"] = "no item(s) to transfer in";
                    }
                    if(spkDoc.sourceId.toString() != transferInDoc.sourceId.toString()){
                        errors["sourceId"] = "invalid sourceId";
                    }
                    if(spkDoc.destinationId.toString() != transferInDoc.destinationId.toString()){
                        errors["destinationId"] = "invalid destinationId";
                    }
                    if(spkDoc.isReceived){
                        errors["isReceived"] = "this reference already received";
                    }
                    for(var item of transferInDoc.items){
                        if(item.quantity <= 0)
                            errors["items"] = "items should not contains 0 quantity";
                    }
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }
                }else{
                    errors["reference"] = "reference not found";
                    var ValidationError = require('../../validation-error');
                    reject(new ValidationError('data does not pass validation', errors));
                }
                resolve(transferInDoc);
            })
            .catch(e=>{
                reject(e);
            })
        });
    } 
};