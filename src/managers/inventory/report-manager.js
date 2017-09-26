'use strict';

var ObjectId = require('mongodb').ObjectId;
var BaseManager = require('module-toolkit').BaseManager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var SalesManager = require('../../src/managers/sales/sales-manager');


module.exports = class ReportManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.inventoryCollection = this.db.use(map.inventory.Inventory);
        this.expeditionDocCollection = this.db.use(map.inventory.ExpeditionDoc);
        this.salesCollection = this.db.use(map.sales.SalesDoc);
    }

    getReportItemsByRealizationOrder(realizationOrder) {
        var latestDate = this._getLatestdateFromExpeditionByRealizationOrder(realizationOrder);
        var items = this._getItemsFromInventoryByRealizationOrder(realizationOrder);
        var sales = this._getItemsSalesFromSalesDocByRealizationOrder(realizationOrder);

        Promise.all(latestDate, [items], [sales]).then(results => {
            var dataItems = results[1].map((dataItem) => {
                var item = {};
                var detailOnInventory = [];

                for (var i = 0; i < dataItem.items; i++) {
                    var itemSize = dataItem.items[i].size;
                    var itemOnInventory = dataItem.items[i].quantity;

                    var itemDetail = {
                        'size' : itemSize,
                        'quantityOnInventory' : itemOnInventory
                    }

                    detailOnInventory.push(itemDetail);
                }

                item['storageName'] = dataItem._id;
                item['detailOnInventory'] = detailOnInventory;

                return item;
            });
        }).cacth((error) => {
            reject(error);
        });
    }

    _getLatestdateFromExpeditionByRealizationOrder(realizationOrder) {
        return new Promise((resolve, reject) => {
            this.expeditionDocCollection
                .find({ 'spkDocuments.items.item.article.realizationOrder': realizationOrder })
                .sort({ "_createdDate": 1 })
                .limit(1)
                .toArray()
                .then((expeditionDates) => {
                    resolve(expeditionDates[0]._createdDate);
                }).catch((error) => {
                    reject(error);
                })
        });
    }

    //Group by store location
    _getItemsSalesFromSalesDocByRealizationOrder(realizationOrder) {
        var aggregate = [
            {
                $match: {
                    $and: [{ "_deleted": false }, { 'items.item.article.realizationOrder': realizationOrder }]
                }
            },
            {
                $group:
                {
                    _id: '$store.storage.name',
                    items: { $push: { 'size': '$items.item.size', 'quantitySold': '$items.quantity', 'totalPrice': '$items.total' } }
                }
            },
            {
                $sort: { "items.size": 1 }
            }
        ];

        return new Promise((resolve, reject) => {
            this.salesCollection.aggregate(aggregate)
                .toArray((err, result) => {
                    resolve(result);
                });
        });
    }

    //Group by store location
    _getItemsFromInventoryByRealizationOrder(realizationOrder) {
        var aggregate = [
            {
                $match: {
                    $and: [{ "_deleted": false }, { 'item.article.realizationOrder': realizationOrder }]
                }
            },
            {
                $group:
                {
                    _id: '$storage.name',
                    items: { $push: { 'size': '$item.size', 'quantity': '$quantity' } }
                }
            },
            {
                $sort: { "items.size": 1 }
            }
        ];

        return new Promise((resolve, reject) => {
            this.inventoryCollection.aggregate(aggregate)
                .toArray((err, result) => {
                    resolve(result);
                });
        });
    }
}