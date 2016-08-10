 'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ExpeditionDoc = BateeqModels.inventory.ExpeditionDoc; 
var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var TransferOutItem = BateeqModels.inventory.TransferOutItem; 
var SPK = BateeqModels.merchandiser.SPK; 
var generateCode = require('../../utils/code-generator');

const moduleId = "EFR-KB/EXB"; 
module.exports = class PusatBarangBaruKirimBarangJadiAksesorisManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.expeditionDocCollection = this.db.use(map.inventory.ExpeditionDoc);  
        
        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);   
        
        var TransferOutDocManager = require('./transfer-out-doc-manager');
        this.transferOutDocManager = new TransferOutDocManager(db, user); 
        
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


            this.expeditionDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(expeditionDocs => {
                    resolve(expeditionDocs);
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
                .then(expeditionDoc => {
                    resolve(expeditionDoc);
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
                .then(expeditionDoc => {
                    resolve(expeditionDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.expeditionDocCollection
                .single(query)
                .then(expeditionDoc => {
                    resolve(expeditionDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.expeditionDocCollection
                .singleOrDefault(query)
                .then(expeditionDoc => {
                    resolve(expeditionDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(expeditionDoc) {
        return new Promise((resolve, reject) => {
            //Validate Input Model
            this._validate(expeditionDoc)
                .then(validatedExpeditionDoc => {   
                    var getTransferOuts = [];
                    //Create Promise to Create Transfer Out
                    for(var spkDocument of validatedExpeditionDoc.spkDocuments) {
                        var code = generateCode(moduleId); 
                        var validTransferOutDoc = {};
                        validTransferOutDoc.code = code;
                        validTransferOutDoc.reference = spkDocument.spkDocument.packingList;
                        validTransferOutDoc.sourceId = spkDocument.spkDocument.sourceId;
                        validTransferOutDoc.destinationId = expeditionDoc.destinationId;
                        validTransferOutDoc.items = []; 
                        for(var item of spkDocument.spkDocument.items){ 
                            var newitem = {}; 
                            newitem.articleVariantId = item.articleVariantId;
                            newitem.quantity = item.quantity;
                            validTransferOutDoc.items.push(newitem);
                        }  
                        getTransferOuts.push(this.transferOutDocManager.create(validTransferOutDoc)); 
                    }   
                    //Create Transfer Out
                    Promise.all(getTransferOuts)
                        .then(results => {
                            getTransferOuts = [];
                            //Create Promise Get Transfer Out using ID
                            for(var transferOutResultId of results) {
                                getTransferOuts.push(this.transferOutDocManager.getByIdOrDefault(transferOutResultId)); 
                            } 
                            //Get Transfer Out
                            Promise.all(getTransferOuts)
                                .then(transferOutResults => {  
                                    //Create Expedition Model
                                    var validExpeditionDoc = {};
                                    validExpeditionDoc.code = code; 
                                    validExpeditionDoc.expedition = validatedExpeditionDoc.expedition; 
                                    validExpeditionDoc.weight = validatedExpeditionDoc.weight; 
                                    validExpeditionDoc.transferOutDocuments = []; 
                                    validExpeditionDoc.spkDocuments = validatedExpeditionDoc.spkDocuments 
                                    for(var transferOut of transferOutResults) {  
                                        validExpeditionDoc.transferOutDocuments.push(transferOut); 
                                    } 
                                    validExpeditionDoc = new ExpeditionDoc(validExpeditionDoc);  
                                    //Create Promise Expedition 
                                    this.expeditionDocCollection.insert(validExpeditionDoc)
                                        .then(resultExpeditionId => {
                                            //Get Expedition Data
                                            this.getByIdOrDefault(resultExpeditionId)
                                                .then(resultExpedition => {
                                                    var getSPKData = [];
                                                    //Create Promise get SPK Data for update
                                                    for(var spkDocument of validExpeditionDoc.spkDocuments) {
                                                        getSPKData.push(this.spkManager.getByIdOrDefault(spkDocument.spkDocumentId));
                                                    } 
                                                    //Get SPK Data
                                                    Promise.all(getSPKData)
                                                        .then(resultSPKs => { 
                                                            //Create Promise Update SPK Data
                                                            var getUpdateSPKData = [];
                                                            for(var resultSPK of resultSPKs) {
                                                                resultSPK.expeditionDocumentId = resultExpeditionId;
                                                                resultSPK.expeditionDocument = resultExpedition;
                                                                resultSPK = new SPK(resultSPK);
                                                                getUpdateSPKData.push(this.spkManager.update(resultSPK));
                                                            }
                                                            //Update SPK Data
                                                            Promise.all(getUpdateSPKData)
                                                                .then(resultUpdateSPKs => {  
                                                                    resolve(resultExpeditionId); 
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

    update(expeditionDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    delete(expeditionDoc) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    _validate(expeditionDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = expeditionDoc;
            var getPromise = [];
            for(var spk of expeditionDoc.spkDocuments){
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
                                expeditionDoc.spkDocuments[index].spkDocument = spk;
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
                    valid = new ExpeditionDoc(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid)
                })
                .catch(e => {
                    reject(e);
                });  
        });
    } 
};