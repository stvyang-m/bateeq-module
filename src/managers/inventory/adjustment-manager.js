'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BaseManager = require('module-toolkit').BaseManager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var AdjustmentDoc = BateeqModels.inventory.AdjusmentDoc;
var generateCode = require('../../utils/code-generator');

const moduleId = "EFR-SO/INT";
module.exports = class AdjustmentStockManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.inventory.AdjustmentDoc);
        var StorageManager = require('../master/storage-manager');
        this.storageManager = new StorageManager(db, user);

        var InventoryManager = require('./inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);

        var TransferOutDocManager = require('./transfer-out-doc-manager');
        this.transferOutDocManager = new TransferOutDocManager(db, user);

        var TransferInDocManager = require('./transfer-in-doc-manager');
        this.transferInDocManager = new TransferInDocManager(db, user);

        var ModuleManager = require('../master/module-manager');
        this.moduleManager = new ModuleManager(db, user);
    }

    _getQuery(paging) {
        var deletedFilter = {
            _deleted: false
        }, keywordFilter = {};

        var query = {};
        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterStorage = {
                'storage.name': {
                    '$regex': regex
                }
            };
            keywordFilter = {
                '$or': [filterCode, filterStorage]
            };
        }
        query = { '$and': [deletedFilter, paging.filter, keywordFilter] }
        return query;
    }

    create(adjusmentDoc) {
        return new Promise((resolve, reject) => {
            var itemIn = [];
            var itemOut = [];
            var length = adjusmentDoc.items.length;
            for (var i = 0; i < length; i++) {
                var item = adjusmentDoc.items[i];
                if (item.inQty != 0 && item.outQty == 0) {
                    item.quantity = item.inQty;
                    itemIn.push(item);
                } else if (item.inQty == 0 && item.outQty != 0) {
                    item.quantity = item.outQty;
                    itemOut.push(item);
                }
            }
            this._validate(adjusmentDoc)
                .then(validAdjusmentDoc => {
                    var transferStok = [];
                    validAdjusmentDoc.code = generateCode(moduleId);
                    validAdjusmentDoc._createdDate = new Date();
                    transferStok.push(this.collection.insert(validAdjusmentDoc));

                    var transferOutDoc = {};
                    if (itemOut.length > 0) {
                        transferOutDoc.code = generateCode("EFR-KB/ADJ");
                        transferOutDoc.destination = validAdjusmentDoc.storage;
                        transferOutDoc.destinationId = validAdjusmentDoc.storageId;
                        transferOutDoc.items = itemOut;
                        transferOutDoc.reference = validAdjusmentDoc.code;
                        transferOutDoc.source = validAdjusmentDoc.storage;
                        transferOutDoc.sourceId = validAdjusmentDoc.storageId;
                        transferStok.push(this.transferOutDocManager.create(transferOutDoc));
                    }

                    var transferinDoc = {};
                    if (itemIn.length > 0) {
                        transferinDoc.code = generateCode("EFR-TB/ADJ");
                        transferinDoc.source = validAdjusmentDoc.storage;
                        transferinDoc.sourceId = validAdjusmentDoc.storageId;
                        transferinDoc.destination = validAdjusmentDoc.storage;
                        transferinDoc.destinationId = validAdjusmentDoc.storageId;
                        transferinDoc.items = itemIn;
                        transferinDoc.reference = validAdjusmentDoc.code;
                        transferStok.push(this.transferInDocManager.create(transferinDoc));
                    }

                    Promise.all(transferStok)
                        .then(id => {
                            resolve(id[0]);
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

    _validate(adjustmentDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = adjustmentDoc;

            var getItem = [];
            if (valid.items && valid.items.length > 0) {
                for (var item of valid.items) {
                    getItem.push(this.inventoryManager.getByStorageIdAndItemIdOrDefault(valid.sourceId, item.itemId))
                }
            }
            else {
                errors["items"] = "items is required";
            }

            if (valid.source) {
                valid.storage = valid.source;
            }
            if (valid.source) {
                valid.storageId = valid.source._id;
            }

            Promise.all([].concat(getItem))
                .then(results => {
                    var index = 0;
                    var inventoryQuantity = 0;
                    var items = results.slice(0, results.length);
                    if (items.length > 0) {
                        var itemErrors = [];
                        for (var item of valid.items) {
                            var itemError = {};
                            if (items[index] == null) {
                                inventoryQuantity = 0;
                            } else {
                                item.qtyBeforeAdjustment = items[index].quantity;
                                item.item = items[index].item;
                                if (item.inQty != 0 && item.outQty == 0) {
                                    item.qtyAdjustment = item.inQty;
                                } else if (item.inQty == 0 && item.outQty != 0) {
                                    item.qtyAdjustment = item.outQty;
                                }
                            }
                            index++;
                            if (item.remarks == "" || !item.remarks) {
                                itemError["remarks"] = "remarks harus diisi";
                            } else {
                                item.remark = item.remarks;
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
                        var ValidationError = require('module-toolkit').ValidationError;
                        reject(new ValidationError('data does not pass validation', errors));
                    }
                    valid = new AdjustmentDoc(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                }).catch(e => {
                    reject(e);
                });

        });
    }
};