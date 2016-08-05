 'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ExpeditionsDoc = BateeqModels.inventory.ExpeditionsDoc; 
var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var TransferOutItem = BateeqModels.inventory.TransferOutItem; 

const moduleId = "EFR-KB/EXB"; 
module.exports = class PusatBarangBaruKirimBarangJadiAksesorisManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.expeditionsDocCollection = this.db.use(map.inventory.ExpeditionsDoc);  
        
        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);   
        
        var TransferOutDocManager = require('./transfer-out-doc-manager');
        this.transferOutDocManager = new TransferOutDocManager(db, user); 

        var ModuleSeedManager = require('../core/module-seed-manager');
        this.moduleSeedManager = new ModuleSeedManager(db, user);
        
        var SpkManager = require('../merchandiser/efr-pk-manager');
        this.spkManager = new SpkManager(db, user);

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


            this.expeditionsDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(expeditionsDocs => {
                    resolve(expeditionsDocs);
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
                .then(expeditionsDoc => {
                    resolve(expeditionsDoc);
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
                .then(expeditionsDoc => {
                    resolve(expeditionsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.expeditionsDocCollection
                .single(query)
                .then(expeditionsDoc => {
                    resolve(expeditionsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.expeditionsDocCollection
                .singleOrDefault(query)
                .then(expeditionsDoc => {
                    resolve(expeditionsDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(expeditionsDoc) {
        return new Promise((resolve, reject) => {
            this._validate(expeditionsDoc)
                .then(validatedExpeditionsDoc => {
                    var now = new Date();
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    
                    //Create Code
                    var getModules = [];
                    this.moduleSeedManager.getModuleSeed(moduleId, year, month)
                        .then(resultModule => {  
                            //get Code
                            var number = ++resultModule.seed;
                            var zero = 4 - number.toString().length + 1;
                            var runningNumber = Array(+(zero > 0 && zero)).join("0") + number;
                            zero = 2 - month.toString().length + 1;
                            var formattedMonth = Array(+(zero > 0 && zero)).join("0") + month;
                            var code = `${runningNumber}/${moduleId}/${formattedMonth}/${year}`; 
                             
                             
                            var getMethods = [];
                            //Update Counter Number Code
                            getMethods.push(this.moduleSeedManager.update(resultModule));
                             
                            //Create Transfer Out
                            var validTransferOutDoc = {};
                            validTransferOutDoc.code = code;
                            validTransferOutDoc.reference = code;
                            validTransferOutDoc.sourceId = expeditionsDoc.sourceId;
                            validTransferOutDoc.destinationId = expeditionsDoc.destinationId;
                            validTransferOutDoc.items = [];
                            for(var spkDocument of validatedExpeditionsDoc.spkDocuments) {
                                for(var item of spkDocument.spkDocument.items){ 
                                    var newitem = {}; 
                                    newitem.articleVariantId = item.articleVariantId;
                                    newitem.quantity = item.quantity;
                                    validTransferOutDoc.items.push(newitem);
                                }
                            } 
                            validTransferOutDoc = new TransferOutDoc(validTransferOutDoc);
                            getMethods.push(this.transferOutDocManager.create(validTransferOutDoc)); 
                                    
                            Promise.all(getMethods)
                                .then(results => { 
                                    var transferOutResultId = results[1];  
                                    //Get Transfer Out using ID
                                    this.transferOutDocManager.getByIdOrDefault(transferOutResultId)
                                        .then(transferOutResult => {  
                                            var transferOutData = transferOutResult; 
                                            //Create Expeditions
                                            var validExpeditionDoc = {};
                                            validExpeditionDoc.code = code; 
                                            validExpeditionDoc.expedition = validatedExpeditionsDoc.expedition; 
                                            validExpeditionDoc.weight = validatedExpeditionsDoc.weight; 
                                            validExpeditionDoc.transferOutDocumentId = transferOutResultId;
                                            validExpeditionDoc.transferOutDocument = transferOutData; 
                                            validExpeditionDoc.spkDocuments = validatedExpeditionsDoc.spkDocuments 
                                            validExpeditionDoc = new ExpeditionsDoc(validExpeditionDoc);   
                                            this.expeditionsDocCollection.insert(validExpeditionDoc)
                                                .then(result => {
                                                    resolve(result);
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

    update(expeditionsDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    delete(expeditionsDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    _validate(expeditionsDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = expeditionsDoc;
            var getPromise = [];
            for(var spk of expeditionsDoc.spkDocuments){
                getPromise.push(this.spkManager.getByIdOrDefault(spk.spkDocumentId));
            }
            
            Promise.all(getPromise)
                .then(spks => {
                    var itemErrors = [];
                    if (spks.length > 0) {
                        var index = 0;
                        for(var spk of spks) { 
                            var itemError = {};
                            if(spk){
                                expeditionsDoc.spkDocuments[index].spkDocument = spk;
                            }
                            else{
                                itemError["spkDocument"] = "SPK Document not found";
                            }
                            itemErrors.push(itemError);
                        }
                    }
                    for (var itemError of itemErrors) {
                        for (var prop in itemError) {
                            errors.spkDocuments = itemErrors;
                            break;
                        }
                        if (errors.items)
                            break;
                    }
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }
                    valid = new ExpeditionsDoc(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid)
                })
                .catch(e => {
                    reject(e);
                });  
        });
    } 
};