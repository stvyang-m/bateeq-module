'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var RewardType = BateeqModels.sales.RewardType;
//var generateCode = require('../../utils/code-generator');
 
module.exports = class RewardTypeManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.rewardTypeCollection = this.db.use(map.sales.RewardType);
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


            this.rewardTypeCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(rewardTypes => {
                    resolve(rewardTypes);
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
                .then(rewardType => {
                    resolve(rewardType);
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
                .then(rewardType => {
                    resolve(rewardType);
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
                .then(rewardType => {
                    resolve(rewardType);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.rewardTypeCollection
                .single(query)
                .then(rewardType => {
                    resolve(rewardType);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.rewardTypeCollection
                .singleOrDefault(query)
                .then(rewardType => {
                    resolve(rewardType);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(rewardType) {
        return new Promise((resolve, reject) => {
            //rewardType.code = generateCode("rewardType");
            this._validate(rewardType)
                .then(validRewardType => {
                    this.rewardTypeCollection.insert(validRewardType)
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

    update(rewardType) {
        return new Promise((resolve, reject) => {
            this._validate(rewardType)
                .then(validRewardType => {
                    this.rewardTypeCollection.update(validRewardType)
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

    delete(rewardType) {
        return new Promise((resolve, reject) => {
            this._validate(rewardType)
                .then(validRewardType => {
                    validRewardType._deleted = true;
                    this.rewardTypeCollection.update(validRewardType)
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
 
    _validate(rewardType) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new RewardType(rewardType);
            // 1. begin: Declare promises.
            var getRewardType = this.rewardTypeCollection.singleOrDefault({
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
            Promise.all([getRewardType])
                .then(results => {
                    var _rewardType = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_rewardType) {
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