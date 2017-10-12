'use strict'

// Mongodb dependency
var ObjectId = require('mongodb').ObjectId;
require('mongodb-toolkit');
// Internal dependency
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
// External dependency
var BaseManager = require('module-toolkit').BaseManager;
var moment = require('moment');

module.exports = class MonthlyStockManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.inventory.InventoryMovement);
    }

    // GET START AND END YEAR BASED ON INVENTORY MOVEMENT
    _getFirstInventoryMovement() {
        return this.collection.find().sort({ date: 1 }).limit(1).toArray();
    }

    _getYearMonthsList(firstYear, lastYear, firstMonth, lastMonth) {
        var yearMonths = [];
        for (let i = firstYear; i <= lastYear; i++) {
            var each = this.__pushMonthBasedOnYear(i, firstYear, lastYear, firstMonth, lastMonth);
            yearMonths.push(each);
        }
        yearMonths.sort(function (a, b) { return b.year - a.year });
        return yearMonths;
    }

    __pushMonthBasedOnYear(currentYear, firstYear, lastYear, firstMonth, lastMonth) {
        var currentYearList = { year: currentYear, months: [] };
        if (currentYear === firstYear) {
            if (currentYear === lastYear) {
                for (let j = firstMonth; j <= lastMonth; j++) {
                    var currentMonth = this.__getMonthName(j);
                    currentYearList.months.push(currentMonth);
                }
            }
            else {
                for (let j = firstMonth; j <= 11; j++) {
                    var currentMonth = this.__getMonthName(j);
                    currentYearList.months.push(currentMonth);
                }
            }
        }
        else {
            if (currentYear === lastYear) {
                for (let j = 0; j <= lastMonth; j++) {
                    var currentMonth = this.__getMonthName(j);
                    currentYearList.months.push(currentMonth);
                }
            }
            else {
                for (let j = 0; j <= 11; j++) {
                    var currentMonth = this.__getMonthName(j);
                    currentYearList.months.push(currentMonth);
                }
            }

        }
        return currentYearList;
    }

    __getMonthName(monthNumber) {
        switch (monthNumber) {
            case 0:
                return { id: 0, name: "Januari" };
            case 1:
                return { id: 1, name: "Februari" };
            case 2:
                return { id: 2, name: "Maret" };
            case 3:
                return { id: 3, name: "April" };
            case 4:
                return { id: 4, name: "Mei" };
            case 5:
                return { id: 5, name: "Juni" };
            case 6:
                return { id: 6, name: "Juli" };
            case 7:
                return { id: 7, name: "Agustus" };
            case 8:
                return { id: 8, name: "September" };
            case 9:
                return { id: 9, name: "Oktober" };
            case 10:
                return { id: 10, name: "November" };
            case 11:
                return { id: 11, name: "Desember" };
        }
    }

    getYearMonthList() {
        var firstIM = this._getFirstInventoryMovement();
        var now = moment();
        return new Promise((resolve, reject) => {
            firstIM
                .then(results => {
                    var firstYear = results[0].date.getFullYear();
                    var firstMonth = results[0].date.getMonth();
                    var lastYear = parseInt(now.format('YYYY'));
                    var lastMonth = parseInt(now.format('MM')) - 1;
                    var yearMonthList = this._getYearMonthsList(firstYear, lastYear, firstMonth, lastMonth);
                    resolve(yearMonthList);
                })
        })
    }
    //

    // GET LOCALE TIME IN JAKARTA
    __getLocaleDateOfMonth(year, month, isStartOf) {
        var locale = isStartOf ? moment().month(month).year(year).startOf('month') : moment().month(month).year(year).endOf('month');
        return locale;
    }

    _setDateOfMonth(month, year) {
        var firstDay = this.__getLocaleDateOfMonth(year, month, true).format();
        var lastDay = this.__getLocaleDateOfMonth(year, month, false).format();
        return {
            firstDay: new Date(firstDay),
            lastDay: new Date(lastDay)
        }
    }
    //

    // GET INVENTORY ON PARTICULAR MONTH -> INVENTORY WITH MOVEMENT (EARLY AND LATE OF THE MONTH)
    _getAllStockThisMonth(date, sortRule, quantityRule) {
        var allStockThisMonth = [
            {
                $match: {
                    date: { $gte: date.firstDay, $lte: date.lastDay }
                }
            },
            { $group: { _id: { storageCode: "$storage.code", storageName: "$storage.name", itemCode: "$item.code", date: "$date", quantity: quantityRule, hpp: { $cond: { if: { $ne: ["$item.domesticCOGS", ""] }, then: "$item.domesticCOGS", else: "$item.internationalCOGS" } }, sale: { $cond: { if: { $ne: ["$item.domesticSale", ""] }, then: "$item.domesticSale", else: "$item.internationalSale" } } } } }, // earliest = before, latest = $after
            { $sort: { "_id.date": sortRule } }, // earliest =  1, latest = -1
            { $group: { _id: { storageCode: "$_id.storageCode", storageName: "$_id.storageName", itemCode: "$_id.itemCode" }, quantity: { $first: "$_id.quantity" }, hpp: { $first: "$_id.hpp" }, sale: { $first: "$_id.sale" } } },
            { $group: { _id: { storageCode: "$_id.storageCode", storageName: "$_id.storageName", itemCode: "$_id.itemCode", quantity: "$quantity", hpp: { $multiply: ["$quantity", "$hpp"] }, sale: { $multiply: ["$quantity", "$sale"] } } } },
            { $group: { _id: { storageCode: "$_id.storageCode", storageName: "$_id.storageName" }, quantity: { $sum: "$_id.quantity" }, hpp: { $sum: "$_id.hpp" }, sale: { $sum: "$_id.sale" } } }
        ]
        var query = this.collection.aggregate(allStockThisMonth).toArray();
        return query;
    }
    //

    // GET INVENTORY ON PARTICULAR MONTH -> INVENTORY WITHOUT MOVEMENT
    _getStorageItemPairs(date) {
        var storageItemPairs = [
            {
                $match: {
                    date: { $gte: date.firstDay, $lte: date.lastDay },
                }
            },
            { $group: { _id: { storageCode: "$storage.code", itemCode: "$item.code" } } }
        ]
        var query = this.collection.aggregate(storageItemPairs).toArray();
        return query;
    }

    _groupStorageItemPairs(stocks) {
        var storageItemPairs = [];
        stocks.reduce(function (res, value) {
            if (!res[value._id.storageCode]) {
                res[value._id.storageCode] = {
                    storage: value._id.storageCode,
                    items: []
                };
                storageItemPairs.push(res[value._id.storageCode])
            }
            res[value._id.storageCode].items.push(value._id.itemCode)
            return res;
        }, {})
        return storageItemPairs;
    }

    __constructOrQuery(pairs) {
        var query = [], storageQuery = {}, storageNin = {};
        storageNin["$nin"] = [];
        for (var and of pairs) {
            var andQuery = {};
            andQuery["$and"] = [];
            var storage = {}, eq = {};
            eq["$eq"] = and.storage;
            storage["storage.code"] = eq;
            var item = {}, nin = {};
            nin["$nin"] = and.items;
            item["item.code"] = nin;
            andQuery["$and"].push(storage);
            andQuery["$and"].push(item);
            query.push(andQuery);
            storageNin["$nin"].push(and.storage);
        }
        storageQuery["storage.code"] = storageNin;
        query.push(storageQuery);
        return query;
    }

    _getAllStockBeforeThis(date, pairs) {
        var orQuery = this.__constructOrQuery(pairs);
        var allStockBeforeThis = [
            {
                $match: {
                    date: { $lte: date.firstDay },
                    $or: orQuery
                }
            },
            { $group: { _id: { storageCode: "$storage.code", storageName: "$storage.name", itemCode: "$item.code", date: "$date", quantity: "$after", hpp: { $cond: { if: { $ne: ["$item.domesticCOGS", ""] }, then: "$item.domesticCOGS", else: "$item.internationalCOGS" } }, sale: { $cond: { if: { $ne: ["$item.domesticSale", ""] }, then: "$item.domesticSale", else: "$item.internationalSale" } } } } },
            { $sort: { "_id.date": -1 } },
            { $group: { _id: { storageCode: "$_id.storageCode", storageName: "$_id.storageName", itemCode: "$_id.itemCode" }, quantity: { $first: "$_id.quantity" }, hpp: { $first: "$_id.hpp" }, sale: { $first: "$_id.sale" } } },
            { $group: { _id: { storageCode: "$_id.storageCode", storageName: "$_id.storageName", itemCode: "$_id.itemCode", quantity: "$quantity", hpp: { $multiply: ["$quantity", "$hpp"] }, sale: { $multiply: ["$quantity", "$sale"] } } } },
            { $group: { _id: { storageCode: "$_id.storageCode", storageName: "$_id.storageName" }, quantity: { $sum: "$_id.quantity" }, hpp: { $sum: "$_id.hpp" }, sale: { $sum: "$_id.sale" } } }
        ]
        var query = this.collection.aggregate(allStockBeforeThis).toArray();
        return query;
    }
    //

    // COMBINE INVENTORY WITH MOVEMENT AND INVENTORY WITHOUT MOVEMENT
    __embedEarliestWithLatest(earliest, latest) {
        var stocks = [];
        for (var ls of latest) {
            var theStock = {
                code: ls._id.storageCode,
                name: ls._id.storageName,
                latestQuantity: ls.quantity,
                latestHPP: ls.hpp,
                latestSale: ls.sale
            }
            var earliestStock = earliest.find(es => { return es._id.storageCode === theStock.code }); // find earliest storage based on storageCode of current iteration
            if (earliestStock) {
                theStock.earliestQuantity = earliestStock.quantity;
                theStock.earliestHPP = earliestStock.hpp;
                theStock.earliestSale = earliestStock.sale;
            }
            stocks.push(theStock);
        }
        return stocks;
    }

    __embedBeforeWithThisMonth(stocks, before) {
        before.forEach(item => {
            var foundStock = stocks.find(s => { return s.code === item._id.storageCode });
            if (foundStock) {
                var foundStockIndex = stocks.findIndex(s => { return s.code === item._id.storageCode });
                stocks[foundStockIndex].earliestQuantity += item.quantity;
                stocks[foundStockIndex].earliestHPP += item.hpp;
                stocks[foundStockIndex].earliestSale += item.sale;
                stocks[foundStockIndex].latestQuantity += item.quantity;
                stocks[foundStockIndex].latestHPP += item.hpp;
                stocks[foundStockIndex].latestSale += item.sale;
            }
            else {
                var additionalStock = {};
                additionalStock.code = item._id.storageCode;
                additionalStock.name = item._id.storageName;
                additionalStock.earliestQuantity = item.quantity;
                additionalStock.earliestHPP = item.hpp;
                additionalStock.earliestSale = item.sale;
                additionalStock.latestQuantity = item.quantity;
                additionalStock.latestHPP = item.hpp;
                additionalStock.latestSale = item.sale;
                stocks.push(additionalStock);
            }
        })
        return stocks;
    }

    _embedStocks(earliest, latest, before) {
        var earliestWithLatest = this.__embedEarliestWithLatest(earliest, latest);
        var allStocks = this.__embedBeforeWithThisMonth(earliestWithLatest, before);
        return allStocks;
    }
    //

    getOverallStock(month, year) {
        var stockDate = this._setDateOfMonth(month, year);
        var earliestThisMonthQuery = this._getAllStockThisMonth(stockDate, 1, "$before");
        var latestThisMonthQuery = this._getAllStockThisMonth(stockDate, -1, "$after");
        var pairsQuery = this._getStorageItemPairs(stockDate);
        return new Promise((resolve, reject) => {
            return Promise.all([earliestThisMonthQuery, latestThisMonthQuery, pairsQuery])
                .then(results => {
                    var earliestThisMonth = results[0];
                    var latestThisMonth = results[1];
                    var pairs = results[2];
                    var groupedPairs = this._groupStorageItemPairs(pairs);
                    var beforeThisMonthQuery = this._getAllStockBeforeThis(stockDate, groupedPairs);
                    return beforeThisMonthQuery
                        .then(beforeThisMonth => {
                            var finalStocks = this._embedStocks(earliestThisMonth, latestThisMonth, beforeThisMonth);
                            resolve(finalStocks);
                        })
                })
        })
    }

    // GET ITEM ON PARTICULAR MONTH AND STORAGE CODE -> INVENTORY WITH MOVEMENT
    _getItemThisMonth(date, storageCode) {
        var itemThisMonth = [
            {
                $match: {
                    date: { $gte: date.firstDay, $lte: date.lastDay },
                    "storage.code": storageCode
                }
            },
            {
                $group: {
                    _id: {
                        itemCode: "$item.code", itemName: "$item.name", date: "$date", quantity: "$after",
                        hpp: { $cond: { if: { $ne: ["$item.domesticCOGS", ""] }, then: "$item.domesticCOGS", else: "$item.internationalCOGS" } },
                        sale: { $cond: { if: { $ne: ["$item.domesticSale", ""] }, then: "$item.domesticSale", else: "$item.internationalSale" } }
                    }
                }
            },
            { $sort: { "_id.date": -1 } },
            { $group: { _id: { itemCode: "$_id.itemCode", itemName: "$_id.itemName" }, quantity: { $first: "$_id.quantity" }, hpp: { $first: "$_id.hpp" }, sale: { $first: "$_id.sale" } } },
            { $group: { _id: { itemCode: "$_id.itemCode", itemName: "$_id.itemName", quantity: "$quantity", hpp: { $multiply: ["$quantity", "$hpp"] }, sale: { $multiply: ["$quantity", "$sale"] } } } },
            { $project: { itemCode: "$_id.itemCode", itemName: "$_id.itemName", quantity: "$_id.quantity", totalHPP: "$_id.hpp", totalSale: "$_id.sale" } },
            { $match: { quantity: { $ne: 0 } } }
        ]
        var query = this.collection.aggregate(itemThisMonth).toArray();
        return query;
    }
    //

    _getItems(stocks) {
        var items = [];
        stocks.forEach(item => {
            items.push(item.itemCode);
        })
        return items;
    }

    // GET ITEM ON PARTICULAR MONTH AND STORAGE CODE -> INVENTORY WITH MOVEMENT
    _getItemBeforeThis(date, storageCode, items) {
        var itemBeforeThis = [
            {
                $match: {
                    date: { $lte: date.firstDay },
                    "storage.code": storageCode,
                    "item.code": { $nin: items }
                }
            },
            {
                $group: {
                    _id: {
                        itemCode: "$item.code", itemName: "$item.name", date: "$date", quantity: "$after",
                        hpp: { $cond: { if: { $ne: ["$item.domesticCOGS", ""] }, then: "$item.domesticCOGS", else: "$item.internationalCOGS" } },
                        sale: { $cond: { if: { $ne: ["$item.domesticSale", ""] }, then: "$item.domesticSale", else: "$item.internationalSale" } }
                    }
                }
            },
            { $sort: { "_id.date": -1 } },
            { $group: { _id: { itemCode: "$_id.itemCode", itemName: "$_id.itemName" }, quantity: { $first: "$_id.quantity" }, hpp: { $first: "$_id.hpp" }, sale: { $first: "$_id.sale" } } },
            { $group: { _id: { itemCode: "$_id.itemCode", itemName: "$_id.itemName", quantity: "$quantity", hpp: { $multiply: ["$quantity", "$hpp"] }, sale: { $multiply: ["$quantity", "$sale"] } } } },
            { $project: { itemCode: "$_id.itemCode", itemName: "$_id.itemName", quantity: "$_id.quantity", totalHPP: "$_id.hpp", totalSale: "$_id.sale" } },
            { $match: { quantity: { $ne: 0 } } }
        ]
        var query = this.collection.aggregate(itemBeforeThis).toArray();
        return query;
    }
    //

    _embedItems(thisMonth, before) {
        var allItems = [];
        thisMonth.forEach(item => {
            allItems.push(item);
        })
        before.forEach(item => {
            allItems.push(item);
        })
        return allItems;
    }

    getStockInStorage(storageCode, month, year) {
        var stockDate = this._setDateOfMonth(month, year);
        var stockThisMonthQuery = this._getItemThisMonth(stockDate, storageCode);
        return new Promise((resolve, reject) => {
            return stockThisMonthQuery
                .then(stockThisMonth => {
                    var items = this._getItems(stockThisMonth);
                    var stockBeforeThisQuery = this._getItemBeforeThis(stockDate, storageCode, items);
                    return stockBeforeThisQuery
                        .then(stockBeforeThis => {
                            var finalStocks = this._embedItems(stockThisMonth, stockBeforeThis);
                            resolve(finalStocks);
                        })
                })
        })
    }
}