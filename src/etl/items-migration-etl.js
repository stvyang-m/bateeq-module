'use strict'
var DLModels = require('bateeq-models');
var map = DLModels.map;
var ObjectId = require('mongodb').ObjectId;
var sqlConnect = require('./sqlConnect');
var BaseManager = require('module-toolkit').BaseManager;
var MongoClient = require('mongodb').MongoClient,
    test = require('assert');

var ItemManager = require('../../src/managers/master/item-manager');


module.exports = class ItemDataEtl extends BaseManager {
    constructor(db, user) {
        super(db, user);

        this.ItemManager=new ItemManager(db,user);

        this.collection = this.ItemManager.collection;
        // this.adas=1;
    }

    getNewDataItem() {
        return new Promise(function (resolve, reject) {
            sqlConnect.getConnect()
                .then((connect) => {
                    var request = connect;
                    request.query("select Barcode,Nm_Product,Size,Harga,Harga1,ro from Produk", function (err, Produk) {
                        resolve(Produk);
                    });
                });
        });
    }


    getDataItem() {

        return new Promise((resolve, reject) => {

            this.collection.find({}).toArray(function (err, items) {

                resolve(items)

            });
        });
    }

    migrateDataItems() {
        return new Promise((resolve, reject) => {

            var newItem = this.getNewDataItem();
            var dataItem = this.getDataItem();

            Promise.all([newItem, dataItem]).then(result => {

                var tasks = [];
                for (var item of result[0]) {
                    var _idItems = new ObjectId();

                    var _stampItems = new ObjectId();

                    var ro = "";
                    if ((item.ro == null) || (item.ro == "-")) {
                        ro = "";
                    } else {
                        ro = item.ro;
                    };

                    var isfound = false;
                    for (var item2 of result[1]) {

                        if (item.Barcode == item2.code) {
                            //update;
                            isfound = true;

                            var update =
                                {

                                    "_id": item2._id,
                                    "_stamp": item2._stamp,
                                    "_type": "finished-goods",
                                    "_version": "1.0.0",
                                    "_active": true,
                                    "_deleted": false,
                                    "_createdBy": "router",
                                    "_createdDate": item2._createdDate,
                                    "_createAgent": "manager",
                                    "_updatedBy": "router",
                                    "_updatedDate": new Date(),
                                    "_updateAgent": "manager",
                                    "code": item.Barcode,
                                    "name": item.Nm_Product,
                                    "description": "",
                                    "uom": "PCS",
                                    "components": [],
                                    "tags": "",
                                    "articleId": {},
                                    "article": {
                                        "realizationOrder": ro,

                                    },
                                    "size": item.Size,
                                    "domesticCOGS": item.Harga,
                                    "domesticWholesale": 0,
                                    "domesticRetail": 0,
                                    "domesticSale": item.Harga1,
                                    "internationalCOGS": 0,
                                    "internationalWholesale": 0,
                                    "internationalRetail": 0,
                                    "internationalSale": 0

                                }

                            tasks.push(this.collection.update({ _id: item2._id }, update, { ordered: false }));

                            break;
                        }

                    }

                    if (!isfound) {

                        var insert =

                                {
                                    "_id": _idItems,
                                    "_stamp": _stampItems,
                                    "_type": "finished-goods",
                                    "_version": "1.0.0",
                                    "_active": true,
                                    "_deleted": false,
                                    "_createdBy": "router",
                                    "_createdDate": new Date(),
                                    "_createAgent": "manager",
                                    "_updatedBy": "router",
                                    "_updatedDate": new Date(),
                                    "_updateAgent": "manager",
                                    "code": item.Barcode,
                                    "name": item.Nm_Product,
                                    "description": "",
                                    "uom": "PCS",
                                    "components": [],
                                    "tags": "",
                                    "articleId": {},
                                    "article": {
                                        "realizationOrder": ro,

                                    },
                                    "size": item.Size,
                                    "domesticCOGS": item.Harga,
                                    "domesticWholesale": 0,
                                    "domesticRetail": 0,
                                    "domesticSale": item.Harga1,
                                    "internationalCOGS": 0,
                                    "internationalWholesale": 0,
                                    "internationalRetail": 0,
                                    "internationalSale": 0

                                }
                        // insertArr.push(insert)

                        tasks.push(this.collection.insert(insert, { ordered: false }));
                    }

                }

                // return (tasks);
                Promise.all(tasks)
                    .then((result) => {
                        resolve(tasks);

                    })

                    .catch((e) => {
                        done();
                    })

            });
        });
    }





}