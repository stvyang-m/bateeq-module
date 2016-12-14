'use strict'
var DLModels = require('bateeq-models');
var map = DLModels.map;
var ObjectId = require('mongodb').ObjectId;
var sqlConnect = require('./sqlConnect');
var BaseManager = require('module-toolkit').BaseManager;
var MongoClient = require('mongodb').MongoClient,
    test = require('assert');
var ItemManager = require('../../src/managers/master/item-manager');
var BankManager = require('../../src/managers/master/bank-manager');
var CardTypeManager = require('../../src/managers/master/card-type-manager');
var StoreManager = require('../../src/managers/master/store-manager');
var SalesManager = require('../../src/managers/sales/sales-manager');

// var request=sqlConnect.getConnect();

module.exports = class SalesDataEtl extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.ItemManager = new ItemManager(db, user);
        this.BankManager = new BankManager(db, user);
        this.CardTypeManager = new CardTypeManager(db, user);
        this.StoreManager = new StoreManager(db, user);
        this.SalesManager = new SalesManager(db, user);

        this.collectionItem = this.ItemManager.collection;
        this.collectionBank = this.BankManager.collection;
        this.collectionStore = this.StoreManager.collection;
        this.collectionCardType = this.CardTypeManager.collection;
        this.collectionSalesManager = this.SalesManager.collection;

    }

    migrate() {
        return new Promise((resolve, reject) => {
            sqlConnect.getConnect()
                .then((request) => {
                    var self = this;
                    // var query= "select * from (select ROW_NUMBER() OVER(ORDER BY branch, nomor) AS number,branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,userin,sum(qty)as totalProduct, max(TOTAL) as subTotal,max(TOTAL) as grandTotal,0 as discount,'' as reference , max(voucher) as voucher, max(cash) as cash, max(debit) as debit,max(credit) as credit from penjualan group by branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,userin)a where nomor ='201501.00083' and branch ='SLO.02' and shift ='2' and tanggal ='2015-01-30 00:00:00.000' and POS ='POS01'";
                   

                    var query = "select * from (select ROW_NUMBER() OVER(ORDER BY branch, nomor) AS number,branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,userin,sum(qty)as totalProduct, max(TOTAL) as subTotal,max(TOTAL) as grandTotal,0 as discount,'' as reference , max(voucher) as voucher, max(cash) as cash, max(debit) as debit,max(credit) as credit from penjualan group by branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,userin)a WHERE branch= 'SLO.02'";
                    request.query(query, function (err, salesResult) {
                        // var a = [];

                        self.migrateDataStores(request, salesResult)
                            .then(sales => {
                                resolve(sales);
                                // a.push(sales);
                                // a.push(sales)
                                // a = a + "" + sales;
                                //   resolve(self.collectionSalesManager.insert(sales, { ordered: false }))
                                // resolve(sales);
                                // a.push(sales);
                                // console.log(sales);

                            }).catch(err => {
                                console.log(err);
                            });
                        //    
                        // resolve(self.collectionSalesManager.insertMany(a, { ordered: false }))
                        //  resolve(a);

                    })
                });

        });
    }

    // getNewDataSales(request) {
    //     return new Promise(function (resolve, reject) {
    //         var query = "select top 5 * from (select ROW_NUMBER() OVER(ORDER BY branch, nomor) AS number,branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,sum(qty)as totalProduct, max(TOTAL) as subTotal,max(TOTAL) as grandTotal,0 as discount,'' as reference , max(voucher) as voucher, max(cash) as cash, max(debit) as debit,max(credit) as credit from penjualan group by branch,nomor,tanggal,shift,pos,kartu,no_krt,payment)a WHERE branch= 'SLO.02'";
    //         request.query(query, function (err, sales) {
    //             if (err)
    //                 reject(err);
    //             else
    //                 resolve(sales);
    //         });
    //     });
    // }

    // getDataSales() {

    //     return new Promise((resolve, reject) => {

    //         this.collectionSalesManager.find({}).toArray(function (err, sales) {

    //             resolve(sales)
    //         });
    //     });
    // }

    getStore(branch) {
        return new Promise((resolve, reject) => {

            this.collectionStore.find({ "code": branch }).toArray(function (err, store) {
                resolve(store[0]);
            });

        });
    }

    getBanks(kartu) {
        return new Promise((resolve, reject) => {
            this.collectionBank.find({ "code": "BA-" + kartu }).toArray(function (err, Banks) {
                resolve(Banks[0]);
            });

        });
    }

    getCards(CardType) {
        return new Promise((resolve, reject) => {

            this.collectionCardType.find({ "name": CardType }).toArray(function (err, card) {

                resolve(card[0]);
            });

        });
    }

    migrateDataStores(request, salesData) {
        return new Promise((resolve, reject) => {
            var getStores = [];
            var getBanks = [];
            var getItems = [];
            var getCards = [];

            for (var i = 0; i < salesData.length; i++) {
                var sales = salesData[i];

                var CardType = "";
                if ((sales.no_krt[0] == 5) && ((sales.no_krt[1] == 1) || (sales.no_krt[1] == 2) || (sales.no_krt[1] == 3) || (sales.no_krt[1] == 4) || (sales.no_krt[1] == 5))) {

                    CardType = "Mastercard";
                } else if ((sales.no_krt[0] == 2) && ((sales.no_krt[1] == 2) || (sales.no_krt[1] == 3) || (sales.no_krt[1] == 4) || (sales.no_krt[1] == 5) || (sales.no_krt[1] == 6) || (sales.no_krt[1] == 7))) {
                    CardType = "Mastercard";

                } else if (sales.no_krt[0] == 4) {
                    CardType = "Visa";

                } else {
                    CardType = "";
                };
                getStores.push(this.getStore(sales.branch));
                getBanks.push(this.getBanks(sales.kartu));
                getItems.push(this.getItems(request, sales.branch, sales.nomor));
                getCards.push(this.getCards(CardType));
            }
            // var getNewDataSales = this.getNewDataSales(request);
            // var getDataSales = this.getDataSales();


            // Promise.all([getNewDataSales, getDataSales, getStore, getItems, getBanks, getCards]).then(result => {
            var countStore = getStores.length;
            var countBank = getBanks.length;
            var countItem = getItems.length;
            var countCard = getCards.length;

            Promise.all(getStores.concat(getBanks).concat(getItems).concat(getCards))
                .then(results => {
                    var _stores = results.splice(0, countStore);
                    var _banks = results.splice(0, countBank);
                    var _items = results.splice(0, countItem);
                    var _cards = results.splice(0, countCard);

                    var tasks = [];
                    for (var i = 0; i < salesData.length; i++) {
                        var sales = salesData[i];
                        var _store = _stores[i];
                        var _bank = _banks[i];
                        var _item = _items[i];
                        var _card = _cards[i];

                        // var promise4 = getcards(db, CardType);

                        var paymentType = "Cash";

                        if ((sales.payment.trim() == "DEBIT CARD") || (sales.payment.trim() == "CREDIT CARD")) {
                            paymentType = "Card";
                        }
                        else if ((sales.payment.trim() == "PARTIAL DEBIT CARD") || (sales.payment.trim() == "PARTIAL CREDIT CARD")) {
                            paymentType = "Partial";
                        } else {
                            paymentType = "Cash";
                        };

                        var cardTemp = "";

                        if ((sales.payment.trim() == "DEBIT CARD") || (sales.payment.trim() == "PARTIAL DEBIT CARD")) {
                            cardTemp = "Debit";
                        } else if ((sales.payment.trim() == "CREDIT CARD") || (sales.payment.trim() == "PARTIAL CREDIT CARD")) {
                            cardTemp = "Credit";
                        } else {
                            cardTemp = "";
                        };


                        // for (var item of result[0]) {
                        var _id = new ObjectId();
                        var _idStorage = new ObjectId();
                        var _stamp = new ObjectId();
                        var _stampStorage = new ObjectId();

                        // var isfound = false;
                        // for (var item2 of result[1]) {

                        // if (item.Kd_Cbg == item2.code) {
                        //update;
                        // isfound = true;

                        // var update =
                        //     {
                        //         "_id": item2._id,
                        //         "_stamp": item2._stamp,
                        //         "_type": "sales-doc",
                        //         "_version": "1.0.0",
                        //         "_active": true,
                        //         "_deleted": false,
                        //         "_createdBy": "router",
                        //         "_createdDate": item2._createdDate,
                        //         "_createAgent": "manager",
                        //         "_updatedBy": "router",
                        //         "_updatedDate": new Date(),
                        //         "_updateAgent": "manager",
                        //         "code": item.nomor,
                        //         // "date": s[i].tanggal,
                        //         "date": item.tanggal,
                        //         "totalProduct": item.totalProduct,
                        //         "subTotal": item.subTotal,
                        //         "discount": item.discount,
                        //         "grandTotal": item.grandTotal,
                        //         "reference": item.reference,
                        //         // "shift": s[i].shift,
                        //         "shift": item.shift,
                        //         "pos": item.pos,
                        //         "storeId": result[2]._id,
                        //         "store": result[2],
                        //         "items": result[3],

                        //         "salesDetails":
                        //         {
                        //             "_stamp": new ObjectId(),
                        //             "paymentType": paymentType, //object card berdasarkan penjualan.kartu
                        //             "voucherId": {},
                        //             "voucher": item.voucher,
                        //             "bankId": (result[5]) ? result[5]._id : '', //query penjualan.kartu
                        //             "bank": (result[5]) ? result[5] : '',
                        //             "cardTypeId": (result[4]) ? result[4]._id : '',
                        //             "cardType": (result[4]) ? result[4] : '',
                        //             "bankCardId": "",
                        //             "bankCard": {},
                        //             "card": cardTemp,
                        //             "cardNumber": item.no_krt,
                        //             "cardName": "",
                        //             "cashAmount": item.cash,
                        //             "cardAmount": item.debit + item.credit,

                        //         },

                        //         "remark": "",
                        //         "isVoid": false,
                        //     }

                        // tasks.push(this.collection.update({ _id: item2._id }, update, { ordered: false }));

                        // break;
                        // }

                        // }

                        // if (!isfound) {

                        var insert =
                            {
                                "_id": _id,
                                "_stamp": _stamp,
                                "_type": "sales-doc",
                                "_version": "1.0.0",
                                "_active": true,
                                "_deleted": false,
                                "_createdBy": sales.userin,
                                "_createdDate": new Date(),
                                "_createAgent": "manager",
                                "_updatedBy": "router",
                                "_updatedDate": new Date(),
                                "_updateAgent": "manager",
                                "code": sales.nomor,
                                // "date": s[i].tanggal,
                                "date": sales.tanggal,
                                "totalProduct": sales.totalProduct,
                                "subTotal": sales.subTotal,
                                "discount": sales.discount,
                                "grandTotal": sales.grandTotal,
                                "reference": sales.reference,
                                // "shift": s[i].shift,
                                "shift": parseInt(sales.shift),
                                "pos": sales.pos,
                                "storeId": _store._id,
                                "store": _store,
                                "items": _item,

                                "salesDetail":
                                {
                                    "_stamp": new ObjectId(),
                                    "_type": "sales-type",
                                    "_version": "1.0.0",
                                    "_active": true,
                                    "deleted": false,
                                    "_createdBy": "router",
                                    "_createdDate": new Date(),
                                    "_createAgent": "manager",
                                    "_updatedBy": "router",
                                    "_updatedDate": new Date(),
                                    "_updateAgent": "manager",
                                    "paymentType": paymentType, //object card berdasarkan penjualan.kartu
                                    "voucherId": {},
                                    "voucher": {
                                        "value": sales.voucher,
                                    },
                                    "bankId": (_bank) ? _bank._id : '', //query penjualan.kartu
                                    "bank": (_bank) ? _bank : '',
                                    "cardTypeId": (_card) ? _card._id : '',
                                    "cardType": (_card) ? _card : '',
                                    "bankCardId": "",
                                    "bankCard": {},
                                    "card": cardTemp,
                                    "cardNumber": sales.no_krt,
                                    "cardName": "",
                                    "cashAmount": sales.cash,
                                    "cardAmount": sales.debit + sales.credit,

                                },

                                "remark": "",
                                "isReturn": false,
                                "isVoid": false,
                            }
                        tasks.push(this.collectionSalesManager.insert(insert, { ordered: false }))
                    }

                    Promise.all(tasks)
                        .then((task) => {
                            resolve(tasks);
                        });

                    // await
                    // insertArr.push(insert)
                    // resolve(insert);

                    // resolve(insert);
                    // }

                    // }

                    // return (tasks);
                    // Promise.all(tasks)
                    //     .then((result) => {
                    //         resolve(tasks);

                    //     })

                    //     .catch((e) => {
                    //         done();
                    //     })

                });

        });
    }

    getItems(request, branch, nomor) {
        var self = this;
        return new Promise((resolve, reject) => {
            // var request = connect;

            var queryfilter = 'select * from penjualan where nomor= \'' + nomor + '\' and branch= \'' + branch + '\'';
            request.query(queryfilter, function (err, sales) {
                if (err)
                    reject(err);
                else {
                    var barcodes = [];
                    for (var i = 0; i < sales.length; i++) {
                        barcodes.push(sales[i].barcode);
                    }

                    self.getItemsMongo(barcodes)
                        .then(listItem => {
                            var itemDetails = [];
                            for (var i = 0; i < sales.length; i++) {
                                for (var j = 0; j < listItem.length; j++) {
                                    if (sales[i].barcode == listItem[j].code) {
                                        var itemDetail = {
                                            "_stamp": listItem[j]._stamp,
                                            "_type": "sales-item",
                                            "_version": "1.0.0",
                                            "_active": true,
                                            "_deleted": false,
                                            "_createdBy": "router",
                                            "_createdDate": new Date(),
                                            "_createAgent": "manager",
                                            "_updatedBy": "router",
                                            "_updateAgent": "manager",
                                            "itemId": listItem[j]._id,
                                            "item": listItem[j],
                                            "promoId": "",
                                            "promo": {},
                                            "size": "",
                                            "quantity": sales[i].qty,
                                            "price": sales[i].harga,
                                            "discount1": sales[i].disc,
                                            "discount2": sales[i].disc1,
                                            "discountNominal": 0,
                                            "margin": 0,
                                            "specialDiscount": 0,
                                            "total": sales[i].subtotal,
                                            "isReturn": false,
                                            "returnItems": [],
                                        };
                                        // itemDetail.item = listItem[j];
                                        // itemDetail.quantity = queryfilter[i].qty;
                                        itemDetails.push(itemDetail);
                                        break;
                                    }
                                }
                            }

                            resolve(itemDetails);


                        }).catch(error => {
                            reject(error);
                        });

                    // self.getItemsMongo(barcodes).then(lstBarcode => {
                    //     resolve(lstBarcode);
                    // }).catch(error => {
                    //     reject(error);
                    // });

                    // resolve(sales);
                }
            });
        })
    };

    // createItem(queryfilter) {
    //     var self = this;
    //     return new Promise((resolve, reject) => {
    //         var promise1 = self.getItemsMongo(queryfilter.barcode);
    //         Promise.all([promise1]).then(result => {
    //             var item = result[0];
    //             resolve(item);
    //         });

    //     });
    // };



    getItemsMongo(barcodes) {
        return new Promise((resolve, reject) => {
            // var collection = db.collection('items');
            this.collectionItem.find({ "code": { "$in": barcodes } }).toArray(function (err, items) {
                if (err)
                    reject(err);
                else
                    resolve(items);
            });

        });
    }

}