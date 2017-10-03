"use strict";
var helper = require("./../../helper");
var BaseManager = require('module-toolkit').BaseManager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
var ItemManager = require("../../../src/managers/master/item-manager");
var FinishGoodManager = require("../../../src/managers/master/finished-goods-manager");
var InventoryManager = require("../../../src/managers/inventory/inventory-manager");

class ReportManagerDataUtil extends BaseManager {

    getExpeditionData(data) {
        return new Promise((resolve, reject) => {
            helper.getDb()
                .then(db => {
                    data(db)
                        .then(result => {
                            resolve();
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

    getInventoryData(data) {
        return new Promise((resolve, reject) => {
            helper.getDb()
                .then(db => {
                    this.db = db;
                    this.collection = this.db.use(map.master.Item);
                    data(db)
                        .then(result => {
                            var finishGoodManager = new FinishGoodManager(db, 'unit-test');
                            var itemManager = new ItemManager(db, 'unit-test');
                            var inventoryManager = new InventoryManager(db, 'unit-test');
                            var Inventory = require('bateeq-models').inventory.Inventory;
                            var storage = result.storages["UT-ST1"];
                            var item = result.items["UT-AV2"];
                            var quantity = 10;

                            var FinishedItem = require('bateeq-models').master.FinishedGoods;
                            var finishedItem = null;


                            if (!item.article) {
                                finishedItem = new FinishedItem(item);
                                finishedItem.article = {
                                    "realizationOrder": "G78564343"
                                };
                            } else {
                                finishedItem = item;
                            }

                            itemManager.update(finishedItem)
                                .then(id => {
                                    this.getSingleById(id)
                                        .then(result => {
                                            inventoryManager
                                                .getByStorageIdAndItemId(storage._id, result._id)
                                                .then(inventoryData => {
                                                    if (inventoryData) {
                                                        if (inventoryData.item.article) {
                                                            resolve(inventoryData);
                                                        } else {

                                                            if (inventoryData._id) {
                                                                inventoryData.storageId = storage._id;
                                                                inventoryData.storage = storage;
                                                                inventoryData.itemId = result._id;
                                                                inventoryData.item = result;
                                                                inventoryData.quantity = quantity;

                                                                inventoryManager.update(inventoryData)
                                                                    .then(id => {
                                                                        inventoryManager.getSingleById(id)
                                                                            .then(inventoryData => {
                                                                                resolve(inventoryData);
                                                                            }).catch(e => {
                                                                                reject(e);
                                                                            });
                                                                    });
                                                            } else {
                                                                var inventory = new Inventory();
                                                                inventory.storageId = storage._id;
                                                                inventory.storage = storage;
                                                                inventory.itemId = result._id;
                                                                inventory.item = result;
                                                                inventory.quantity = quantity;

                                                                inventoryManager.create(inventory)
                                                                    .then(id => {
                                                                        inventoryManager.getSingleById(id)
                                                                            .then(inventoryData => {
                                                                                resolve(inventoryData);
                                                                            }).catch(e => {
                                                                                reject(e);
                                                                            });
                                                                    });
                                                            }
                                                        }
                                                    }
                                                }).catch(e => {
                                                    reject(e);
                                                })
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                });
                        }).catch(e => {
                            reject(e);
                        });
                }).catch(e => {
                    reject(e);
                });
        });
    }
}
module.exports = new ReportManagerDataUtil();