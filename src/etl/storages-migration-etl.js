'use strict'
var DLModels = require('bateeq-models');
var map = DLModels.map;
var fs = require("fs");
var BaseManager = require('module-toolkit').BaseManager;
var MongoClient = require('mongodb').MongoClient,
    test = require('assert');
var StoreManager= require('../../src/managers/master/store-manager');
var StoragesManager= require('../../src/managers/master/storage-manager');

module.exports = class StorageDataEtl extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.storeManager = new StoreManager(db, user);
        this.storageManager = new StoragesManager(db, user);

        this.collection = this.storeManager.collection;
        this.collectionStorages = this.storageManager.collection;
    }

    // getDataStorages() {
    //     return new Promise((resolve, reject) => {

    //         this.collection.find({}).toArray(function (err, stores) {
    //             var dataStorages = [];
    //             for (var i = 0; i < stores.length; i++) {
    //                 var Storage = {
    //                     "_id": stores[i].storage._id,
    //                     "_stamp": stores[i].storage._stamp,
    //                     "_type": "storage",
    //                     "_version": "1.0.0",
    //                     "_active": true,
    //                     "_deleted": false,
    //                     "_createdBy": "router",
    //                     "_createdDate": stores[i].storage._createdDate,
    //                     "_createAgent": "manager",
    //                     "_updatedBy": "router",
    //                     "_updatedDate": stores[i].storage._updatedDate,
    //                     "_updateAgent": "manager",
    //                     "code": stores[i].storage.code,
    //                     "name": stores[i].storage.name,
    //                     "description": stores[i].storage.description,
    //                     "address": stores[i].storage.address,
    //                     "phone": stores[i].storage.phone,
    //                 }
    //                 dataStorages.push(Storage);
    //                 resolve(dataStorages);

    //             }
    //         })

    //     });
    // }

    // getDataStoragesMongo() {
    //     return new Promise((resolve, reject) => {

    //         this.collectionStorages.find({}).toArray(function (err, Storages) {
    //             var dataStoragesMongo = [];
    //             for (var i = 0; i < Storages.length; i++) {
    //                 var Storage = {
    //                     "_id": Storages[i].storage._id,
    //                     "_stamp": Storages[i].storage._stamp,
    //                     "_type": "storage",
    //                     "_version": "1.0.0",
    //                     "_active": true,
    //                     "_deleted": false,
    //                     "_createdBy": "router",
    //                     "_createdDate": Storages[i].storage._createdDate,
    //                     "_createAgent": "manager",
    //                     "_updatedBy": "router",
    //                     "_updatedDate": Storages[i].storage._updatedDate,
    //                     "_updateAgent": "manager",
    //                     "code": Storages[i].storage.code,
    //                     "name": Storages[i].storage.name,
    //                     "description": Storages[i].storage.description,
    //                     "address": Storages[i].storage.address,
    //                     "phone": Storages[i].storage.phone,
    //                 }
    //                 dataStoragesMongo.push(Storage);
    //                 resolve(dataStoragesMongo);

    //             }
    //         })

    //     });
    // }




    getDataStorages() {

        return new Promise((resolve, reject) => {

            this.collection.find({}).toArray(function (err, storagesMongo) {

                resolve(storagesMongo)

            });
        });
    }


    getStoreMongo(stores) {

        return new Promise((resolve, reject) => {

            this.collectionStorages.find({}).toArray(function (err, storagesMongo) {

                resolve(storagesMongo)

            });
        });
    }

    migrateDataStorages() {
        return new Promise((resolve, reject) => {

            var storagesNew = this.getDataStorages();
            var storagesMongo = this.getStoreMongo();

            Promise.all([storagesNew, storagesMongo]).then(result => {

                var tasks = [];
                for (var item of result[0]) {

                    var isfound = false;
                    for (var item2 of result[1]) {

                        if (item.code == item2.code) {
                            //update;
                            isfound = true;

                            var update =
                                {
                                    "_id": item.storage._id,
                                    "_stamp": item.storage._stamp,
                                    "_type": "storage",
                                    "_version": "1.0.0",
                                    "_active": item._active,
                                    "_deleted": false,
                                    "_createdBy": "router",
                                    "_createdDate": item2._createdDate,
                                    "_createAgent": "manager",
                                    "_updatedBy": "router",
                                    "_updatedDate": item.storage._createdDate,
                                    "_updateAgent": "manager",
                                    "code": item.storage.code,
                                    "name": item.storage.name,
                                    "description": "",
                                    "address": item.address,
                                    "phone": item.phone,
                                }

                            tasks.push(this.collectionStorages.update(update, { ordered: false }));

                            break;
                        }

                    }

                    if (!isfound) {

                        var insert =
                            {
                                "_id": item.storage._id,
                                "_stamp": item.storage._stamp,
                                "_type": "storage",
                                "_version": "1.0.0",
                                "_active": item._active,
                                "_deleted": false,
                                "_createdBy": "router",
                                "_createdDate": item.storage._createdDate,
                                "_createAgent": "manager",
                                "_updatedBy": "router",
                                "_updatedDate": item.storage._updatedDate,
                                "_updateAgent": "manager",
                                "code": item.storage.code,
                                "name": item.storage.name,
                                "description": "",
                                "address": item.address,
                                "phone": item.phone,
                            }

                        tasks.push(this.collectionStorages.insert(insert, { ordered: false }));
                    }

                }

                // return (tasks);
                Promise.all(tasks)
                    .then((result) => {
                        resolve(tasks);

                    })

                    .catch((e) => {
                        reject(e);
                    })

            });
        });
    }



}