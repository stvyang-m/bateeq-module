"use strict";

// dependency
var helper = require('../../helper');
var should = require('should');
let manager;

// hardcoded data
let itemStock = [
    {
        _id: { itemCode: 'UT-FG2', itemName: 'Silhouette M[UT]' },
        quantity: 215,
        hpp: 100000,
        sale: 100000
    },
    {
        _id: { itemCode: 'UT-AV1', itemName: 'Silhouette S[UT]' },
        quantity: 1140,
        hpp: 1000,
        sale: 5000
    },
    {
        _id: { itemCode: 'UT-FG3', itemName: 'Silhouette Version 3 M[UT]' },
        quantity: 215,
        hpp: 100000,
        sale: 100000
    }
]

let itemBefore = [
    {
        _id: { itemCode: 'UT-FG3', itemName: 'Silhouette Version 3 M[UT]' },
        quantity: 215,
        hpp: 100000,
        sale: 100000
    }
]

let itemThisMonth = [
    {
        _id: { itemCode: 'UT-FG2', itemName: 'Silhouette M[UT]' },
        quantity: 215,
        hpp: 100000,
        sale: 100000
    },
    {
        _id: { itemCode: 'UT-AV1', itemName: 'Silhouette S[UT]' },
        quantity: 1140,
        hpp: 1000,
        sale: 5000
    }
]

let items = ['UT-FG2', 'UT-AV1'];

let earliestStock = [
    {
        _id:
        {
            storageCode: 'UT-BJB',
            storageName: 'Pusat - Finished Goods[UT]'
        },
        quantity: 1315,
        hpp: 100000,
        sale: 100000
    },
    {
        _id:
        {
            storageCode: 'ST-BJB',
            storageName: 'Pusat - Finished Goods[UT]'
        },
        quantity: 12967,
        hpp: 300000,
        sale: 300000
    },
    {
        _id: { storageCode: 'UT-FNG', storageName: 'Finishing[UT]' },
        quantity: 228,
        hpp: 100000,
        sale: 100000
    }
];

let latestStock = [
    {
        _id:
        {
            storageCode: 'ST-BJB',
            storageName: 'Pusat - Finished Goods[UT]'
        },
        quantity: 13365,
        hpp: 300000,
        sale: 300000
    },
    {
        _id:
        {
            storageCode: 'UT-BJB',
            storageName: 'Pusat - Finished Goods[UT]'
        },
        quantity: 1355,
        hpp: 100000,
        sale: 100000
    },
    {
        _id: { storageCode: 'UT-FNG', storageName: 'Finishing[UT]' },
        quantity: 238,
        hpp: 100000,
        sale: 100000
    }
];

let stockPairs = [
    { _id: { storageCode: 'UT-FNG', itemCode: 'UT-FG1' } },
    { _id: { storageCode: 'ST-BJB', itemCode: 'UT-FG2' } },
    { _id: { storageCode: 'ST-BJB', itemCode: 'UT-AV1' } },
    { _id: { storageCode: 'ST-BJB', itemCode: 'UT-FG1' } },
    { _id: { storageCode: 'UT-FNG', itemCode: 'UT-AV1' } },
    { _id: { storageCode: 'UT-BJB', itemCode: 'UT-AV1' } },
    { _id: { storageCode: 'UT-BJB', itemCode: 'UT-FG2' } },
    { _id: { storageCode: 'ST-BJB', itemCode: 'UT-FG3' } }
];

let groupedStockPairs = [
    { storage: 'UT-FNG', items: ['UT-FG1', 'UT-AV1'] },
    { storage: 'ST-BJB', items: ['UT-FG2', 'UT-AV1', 'UT-FG1', 'UT-FG3'] },
    { storage: 'UT-BJB', items: ['UT-AV1', 'UT-FG2'] }
];

let beforeStock = [
    {
        _id: { storageCode: 'UT-FNG', storageName: 'Finishing[UT]' },
        quantity: 997,
        hpp: 0,
        sale: 0
    },
    {
        _id: { storageCode: 'UT-ACC', storageName: 'Accessories[UT]' },
        quantity: 20,
        hpp: 0,
        sale: 0
    }
];

let earliestLatestStock = [
    {
        code: 'ST-BJB',
        name: 'Pusat - Finished Goods[UT]',
        latestQuantity: 13365,
        latestHPP: 300000,
        latestSale: 300000,
        earliestQuantity: 12967,
        earliestHPP: 300000,
        earliestSale: 300000
    },
    {
        code: 'UT-BJB',
        name: 'Pusat - Finished Goods[UT]',
        latestQuantity: 1355,
        latestHPP: 100000,
        latestSale: 100000,
        earliestQuantity: 1315,
        earliestHPP: 100000,
        earliestSale: 100000
    },
    {
        code: 'UT-FNG',
        name: 'Finishing[UT]',
        latestQuantity: 238,
        latestHPP: 100000,
        latestSale: 100000,
        earliestQuantity: 228,
        earliestHPP: 100000,
        earliestSale: 100000
    }
];

let firstMonth = 5;
let lastMonth = 9;
let firstMonthOfYear = 0;
let lastMonthOfYear = 11;
let localeMonth = 8;
let localeYear = 2017;
let stockDate;

// Unit test
before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var MonthlyStockManager = require('../../../src/managers/inventory/monthly-stock-manager');
            manager = new MonthlyStockManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

it("#01. should success when get first inventory movement", function (done) {
    manager._getFirstInventoryMovement()
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#02. should success when get year and month list of inventory", function (done) {
    manager.getYearMonthList()
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#03. should success when get month's name", function (done) {
    let monthIndex = 3;
    try {
        let data = manager.__getMonthName(monthIndex);
        data.id.should.equal(monthIndex);
        data.should.be.Object();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#04. should success when get year and it's month list", function (done) {
    let firstYear = 2015, lastYear = 2017;
    try {
        let data = manager._getYearMonthsList(firstYear, lastYear, firstMonth, lastMonth);
        data.should.be.Array();
        data[data.length - 1].year.should.equal(firstYear);
        data[0].year.should.equal(lastYear);
        data[data.length - 1].months[0].id.should.equal(firstMonth);
        data[0].months[data[0].months.length - 1].id.should.equal(lastMonth);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#05. should success when push month based on year with current year === first year and current year === last year", function (done) {
    let currentYear = 2017, firstYear = 2017, lastYear = 2017;
    try {
        let data = manager.__pushMonthBasedOnYear(currentYear, firstYear, lastYear, firstMonth, lastMonth);
        data.should.be.Object();
        data.year.should.equal(currentYear);
        data.year.should.equal(firstYear);
        data.year.should.equal(lastYear);
        data.months[0].id.should.equal(firstMonth);
        data.months[data.months.length - 1].id.should.equal(lastMonth);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#06. should success when push month based on year with current year === first year and current year !== last year", function (done) {
    let currentYear = 2016, firstYear = 2016, lastYear = 2017;
    try {
        let data = manager.__pushMonthBasedOnYear(currentYear, firstYear, lastYear, firstMonth, lastMonth);
        data.should.be.Object();
        data.year.should.equal(currentYear);
        data.year.should.equal(firstYear);
        data.year.should.not.equal(lastYear);
        data.months[0].id.should.equal(firstMonth);
        data.months[data.months.length - 1].id.should.equal(lastMonthOfYear);
        data.months[data.months.length - 1].id.should.not.equal(lastMonth);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#07. should success when push month based on year with current year !== first year and current year === last year", function (done) {
    let currentYear = 2017, firstYear = 2016, lastYear = 2017;
    try {
        let data = manager.__pushMonthBasedOnYear(currentYear, firstYear, lastYear, firstMonth, lastMonth);
        data.should.be.Object();
        data.year.should.equal(currentYear);
        data.year.should.not.equal(firstYear);
        data.year.should.equal(lastYear);
        data.months[0].id.should.equal(firstMonthOfYear);
        data.months[0].id.should.not.equal(firstMonth);
        data.months[data.months.length - 1].id.should.equal(lastMonth);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#08. should success when push month based on year with current year !== first year and current year !== last year", function (done) {
    let currentYear = 2016, firstYear = 2015, lastYear = 2017;
    try {
        let data = manager.__pushMonthBasedOnYear(currentYear, firstYear, lastYear, firstMonth, lastMonth);
        data.should.be.Object();
        data.year.should.equal(currentYear);
        data.year.should.not.equal(firstYear);
        data.year.should.not.equal(lastYear);
        data.months[0].id.should.equal(firstMonthOfYear);
        data.months[0].id.should.not.equal(firstMonth);
        data.months[data.months.length - 1].id.should.equal(lastMonthOfYear);
        data.months[data.months.length - 1].id.should.not.equal(lastMonth);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#09. should success when get first locale date of the month", function (done) {
    try {
        let data = manager.__getLocaleDateOfMonth(localeYear, localeMonth, true);
        data.should.be.Object();
        data.date().should.equal(1);
        data.month().should.equal(localeMonth);
        data.year().should.equal(localeYear);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#10. should success when get last locale date of the month", function (done) {
    try {
        let data = manager.__getLocaleDateOfMonth(localeYear, localeMonth, false);
        data.should.be.Object();
        data.month().should.equal(localeMonth);
        data.year().should.equal(localeYear);
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#11. should success when get first and last locale date of the month", function (done) {
    try {
        stockDate = manager._setDateOfMonth(localeMonth, localeYear);
        stockDate.should.be.Object();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#12. should success when get status of all latest stock with movement particular month", function (done) {
    manager._getAllStockThisMonth(stockDate, -1, "$after")
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#13. should success when get status of all earliest stock with movement particular month", function (done) {
    manager._getAllStockThisMonth(stockDate, 1, "$before")
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#13. should success when get storage and item pairs of stock with movement this month", function (done) {
    manager._getStorageItemPairs(stockDate)
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#14. should success when group storage and item pairs of stock", function (done) {
    try {
        let data = manager._groupStorageItemPairs(stockPairs)
        data.should.be.Array();
        data.forEach(storage => {
            storage.items.forEach(item => {
                var found = stockPairs.find(stockPair => { return stockPair._id.storageCode === storage.storage && stockPair._id.itemCode === item });
                found._id.storageCode.should.equal(storage.storage);
                found._id.itemCode.should.equal(item);
            })
        })
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#15. should success when construct $or query based on grouped stock pairs", function (done) {
    try {
        let orQuery = manager.__constructOrQuery(groupedStockPairs);
        orQuery.should.be.Array();
        let ninStorage = [];
        for (let i = 0; i < orQuery.length - 1; i++) {
            let currentOrStorage = orQuery[i]["$and"][0]["storage.code"]["$eq"];
            let foundStorage = groupedStockPairs.find(gsp => { return gsp.storage === currentOrStorage })
            currentOrStorage.should.equal(foundStorage.storage);
            ninStorage.push(currentOrStorage);
            let currentOrItems = orQuery[i]["$and"][1]["item.code"]["$nin"];
            currentOrItems.forEach(currentOrItem => {
                let foundItem = foundStorage.items.find(item => { return item === currentOrItem })
                currentOrItem.should.equal(foundItem);
            })
        }
        let ninQuery = orQuery[orQuery.length - 1]["storage.code"]["$nin"];
        ninQuery.forEach(ninQ => {
            let foundNin = ninStorage.find(ninS => { return ninS === ninQ });
            ninQ.should.equal(foundNin);
        })
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#16. should success when get status of all latest stock without movement particular month", function (done) {
    manager._getAllStockBeforeThis(stockDate, groupedStockPairs)
        .then(data => {
            beforeStock = data;
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#17. should success when add earliest stock particular month and latest stock particular month altogether", function (done) {
    try {
        let data = manager.__embedEarliestWithLatest(earliestStock, latestStock);
        data.forEach(els => {
            let foundLatestStock = latestStock.find(ls => { return ls._id.storageCode === els.code })
            els.code.should.equal(foundLatestStock._id.storageCode)
            let foundEarliestStock = earliestStock.find(es => { return es._id.storageCode === els.code })
            els.code.should.equal(foundEarliestStock._id.storageCode)
        })
        data.should.be.Array();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#18. should success when add stock particular month and before altogether", function (done) {
    try {
        let data = manager.__embedBeforeWithThisMonth(earliestLatestStock, beforeStock);
        data.should.be.Array();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#19. should success when combine all stock (earliest particular month, latest particular month and before)", function (done) {
    try {
        let data = manager._embedStocks(earliestStock, latestStock, beforeStock);
        data.should.be.Array();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#20. should success when get overall stock particular month", function (done) {
    manager.getOverallStock(localeMonth, localeYear)
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#21. should success when get all items in particular month of inventory movement based on storage", function (done) {
    manager._getItemThisMonth(stockDate, 'UT-BJB')
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#22. should success when get array of item based on items", function (done) {
    try {
        let data = manager._getItems(itemThisMonth);
        data.should.be.Array();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#23. should success when get all items before particular month of inventory movement based on storage", function (done) {
    manager._getItemBeforeThis(stockDate, 'UT-BJB', items)
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#24. should success when add items particular month and before altogether", function (done) {
    try {
        let data = manager._embedItems(itemThisMonth, itemBefore);
        data.should.be.Array();
        done();
    }
    catch (e) {
        done(e);
    }
});

it("#25. should success when get all items on particular month based on storage", function (done) {
    manager.getStockInStorage('UT-BJB', localeMonth, localeYear)
        .then(data => {
            data.should.be.Array();
            done();
        })
        .catch(e => {
            done(e);
        });
});