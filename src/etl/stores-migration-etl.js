'use strict'
var DLModels = require('bateeq-models');
var map = DLModels.map;
var ObjectId = require('mongodb').ObjectId;
var sqlConnect = require('./sqlConnect');
var BaseManager = require('module-toolkit').BaseManager;
var MongoClient = require('mongodb').MongoClient,
    test = require('assert');



module.exports = class StoreDataEtl extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.Store);
        // this.adas=1;
    }

    getDataStores() {
        return new Promise(function (resolve, reject) {
            sqlConnect.getConnect()
                .then((connect) => {
                    var request = connect;
                    request.query("select * from Branch", function (err, stores) {
                        resolve(stores);
                    });
                });
        });
    }


    getStoreMongo(stores) {

        return new Promise((resolve, reject) => {

            this.collection.find({}).toArray(function (err, storeMongo) {

                resolve(storeMongo)

            });
        });
    }

    migrateDataStores() {
        return new Promise((resolve, reject) => {

            var storesSQL = this.getDataStores();
            var storesMongo = this.getStoreMongo();

            Promise.all([storesSQL, storesMongo]).then(result => {
                var shift = [];

                shift = [
                    {
                        "shift": 1.0,
                        "dateFrom": "2000-01-01T00:00:00.000Z",
                        "dateTo": "2000-01-01T11:59:59.000Z",
                    },
                    {
                        "shift": 2.0,
                        "dateFrom": "2000-01-01T12:00:00.000Z",
                        "dateTo": "2000-01-01T23:59:59.000Z",
                    }
                ];


                var tasks = [];
                for (var item of result[0]) {
                    var _id = new ObjectId();
                    var _idStorage = new ObjectId();
                    var _stamp = new ObjectId();
                    var _stampStorage = new ObjectId();

                    var openedDate = "";
                    if (item.tanggal_buka == null) {
                        openedDate = "";
                    } else {
                        openedDate = item.tanggal_buka;
                    };

                    var closedDate = "";
                    if (item.tanggal_tutup == null) {
                        closedDate = "";

                    } else {
                        closedDate = item.tanggal_tutup;
                    };

                    var status = "";
                    if (item.status == null) {
                        status = "";
                    } else {
                        status = item.status;
                    };

                    var isfound = false;
                    for (var item2 of result[1]) {

                        if (item.Kd_Cbg == item2.code) {
                            //update;
                            isfound = true;

                            var update =
                                {
                                    "_id": item2._id,
                                    "_stamp": item2._stamp,
                                    "_type": "store",
                                    "_version": "1.0.0",
                                    "_active": true,
                                    "_deleted": false,
                                    "_createdBy": "router",
                                    "_createdDate": new Date(),
                                    "_createAgent": "manager",
                                    "_updatedBy": "router",
                                    "_updatedDate": new Date(),
                                    "_updateAgent": "manager",
                                    "code": item.Kd_Cbg,
                                    "name": item.Nm_Cbg,
                                    "description": "",
                                    "salesTarget": item.target_omset_bulan,
                                    "storageId": item2._idStorage,
                                    "storage": {
                                        "_id": item2.storage._id,
                                        "_stamp": item2.storage._stamp,
                                        "_type": "storage",
                                        "_version": "1.0.0",
                                        "_active": true,
                                        "_deleted": false,
                                        "_createdBy": "router",
                                        "_createdDate": new Date(),
                                        "_createAgent": "manager",
                                        "_updatedBy": "router",
                                        "_updatedDate": new Date(),
                                        "_updateAgent": "manager",
                                        "code": item.Kd_Cbg,
                                        "name": item.Nm_Cbg,
                                        "description": "",
                                        "address": [(item.Alm_Cbg || '').trim().toString(), (item.Kota_Cbg || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                        "phone": [(item.Kontak || '').trim().toString(), (item.Telp || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                    },

                                    "salesCategoryId": {},
                                    "salesCategory": item.jenis_penjualan,
                                    "shift": item2.shift,
                                    "city": item.Kota_Cbg,
                                    "pic": item.Kontak,
                                    "fax": item.FAX,
                                    "openedDate": openedDate,
                                    "closedDate": closedDate,
                                    "storeArea": item.keterangan,
                                    "storeWIde": item.luas_toko,
                                    "online-offline": item.online_offline,
                                    "storeCategory": item.jenis_toko,
                                    "monthlyTotalCost": item.total_cost_bulanan,
                                    "monthlyOmsetTarget": item.target_omset_bulan,
                                    "status": status,
                                    "address": [(item.Alm_Cbg || '').trim().toString(), (item.Kota_Cbg || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                    "phone": [(item.Kontak || '').trim().toString(), (item.Telp || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                    "salesCapital": 0
                                }

                            tasks.push(this.collection.update({ _id: item2._id }, update, { ordered: false }));

                            break;
                        }

                    }

                    if (!isfound) {

                        var insert =
                            {
                                "_id": _id,
                                "_stamp": _stamp,
                                "_type": "store",
                                "_version": "1.0.0",
                                "_active": true,
                                "_deleted": false,
                                "_createdBy": "router",
                                "_createdDate": new Date(),
                                "_createAgent": "manager",
                                "_updatedBy": "router",
                                "_updatedDate": new Date(),
                                "_updateAgent": "manager",
                                "code": item.Kd_Cbg,
                                "name": item.Nm_Cbg,
                                "description": "",
                                "salesTarget": item.target_omset_bulan,
                                "storageId": _idStorage,

                                "storage": {
                                    "_id": _idStorage,
                                    "_stamp": _stampStorage,
                                    "_type": "storage",
                                    "_version": "1.0.0",
                                    "_active": true,
                                    "_deleted": false,
                                    "_createdBy": "router",
                                    "_createdDate": new Date(),
                                    "_createAgent": "manager",
                                    "_updatedBy": "router",
                                    "_updatedDate": new Date(),
                                    "_updateAgent": "manager",
                                    "code": item.Kd_Cbg,
                                    "name": item.Nm_Cbg,
                                    "description": "",
                                    "address": [(item.Alm_Cbg || '').trim().toString(), (item.Kota_Cbg || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                    "phone": [(item.Kontak || '').trim().toString(), (item.Telp || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                },

                                "salesCategoryId": {},
                                "salesCategory": item.jenis_penjualan,
                                "shift": shift,
                                "city": item.Kota_Cbg,
                                "pic": item.Kontak,
                                "fax": item.FAX,
                                "openedDate": openedDate,
                                "closedDate": closedDate,
                                "storeArea": item.keterangan,
                                "storeWIde": item.luas_toko,
                                "online-offline": item.online_offline,
                                "storeCategory": item.jenis_toko,
                                "monthlyTotalCost": item.total_cost_bulanan,
                                "monthlyOmsetTarget": item.target_omset_bulan,
                                "status": status,
                                "address": [(item.Alm_Cbg || '').trim().toString(), (item.Kota_Cbg || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                "phone": [(item.Kontak || '').trim().toString(), (item.Telp || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
                                "salesCapital": 0
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