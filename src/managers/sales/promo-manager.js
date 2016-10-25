'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var Promo = BateeqModels.sales.Promo;
//var generateCode = require('../../utils/code-generator');
 
module.exports = class PromoManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.promoCollection = this.db.use(map.sales.PromoDoc);
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


            this.promoCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(promoes => {
                    resolve(promoes);
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
                .then(promo => {
                    resolve(promo);
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
                .then(promoes => {
                    resolve(promoes);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByCode(code) {
        return new Promise((resolve, reject) => {
            var query = {
                code: code,
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(promo => {
                    resolve(promo);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    
    getByStoreVariantDatetime(storeId, variantId, datetime) {
        return new Promise((resolve, reject) => {
            var query = {
                stores: {'$elemMatch': { _id: new ObjectId(storeId)}},
                promoProducts: {'$elemMatch': { articleVariantId: new ObjectId(variantId)}},
                validDateFrom: {'$lte': new Date(datetime)},
                validDateTo: {'$gte': new Date(datetime)},
                _deleted: false
            };
            this.getFirstOrDefaultByQuery(query)
                .then(promo => {
                    resolve(promo);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.promoCollection
                .single(query)
                .then(promo => {
                    resolve(promo);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.promoCollection
                .singleOrDefault(query)
                .then(promo => {
                    resolve(promo);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
    
    getFirstOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.promoCollection
                .firstOrDefault(query)
                .then(promo => {
                    resolve(promo);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(promo) {
        return new Promise((resolve, reject) => {
            //promo.code = generateCode("promo");
            this._validate(promo)
                .then(validPromo => {
                    this.promoCollection.insert(validPromo)
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

    update(promo) {
        return new Promise((resolve, reject) => {
            this._validate(promo)
                .then(validPromo => {
                    this.promoCollection.update(validPromo)
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

    delete(promo) {
        return new Promise((resolve, reject) => {
            this._validate(promo)
                .then(validPromo => {
                    validPromo._deleted = true;
                    this.promoCollection.update(validPromo)
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
 
    _validate(promo) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new Promo(promo);
            // 1. begin: Declare promises.
            var getPromo = this.promoCollection.singleOrDefault({
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
            Promise.all([getPromo])
                .then(results => {
                    var _promo = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_promo) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required"; 

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