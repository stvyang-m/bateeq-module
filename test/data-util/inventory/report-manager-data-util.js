"use strict";
var helper = require("./../../helper");
var BaseManager = require('module-toolkit').BaseManager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
var ItemManager = require("../../../src/managers/master/item-manager");
var FinishGoodManager = require("../../../src/managers/master/finished-goods-manager");
var itemManager = null;
var finishGoodManager = null;

class ReportManagerDataUtil extends BaseManager {

    getInventoryData(data) {
        return new Promise((resolve, reject) => {
            helper.getDb()
                .then(db => {
                    this.db = db;
                    this.collection = this.db.use(map.master.Item);
                    data(db)
                        .then(result => {
                            finishGoodManager = new FinishGoodManager(db, 'unit-test');
                            itemManager = new ItemManager(db, 'unit-test');

                            var Inventory = require('bateeq-models').inventory.Inventory;
                            var storage = result.storages["UT-ST1"];
                            var item = result.items["UT-AV2"];
                            var quantity = 10;
                            var inventory = new Inventory();
                            var FinishedItem = require('bateeq-models').master.FinishedGoods;
                            var finishedItem = new FinishedItem(item);

                            finishedItem.article = {"realizationOrder": "TGWGEGEGW"};

                            itemManager.update(finishedItem)
                                .then(id => {
                                    this.getSingleById(id)
                                        .then(result => {
                                            console.log(result);
                                            inventory.storageId = storage._id;
                                            inventory.storage = storage;
                                            inventory.itemId = result._id;
                                            inventory.item = result;
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