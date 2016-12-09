

'use strict'

var express = require('express');
var ObjectId = require('mongodb').ObjectId;
var app = express();

var fs = require("fs");

var MongoClient = require('mongodb').MongoClient,
    test = require('assert');

// var fs = require("fs");

app.get('/', function (req, res) {

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'adminbateeq',
        password: 'Standar123.',
        server: 'efrata.database.windows.net',
        // port: 1433,
        database: 'efrata.pos',
        options: {
            encrypt: true
        }
    };

    // connect to your database

    MongoClient.connect('mongodb://moonlay:23b3c1e6011074b9d93b2604757c6b62@ds037395.mlab.com:37395/bateeq-dev', function (errM, db) {
        if (!errM) {
            sql.connect(config, function (err) {

                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();


                // var query = 'select * from (select ROW_NUMBER() OVER(ORDER BY branch, nomor) AS number,branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,sum(qty)as totalProduct, max(TOTAL) as subTotal,max(TOTAL) as grandTotal,\'0\' as discount,\'\' as reference,' +
                //     'max(voucher) as voucher, max(cash) as cash, max(debit) as debit,max(credit) as credit from penjualan group by branch,nomor,tanggal,shift,pos,kartu,no_krt,payment)a WHERE number BETWEEN 1271 and 5000';


                //bateeqParagon slo.02

                var query = "select * from (select ROW_NUMBER() OVER(ORDER BY branch, nomor) AS number,branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,sum(qty)as totalProduct, max(TOTAL) as subTotal,max(TOTAL) as grandTotal,0 as discount,'' as reference , max(voucher) as voucher, max(cash) as cash, max(debit) as debit,max(credit) as credit from penjualan group by branch,nomor,tanggal,shift,pos,kartu,no_krt,payment)a WHERE branch= 'SLO.02'";


                request.query(query, function (errBranch, Penjualan) {


                    var a = [];
                    for (var i = 0; i < Penjualan.length; i++) {

                        createSales(db, Penjualan[i]).then(sales => {
                            a = a + "" + sales;
                            console.log(sales);
                            fs.writeFile('C:\\Users\\aditya.henanda\\Desktop\\paragonSalesDocs.txt', a, function (err) {
                                if (err) return console.log(err);
                            });
                        }).catch(err => {
                            console.log(err);
                        });

                    }
                });
            });
        }
    });

    var createSales = function (db, penjualan) {

        return new Promise((resolve, reject) => {
            var salesDocs_id = new ObjectId();
            var salesDocs_stamp = new ObjectId();
            var promise1 = getStore(db, penjualan.branch);
            var promise2 = getItems(db, penjualan.branch, penjualan.nomor);
            var promise3 = getBanks(db, penjualan.kartu);

            var CardType = "";
            // CardType;

            if ((penjualan.no_krt[0] == 5) && ((penjualan.no_krt[1] == 1) || (penjualan.no_krt[1] == 2) || (penjualan.no_krt[1] == 3) || (penjualan.no_krt[1] == 4) || (penjualan.no_krt[1] == 5))) {

                CardType = "Mastercard";
            } else if ((penjualan.no_krt[0] == 2) && ((penjualan.no_krt[1] == 2) || (penjualan.no_krt[1] == 3) || (penjualan.no_krt[1] == 4) || (penjualan.no_krt[1] == 5) || (penjualan.no_krt[1] == 6) || (penjualan.no_krt[1] == 7))) {
                CardType = "Mastercard";

            } else if (penjualan.no_krt[0] == 4) {
                CardType = "Visa";

            } else {
                CardType = "";
            };

            var promise4 = getcards(db, CardType);


            var paymentType = "Cash";

            if ((penjualan.payment.trim() == "DEBIT CARD")||(penjualan.payment.trim() == "CREDIT CARD") ) {
                paymentType = "Card";
            }
            else if ((penjualan.payment.trim() == "PARTIAL DEBIT CARD")||(penjualan.payment.trim() == "PARTIAL CREDIT CARD")) {
                paymentType = "Partial";
            }else {
                paymentType = "Cash";
            };

            var cardTemp = "";

            if ((penjualan.payment.trim() == "DEBIT CARD" )||(penjualan.payment.trim() == "PARTIAL DEBIT CARD")) {
                cardTemp = "Debit";
            }else if ((penjualan.payment.trim() == "CREDIT CARD")||(penjualan.payment.trim() == "PARTIAL CREDIT CARD")) {
                cardTemp = "Credit";
            } else {
                cardTemp = "";
            };








            Promise.all([promise1, promise2, promise3, promise4]).then(result => {

                var test = {

                    "_id": salesDocs_id,
                    "_stamp": salesDocs_stamp,
                    "_type": "sales-doc",
                    "_version": "1.0.0",
                    "_active": true,
                    "_deleted": false,
                    "_createdBy": "router",
                    "_createdDate": new Date(),
                    "_createAgent": "manager",
                    "_updatedBy": "router",
                    "_updatedDate": new Date(),
                    "_updateAgent": "manager",
                    "code": penjualan.nomor,
                    // "date": s[i].tanggal,
                    "date": penjualan.tanggal,
                    "totalProduct": penjualan.totalProduct,
                    "subTotal": penjualan.subTotal,
                    "discount": penjualan.discount,
                    "grandTotal": penjualan.grandTotal,
                    "reference": penjualan.reference,
                    // "shift": s[i].shift,
                    "shift": penjualan.shift,
                    "pos": penjualan.pos,
                    "storeId": result[0]._id,
                    "store": result[0],
                    "items": result[1],

                    "salesDetails":
                    {
                        "_stamp": new ObjectId(),
                        "paymentType": paymentType, //object card berdasarkan penjualan.kartu
                        "voucherId": {},
                        "voucher": penjualan.voucher,
                        "bankId": (result[2]) ? result[2]._id : '', //query penjualan.kartu
                        "bank": (result[2]) ? result[2] : '',
                        "cardTypeId": (result[3]) ? result[3]._id : '',
                        "cardType": (result[3]) ? result[3] : '',
                        "bankCardId": "",
                        "bankCard": {},
                        "card": cardTemp,
                        "cardNumber": penjualan.no_krt,
                        "cardName": "",
                        "cashAmount": penjualan.cash,
                        "cardAmount": penjualan.debit + penjualan.credit,

                    },

                    "remark": "",
                    "isVoid": false,
                }
                // resolve(test);
                resolve(JSON.stringify(test));
            });
        });
    }


    var getStore = function (db, branch) {
        return new Promise((resolve, reject) => {
            var collection = db.collection('stores');
            collection.find({ "code": branch }).toArray(function (err, store) {
                if (err)
                    reject(err);
                else
                    resolve(store[0]);
            });

        });
    }

    var getcards = function (db, CardType) {
        return new Promise((resolve, reject) => {
            var collection = db.collection('card-types');
            collection.find({ "name": CardType }).toArray(function (err, card) {
                if (err)
                    reject(err);
                else
                    resolve(card[0]);
            });

        });
    }

    var getBanks = function (db, kartu) {
        return new Promise((resolve, reject) => {
            var collection = db.collection('banks');
            collection.find({ "code": "BA-" + kartu }).toArray(function (err, Banks) {
                if (err)
                    reject(err);
                else
                    resolve(Banks[0]);
            });

        });
    }


    var getItems = function (db, branch, nomor) {

        return new Promise((resolve, reject) => {
            var request = new sql.Request();
            // select barcode from penjualan where nomor='201505.00028' and branch='PBR.01'
            // var a='201505.00028';
            // var b='PBR.01';
            var queryfilter = 'select * from penjualan where nomor= \'' + nomor + '\' and branch= \'' + branch + '\'';
            // var queryfilter = 'select * from penjualan where nomor= \'' + a + '\' and branch= \'' + b + '\'';
            request.query(queryfilter, function (errBranch, queryfilter) {

                var barcodes = [];
                for (var i = 0; i < queryfilter.length; i++) {

                    barcodes.push(queryfilter[i].barcode);
                }


                getItemsMongo(db, barcodes).then(lstBarcode => {
                    resolve(lstBarcode);
                }).catch(error => {
                    reject(error);
                });
            });
        })
    };
    
    var createItem = function (db, queryfilter) {
        return new Promise((resolve, reject) => {


            var promise1 = getItemsMongo(db, queryfilter.barcode);
            Promise.all([promise1]).then(result => {
                var item = result[0];
                resolve(item);
            });

        });
    };

    var getItemsMongo = function (db, barcodes) {
        return new Promise((resolve, reject) => {
            var collection = db.collection('items');
            collection.find({ "code": { "$in": barcodes } }).toArray(function (err, items) {
                if (err)
                    reject(err);
                else
                    resolve(items);
            });

        });
    }

});


var server = app.listen(5000, function () {
    console.log('Server is running..');
});
