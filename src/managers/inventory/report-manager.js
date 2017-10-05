'use strict';

var ObjectId = require('mongodb').ObjectId;
var BateeqModels = require('bateeq-models');
var InventoryManager = require('./inventory-manager');
var ExpeditionManager = null;
var map = BateeqModels.map;

var SalesManager = require('../sales/sales-manager');


module.exports = class ReportManager extends InventoryManager {
    constructor(db, user) {
        super(db, user);
        this.expeditionDocCollection = this.db.use(map.inventory.ExpeditionDoc);
        this.salesCollection = this.db.use(map.sales.SalesDoc);
    }

    getReportItemsByRealizationOrder(realizationOrder) {
        return new Promise((resolve, reject) => {
            var items = this._getItemsFromInventoryByRealizationOrder(realizationOrder);
            var latestDate = this._getLatestdateFromExpeditionByRealizationOrder(realizationOrder);
            var sales = this._getItemsSalesFromSalesDocByRealizationOrder(realizationOrder);

            Promise.all([items, latestDate, sales]).then(results => {
                var dataItems = results[0].map((dataItem) => {
                    var item = {};
                    var detailOnInventory = [];
                    var detailOnSales = [];

                    if (results[0]) {
                        for (var inventoryItem of dataItem.items) {
                            var itemSize = inventoryItem.size;
                            var itemOnInventory = inventoryItem.quantity;

                            var itemDetail = {
                                'size': itemSize,
                                'quantityOnInventory': itemOnInventory
                            }

                            detailOnInventory.push(itemDetail);
                        }

                        item['storageName'] = dataItem._id;
                        item['detailOnInventory'] = detailOnInventory;
                    }

                    if (results[1]) {
                        item['age'] = results[1];
                    }

                    if (results[2]) {
                        for (var i = 0; i < results[2].length; i++) {
                            if (sales[i]._id === dataItem._id) {
                                var itemSize = [];
                                var itemOnsales = [];
                            }

                            var itemDetail = {
                                'size': itemSize,
                                'quantityOnSales': itemOnsales
                            };

                            detailOnSales.push(itemDetail);
                        }
                        item['detailOnSales'] = detailOnSales;
                    }

                    return item;
                });
                resolve([].concat.apply([], dataItems));
            }).catch((error) => {
                reject(error);
            });
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
                    if (expeditionDates[0]) {
                        resolve(expeditionDates[0]._createdDate);
                    } else {
                        resolve(new Date());
                    }
                }).catch((error) => {
                    reject(error);
                })
        });
    }

    //Group by store location
    _getItemsSalesFromSalesDocByRealizationOrder(realizationOrder) {
        var aggregate = [
            { $unwind: '$items' },
            {
                $match: {
                    $and: [{ "_deleted": false }, { 'items.item.article.realizationOrder': realizationOrder }]
                }
            },
            {
                $group:
                {
                    _id: { storage: '$store.storage.name', size: '$items.item.size' },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            {
                $sort: { '_id.storage': 1 }
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
                    _id: { storage: '$storage.name', size: '$item.size' },
                    quantity: { $sum: '$quantity' }
                }
            },
            {

                $sort: { "_id.storage": 1 }
            }
        ];

        return new Promise((resolve, reject) => {
            this.collection.aggregate(aggregate)
                .toArray((err, result) => {
                    resolve(result);
                });
        });
    }
}