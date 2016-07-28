'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ModuleSeed = BateeqModels.core.ModuleSeed;


module.exports = class ModuleSeedManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.moduleSeedCollection = this.db.use(map.core.ModuleSeed);

        var ModuleManager = require('./module-manager');
        this.moduleManager = new ModuleManager(db, user);
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
                var filterModuleCode = {
                    'module.code': {
                        '$regex': regex
                    }
                };
                var filterModuleName = {
                    'module.name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterModuleCode, filterModuleName]
                };

                query['$and'].push($or);
            }


            this.moduleSeedCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(moduleSeeds => {
                    resolve(moduleSeeds);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    readByModuleId(moduleId, paging) {
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
            var module = {
                moduleId: new ObjectId(moduleId)
            };
            var query = {
                '$and': [deleted, module]
            };

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterModuleCode = {
                    'module.code': {
                        '$regex': regex
                    }
                };
                var filterModuleName = {
                    'module.name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterModuleCode, filterModuleName]
                };

                query['$and'].push($or);
            }


            this.moduleSeedCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(moduleSeeds => {
                    resolve(moduleSeeds);
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
                .then(moduleSeed => {
                    resolve(moduleSeed);
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
                .then(moduleSeed => {
                    resolve(moduleSeed);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.moduleSeedCollection
                .single(query)
                .then(moduleSeed => {
                    resolve(moduleSeed);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.moduleSeedCollection
                .singleOrDefault(query)
                .then(moduleSeed => {
                    resolve(moduleSeed);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    create(moduleSeed) {
        return new Promise((resolve, reject) => {
            this._validate(moduleSeed)
                .then(validModuleSeed => {

                    this.moduleSeedCollection.insert(validModuleSeed)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    update(moduleSeed) {
        return new Promise((resolve, reject) => {
            this._validate(moduleSeed)
                .then(validModuleSeed => {
                    this.moduleSeedCollection.update(validModuleSeed)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    delete(moduleSeed) {
        return new Promise((resolve, reject) => {
            this._validate(moduleSeed)
                .then(validModuleSeed => {
                    validModuleSeed._deleted = true;
                    this.moduleSeedCollection.update(validModuleSeed)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getModuleSeed(moduleCode, year, month) {
        var query = {
            '$and': [{
                'module.code': moduleCode
            }, {
                year: year
            }, {
                month: month
            }, {
                _deleted: false
            }]
        };

        return new Promise((resolve, reject) => {
            this.moduleSeedCollection
                .singleOrDefault(query)
                .then(moduleSeed => {
                    if (moduleSeed)
                        resolve(moduleSeed);
                    else {

                        this.moduleManager.getByCode(moduleCode)
                            .then(module => {

                                var newModuleSeed = new ModuleSeed({
                                    moduleId: new ObjectId(module._id),
                                    year: year,
                                    month: month
                                });
                                
                                this.create(newModuleSeed)
                                    .then(docId => {
                                        this.moduleSeedCollection
                                            .single({
                                                _id: docId
                                            })
                                            .then(moduleSeed => {
                                                resolve(moduleSeed);
                                            })
                                            .catch(e => {
                                                reject(e);
                                            });
                                    })
                                    .catch(e => {
                                        reject(e);
                                    });
                            })
                            .catch(e => {
                                reject(e);
                            });


                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    _validate(moduleSeed) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = moduleSeed;
            // 1. begin: Declare promises.
            var getModuleSeedDoc = this.moduleSeedCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    moduleId: new ObjectId(valid.moduleId),
                    year: valid.year,
                    month: valid.month
                }]
            });
            // 1. end: Declare promises.
            var getModule = this.moduleManager.getById(moduleSeed.moduleId);

            Promise.all([getModuleSeedDoc, getModule])
                .then(results => {
                    var _moduleSeed = results[0];
                    var module = results[1];

                    if (!valid.moduleId || valid.moduleId == '')
                        errors["moduleId"] = "moduleId is required";
                    if (!module) {
                        errors["moduleId"] = "moduleId not found";
                    }
                    else if (_moduleSeed) {
                        errors["moduleId"] = `year ${valid.year} with month ${valid.month} already exists`;
                        errors["year"] = `year ${valid.year} with month ${valid.month} already exists`;
                        errors["month"] = `year ${valid.year} with month ${valid.month} already exists`;
                    }
                    else {
                        valid.moduleId = module._id;
                        valid.module = module;
                    }

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new ModuleSeed(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
};