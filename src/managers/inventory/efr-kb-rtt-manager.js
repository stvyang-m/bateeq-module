'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var generateCode = require('../../utils/code-generator');
var map = BateeqModels.map;

var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var TransferOutItem = BateeqModels.inventory.TransferOutItem;

const moduleId = "EFR-KB/RTT";
const modulePackingList = "EFR-KB/PBR";
module.exports = class TokoTransferStokManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.transferOutDocCollection = this.db.use(map.inventory.TransferOutDoc);
        var StorageManager = require('./storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../core/article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var InventoryManager = require('./inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);

        var TrasferOutManager = require('./transfer-out-doc-manager');
        this.transferOutDocManager = new TrasferOutManager(db, user);

        var ModuleManager = require('../core/module-manager');
        this.moduleManager = new ModuleManager(db, user);

        var PusatReturTokoTerimaBarangReturManager = require('./efr-tb-brt-manager');
        this.pusatReturTokoTerimaBarangReturManager = new PusatReturTokoTerimaBarangReturManager(db, user);

        var SPKBarangJadiReturManager = require('../merchandiser/efr-pk-pbr-manager');
        this.spkBarangJadiReturManager = new SPKBarangJadiReturManager(db, user);

        var PusatBarangBaruKirimBarangJadiAksesorisManager = require('./efr-kb-exb-manager');
        this.pusatBarangBaruKirimBarangJadiAksesorisManager = new PusatBarangBaruKirimBarangJadiAksesorisManager(db, user);

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

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
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

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.transferOutDocCollection
                .singleOrDefault(query)
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
                    validTransferOutDoc.code = generateCode(moduleId);
                    this.storageManager.getByCode("PST-3")
                        .then(storage => {
                            var transferinDoc = {};
                            transferinDoc.source = validTransferOutDoc.source;
                            transferinDoc.sourceId = validTransferOutDoc.sourceId;
                            transferinDoc.destination = storage;
                            transferinDoc.destinationId = storage._id;
                            transferinDoc.items = validTransferOutDoc.items;
                            transferinDoc.reference = validTransferOutDoc.code;

                            var spkDoc = {};
                            spkDoc.source = storage;
                            spkDoc.sourceId = storage._id;
                            spkDoc.destination = validTransferOutDoc.destination;
                            spkDoc.destinationId = validTransferOutDoc.destinationId;
                            spkDoc.items = validTransferOutDoc.items;
                            spkDoc.packingList = generateCode(modulePackingList);
                            spkDoc.isDraft = false;
                            spkDoc.isReceived = false;
                            spkDoc.reference = validTransferOutDoc.code;

                            var ekspedisiDoc = {};
                            ekspedisiDoc.destination = validTransferOutDoc.destination;
                            ekspedisiDoc.destinationId = validTransferOutDoc.destinationId;
                            ekspedisiDoc.items = validTransferOutDoc.items;
                            ekspedisiDoc.expedition = "Dikirim Sendiri";
                            ekspedisiDoc.weight = 0;

                            this.transferOutDocManager.create(validTransferOutDoc)
                                .then(id => {
                                    this.pusatReturTokoTerimaBarangReturManager.create(transferinDoc);
                                    this.spkBarangJadiReturManager.create(spkDoc);
                                    this.pusatBarangBaruKirimBarangJadiAksesorisManager.create(ekspedisiDoc);
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
                })
        })

    }

    update(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {
                    this.transferOutDocManager.update(validTransferOutDoc)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(ex => {
                            reject(ex);
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
                    this.transferOutDocManager.update(validTransferOutDoc)
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
        var errors={};
        return new Promise((resolve, reject) => {
            var valid = transferOutDoc;
            this.moduleManager.getByCode(moduleId)
                .then(module => {
                    var config = module.config;
                    if (!valid.sourceId || valid.sourceId == '')
                        errors["sourceId"] = "sourceId is required";
                    else {
                        if (config) {
                            if (config.source) {
                                var isAny = false;
                                if (config.source.type == "selection") {
                                    for (var sourceId of config.source.value) {
                                        if (sourceId.toString() == valid.sourceId.toString()) {
                                            isAny = true;
                                            break;
                                        }
                                    }
                                }
                                else {
                                    if (config.source.value.toString() == valid.sourceId.toString())
                                        isAny = true;
                                }
                                if (!isAny)
                                    errors["sourceId"] = "sourceId is not valid";
                            }
                        }
                    }

                    if (!valid.destinationId || valid.destinationId == '')
                        errors["destinationId"] = "destinationId is required";
                    else {
                        if (config) {
                            if (config.destination) {
                                var isAny = false;
                                if (config.destination.type == "selection") {
                                    for (var destinationId of config.destination.value) {
                                        if (destinationId.toString() == valid.destinationId.toString()) {
                                            isAny = true;
                                            break;
                                        }
                                    }
                                }
                                else {
                                    if (config.destination.value.toString() == valid.destinationId.toString())
                                        isAny = true;
                                }
                                if (!isAny)
                                    errors["destinationId"] = "destinationId is not valid";
                            }
                        }
                    }
                    var getItem = [];
                    if (valid.items && valid.items.length > 0) {
                        for (var item of valid.items) {
                            getItem.push(this.inventoryManager.getByStorageIdAndArticleVarianIdOrDefault(valid.sourceId, item.articleVariantId))
                        }
                    }
                    else {
                        errors["items"] = "items is required";
                    }

                    Promise.all(getItem)
                        .then(results => {
                            var index = 0;
                            var itemErrors = [];
                            var itemError = {};

                            if (results.length > 0) {
                                for (var item of valid.items) {
                                    if (results[index] == null) {
                                        var inventoryQuantity = 0;
                                    } else {
                                        var inventoryQuantity = results[index].quantity;
                                    }
                                    index++;
                                    if (item.quantity > inventoryQuantity) {
                                        itemError["quantity"] = "Tidak bisa simpan jika Quantity Pengiriman > Quantity Stock";
                                    }
                                    itemErrors.push(itemError);
                                }
                            }
                            for (var itemError of itemErrors) {
                                for (var prop in itemError) {
                                    errors.items = itemErrors;
                                    break;
                                }
                                if (errors.items)
                                    break;
                            }
                            for (var prop in errors) {
                                var ValidationError = require('../../validation-error');
                                reject(new ValidationError('data does not pass validation', errors));
                            }
                            resolve(valid); 
                        }).catch(e => {
                            reject(e);
                        }); 
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
};



