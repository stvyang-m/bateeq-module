'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;
var sha1 = require("sha1");

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var Account = BateeqModels.core.Account;


module.exports = class AccountManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.accountCollection = this.db.use(map.core.Account);
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
                var filterUsername = {
                    'username': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterUsername]
                };

                query['$and'].push($or);
            }


            this.accountCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(accounts => {
                    resolve(accounts);
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
                .then(account => {
                    resolve(account);
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
                .then(account => {
                    resolve(account);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByUsername(username) {
        return new Promise((resolve, reject) => {
            if (username === '')
                resolve(null);
            var query = {
                username: new ObjectId(username),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(account => {
                    resolve(account);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    
    getByUsernameAndPassword(username, password) {
        return new Promise((resolve, reject) => {
            if (username === '')
                resolve(null);
            var query = {
                username: username,
                password: sha1(password),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(account => {
                    resolve(account);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.accountCollection
                .single(query)
                .then(account => {
                    resolve(account);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.accountCollection
                .singleOrDefault(query)
                .then(account => {
                    resolve(account);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(account) {
        return new Promise((resolve, reject) => {
            this._validate(account)
                .then(validAccount => {
                    validAccount.password = sha1(validAccount.password);
                    this.accountCollection.insert(validAccount)
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

    update(account) {
        return new Promise((resolve, reject) => {
            this._validate(account)
                .then(validAccount => {
                    this.accountCollection.update(validAccount)
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

    delete(account) {
        return new Promise((resolve, reject) => {
            this._validate(account)
                .then(validAccount => {
                    validAccount._deleted = true;
                    this.accountCollection.update(validAccount)
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

    _validate(account) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = account;
            // 1. begin: Declare promises.
            var getAccount = this.accountCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    username: valid.username
                }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getAccount])
                .then(results => {
                    var _account = results[0];

                    if (!valid.username || valid.username == '')
                        errors["username"] = "username is required";
                    else if (_account) {
                        errors["username"] = "username already exists";
                    }

                    if (!valid._id && (!valid.password || valid.name == ''))
                        errors["password"] = "password is required";

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }
                    valid = new Account(account);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
};