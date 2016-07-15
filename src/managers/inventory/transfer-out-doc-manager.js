'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var TransferOutItem = BateeqModels.inventory.TransferOutItem;


module.exports = class TransferOutDocManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.transferOutDocCollection = this.db.use(map.inventory.TransferOutDoc);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCode = {
                    'code': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterCode]
                };

                query['$and'].push($or);
            }


            this.transferOutDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(transferOutDocs => {
                    resolve(transferOutDocs);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(transferOutDoc => {
                    resolve(transferOutDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.transferOutDocCollection
                .single(query)
                .then(transferOutDoc => {
                    resolve(transferOutDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {

                    this.transferOutDocCollection.insert(validTransferOutDoc)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {
                    this.transferOutDocCollection.update(validTransferOutDoc)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    delete(transferOutDoc) {
        return new Promise((resolve, reject) => {
            this._validate(transferOutDoc)
                .then(validTransferOutDoc => {
                    validTransferOutDoc._deleted = true;
                    this.transferOutDocCollection.update(validTransferOutDoc)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }


    _validate(transferOutDoc) {
        return new Promise((resolve, reject) => {
            var valid = new TransferOutDoc(transferOutDoc);
            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }
};