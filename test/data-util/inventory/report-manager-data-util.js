"use strict";
var helper = require("./../../helper");
var BaseManager = require('module-toolkit').BaseManager;
var ItemManager = require("../../../src/managers/master/item-manager");
var itemManager = null;

class ReportManagerDataUtil extends BaseManager {
    getInventoryData(data) {
        return new Promise((resolve, reject) => {
            helper.getDb()
                .then(db => {
                    data(db)
                        .then(result => {
                            var Inventory = require('bateeq-models').inventory.Inventory;
                            itemManager = new ItemManager(db, 'unit-test');
                            var storage = result.storages["UT-ST1"];
                            var item = result.items["UT-AV2"];
                            var quantity = 10;
                            var inventory = new Inventory();

                            item["article"] = { "realizationOrder": "ABDCEDASCD" };
                            itemManager.update(item)
                                .then(id => {
                                    this.getSingleById(id)
                                        .then(result => {
                                            console.log(result);
                                            inventory.storageId = storage._id;
                                            inventory.storage = storage;
                                            inventory.itemId = items._id;
                                            inventory.item = item;
                                            inventory.quantity = quantity;
                                            resolve(inventory);
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