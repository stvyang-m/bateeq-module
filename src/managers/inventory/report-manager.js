'use strict';

var ObjectId = require('mongodb').ObjectId;
var BaseManager = require('module-toolkit').BaseManager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var SalesManager = require('../../src/managers/sales/sales-manager');


module.exports = class InventoryROReportManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.inventoryCollection = this.db.use(map.inventory.Inventory);
        this.salesCollection = new SalesManager(db, user);
    }

    getReportItemsByRealizationOrder(realizationOrder) {

    }

    //Group by store location
    getItemsSalesFromSalesDocByRealizationOrder() {

    }

    //Group by store location
    getItemsFromInventoryByRealizationOrder(realizationOrder) {
        var aggregate = [
            {
                $match: {
                    $and: [{ "_deleted": false }, { 'item.article.realizationOrder': realizationOrder }]
                }
            },
            {
                $group:
                {
                    _id: '$storage.code',
                    items: { $push: {'store': '$storage.name', 'size': '$item.size', 'quantity': '$quantity'} }
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