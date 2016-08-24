'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
 
var FinishedGoods = BateeqModels.master.FinishedGoods; 

module.exports = class FinishedGoodsManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.itemCollection = this.db.use(map.master.FinishedGoods);
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
                var filterName = {
                    'name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterCode, filterName]
                };

                query['$and'].push($or);
            }


            this.itemCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(items => {
                    resolve(items);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(finishedGoods => {
                    resolve(finishedGoods);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
                .then(finishedGoods => {
                    resolve(finishedGoods);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.itemCollection
                .single(query)
                .then(finishedGoods => {
                    resolve(finishedGoods);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.itemCollection
                .singleOrDefault(query)
                .then(finishedGoods => {
                    resolve(finishedGoods);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(finishedGoods) {
        return new Promise((resolve, reject) => {
            this._validate(finishedGoods)
                .then(validFinishedGoods => {

                    this.itemCollection.insert(validFinishedGoods)
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

    update(finishedGoods) {
        return new Promise((resolve, reject) => {
            this._validate(finishedGoods)
                .then(validFinishedGoods => {
                    this.itemCollection.update(validFinishedGoods)
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

    delete(finishedGoods) {
        return new Promise((resolve, reject) => {
            this._validate(finishedGoods)
                .then(validFinishedGoods => {
                    validFinishedGoods._deleted = true;
                    this.itemCollection.update(validFinishedGoods)
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
 
    _validate(finishedGoods) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new FinishedGoods(finishedGoods);
            // 1. begin: Declare promises.
            var getFinishedGoods = this.itemCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getFinishedGoods])
                .then(results => {
                    var _item = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_item)
                        errors["code"] = "code already exists"; 
                        
                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required";  
                        
                    // if (!valid.size || valid.size == '')
                    //     errors["size"] = "size is required";  
                        
                    if (valid.domesticCOGS == undefined || (valid.domesticCOGS && valid.domesticCOGS == '')) {
                        errors["domesticCOGS"] = "domesticCOGS is required";
                    }
                    else if (parseInt(valid.domesticCOGS) < 0) {
                        errors["domesticCOGS"] = "domesticCOGS must be greater with 0";
                    }
                    if (valid.domesticWholesale == undefined || (valid.domesticWholesale && valid.domesticWholesale == '')) {
                        errors["domesticWholesale"] = "domesticWholesale is required";
                    }
                    else if (parseInt(valid.domesticWholesale) < 0) {
                        errors["domesticWholesale"] = "domesticWholesale must be greater with 0";
                    }
                    if (valid.domesticRetail == undefined || (valid.domesticRetail && valid.domesticRetail == '')) {
                        errors["domesticRetail"] = "domesticRetail is required";
                    }
                    else if (parseInt(valid.domesticRetail) < 0) {
                        errors["domesticRetail"] = "domesticRetail must be greater with 0";
                    } 
                    if (valid.domesticSale == undefined || (valid.domesticSale && valid.domesticSale == '')) {
                        errors["domesticSale"] = "domesticSale is required";
                    }
                    else if (parseInt(valid.domesticSale) < 0) {
                        errors["domesticSale"] = "domesticSale must be greater with 0";
                    } 
                    if (valid.internationalCOGS == undefined || (valid.internationalCOGS && valid.internationalCOGS == '')) {
                        errors["internationalCOGS"] = "internationalCOGS is required";
                    }
                    else if (parseInt(valid.internationalCOGS) < 0) {
                        errors["internationalCOGS"] = "internationalCOGS must be greater with 0";
                    }
                    if (valid.internationalWholesale == undefined || (valid.internationalWholesale && valid.internationalWholesale == '')) {
                        errors["internationalWholesale"] = "internationalWholesale is required";
                    }
                    else if (parseInt(valid.internationalWholesale) < 0) {
                        errors["internationalWholesale"] = "internationalWholesale must be greater with 0";
                    }
                    if (valid.internationalRetail == undefined || (valid.internationalRetail && valid.internationalRetail == '')) {
                        errors["internationalRetail"] = "internationalRetail is required";
                    }
                    else if (parseInt(valid.internationalRetail) < 0) {
                        errors["internationalRetail"] = "internationalRetail must be greater with 0";
                    }
                    if (valid.internationalSale == undefined || (valid.internationalSale && valid.internationalSale == '')) {
                        errors["internationalSale"] = "internationalSale is required";
                    }
                    else if (parseInt(valid.internationalSale) < 0) {
                        errors["internationalSale"] = "internationalSale must be greater with 0";
                    } 

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
};