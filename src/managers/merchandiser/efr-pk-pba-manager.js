'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
var generateCode = require('../../utils/code-generator');

var SPKDoc = BateeqModels.merchandiser.SPK;
var SPKItem = BateeqModels.merchandiser.SPKItem;

var moduleId = "EFR-PK/PBA";

module.exports = class SPKBarangEmbalaseManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.SPKDocCollection = this.db.use(map.merchandiser.SPKDoc);
        var StorageManager = require('../inventory/storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../core/article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var InventoryManager = require('../inventory/inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);
        
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
                var filterPackingList = {
                    'packingList': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterCode, filterPackingList]
                };

                query['$and'].push($or);
            }
            this.SPKDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(spkDoc => {
                    resolve(spkDoc);
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
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.SPKDocCollection
                .single(query)
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.SPKDocCollection
                .singleOrDefault(query)
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }


    create(spkDoc) {
        return new Promise((resolve, reject) => {
            this._validate(spkDoc)
                .then(validSpkDoc => {
                    validSpkDoc.code = generateCode(moduleId);
                    this.SPKDocCollection.insert(validSpkDoc)
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
        });
    }

    createDraft(spkDoc) {
        return new Promise((resolve, reject) => {
            spkDoc.isDraft = true;
            this.create(spkDoc)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(spkDoc) {
        return new Promise((resolve, reject) => {
            this._validate(spkDoc)
                .then(validSpkDoc => {
                    this.SPKDocCollection.update(validSpkDoc)
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

    updateDraft(spkDoc) {
        return new Promise((resolve, reject) => {
            spkDoc.isDraft = true;
            this.update(spkDoc)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        });

    }

    updateNotDraft(spkDoc) {
        return new Promise((resolve, reject) => {
            spkDoc.isDraft = false;
            this.update(spkDoc)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        });

    }

    delete(spkDoc) {
        return new Promise((resolve, reject) => {
            this._validate(spkDoc)
                .then(validSpkDoc => {
                    validSpkDoc._deleted = true;
                    this.SPKDocCollection.update(validSpkDoc)
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

    _validate(spkDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = spkDoc;
            this.moduleManager.getByCode(moduleId)
                .then(module => {
                    // 1. begin: Declare promises.
                    var getSPKDoc = this.SPKDocCollection.singleOrDefault({
                        "$and": [{
                            _id: {
                                '$ne': new ObjectId(valid._id)
                            }
                        }, {
                                code: valid.code
                            }]
                    });
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
                            // getItems.push(this.articleVariantManager.getByIdOrDefault(item.articleVariantId));
                            getItem.push(this.inventoryManager.getByStorageIdAndArticleVarianIdOrDefault(valid.sourceId, item.articleVariantId))
                        }
                    }
                    else {
                        errors["items"] = "items is required";
                    }
                    Promise.all([getSPKDoc].concat(getItem))
                        .then(results => {
                            var _spkDoc = results[0];

                            if (valid._id == '') {
                                var getSPKDoc = this.SPKDocCollection.where(valid._id);
                                if (getSPKDoc.isDraft == false) {
                                    errors["isDraft"] = "this doc can not update because status not draft";
                                }
                            }

                            if (valid.date == "mm/dd/yyyy" || valid.date == "") {
                                errors["date"] = "date is required";
                            }

                            var inventoryVariants = results.slice(1, results.length)
                            // 2a. begin: Validate error on item level.
                            if (inventoryVariants[0]!=null) {
                                var itemErrors = [];
                                for (var variant of inventoryVariants) {
                                    var index = inventoryVariants.indexOf(variant);
                                    var item = valid.items[index];
                                    var itemError = {};

                                    if (!item.articleVariantId || item.articleVariantId == '') {
                                        itemError["articleVariantId"] = "articleVariantId is required";
                                    }
                                    if (!variant) {
                                        itemError["articleVariantId"] = "articleVariantId not found";
                                    }
                                    else {
                                        item.articleVariantId = variant._id;
                                        item.articleVariant = variant;
                                    }

                                    if (item.quantity == undefined || (item.quantity && item.quantity == '')) {
                                        itemError["quantity"] = "quantity is required";
                                    }
                                    else if (parseInt(item.quantity) <= 0) {
                                        itemError["quantity"] = "quantity must be greater than 0";
                                    }

                                    if (inventoryVariants[index] == null) {
                                        var inventoryQuantity = 0;
                                    } else {
                                        var inventoryQuantity = inventoryVariants[index].quantity;
                                    }
                                    if (item.quantity > inventoryQuantity) {
                                        itemError["quantity"] = "Tidak bisa simpan jika Quantity Pengiriman > Quantity Stock";
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
                            }

                            // 2c. begin: check if data has any error, reject if it has.
                            for (var prop in errors) {
                                var ValidationError = require('../../validation-error');
                                reject(new ValidationError('data does not pass validation', errors));
                            }
                            valid = new SPKDoc(valid);
                            valid.stamp(this.user.username, 'manager');
                            resolve(valid)
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

};