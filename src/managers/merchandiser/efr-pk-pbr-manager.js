'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var SPKDoc = BateeqModels.merchandiser.SPK;
var SPKItem = BateeqModels.merchandiser.SPKItem;

var moduleId = "EFR-PK/PBR";

module.exports = class SPKBarangJadiReturManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.SPKDocCollection = this.db.use(map.merchandiser.SPKDoc);
        var StorageManager = require('../inventory/storage-manager');
        this.storageManager = new StorageManager(db, user);

        var ArticleVariantManager = require('../core/article/article-variant-manager');
        this.articleVariantManager = new ArticleVariantManager(db, user);

        var ModuleManager = require('../core/module-manager');
        this.moduleManager = new ModuleManager(db, user);

        var ModuleSeedManager = require('../core/module-seed-manager');
        this.moduleSeedManager = new ModuleSeedManager(db, user);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var regexModuleId = new RegExp(moduleId, "i"); 
            var filter = {
                _deleted: false,
                'code': {
                    '$regex': regexModuleId
                }
            };
            var query = _paging.keyword ? {
                '$and': [filter]
            } : filter;

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


            this.SPKDocCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(spkDoc => {
                    resolve(spkDoc);
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
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.SPKDocCollection
                .single(query)
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.SPKDocCollection
                .singleOrDefault(query)
                .then(spkDoc => {
                    resolve(spkDoc);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }


    create(spkDoc) {
        return new Promise((resolve, reject) => {
            this._validate(spkDoc)
                .then(validSpkDoc => {
                    var now = new Date();
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    var date = now.getDay();
                    this.moduleSeedManager
                        .getModuleSeed(moduleId, year, month)
                        .then(moduleSeed => {
                            var number = ++moduleSeed.seed;
                            var zero = 4 - number.toString().length + 1;
                            var runningNumber = Array(+(zero > 0 && zero)).join("0") + number;
                            zero = 2 - month.toString().length + 1;
                            var formattedMonth = Array(+(zero > 0 && zero)).join("0") + month;
                            var formatteddate = Array(+(zero > 0 && zero)).join("0") + date;
                            validSpkDoc.code = `${runningNumber}/${moduleId}/${formattedMonth}/${year}`;
                            validSpkDoc.packingList = `${runningNumber}/EFR-KB/PBR/${formattedMonth}/${year}`;
                            validSpkDoc.password = `${runningNumber}${formatteddate}${formattedMonth}${year}`;
                            this.SPKDocCollection.insert(validSpkDoc)
                                .then(id => {
                                    this.moduleSeedManager
                                        .update(moduleSeed)
                                        .then(seedId => {
                                            resolve(id);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        })
                                })
                                .catch(e => {
                                    reject(e);
                                })
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    createDraft(spkDoc) {
        return new Promise((resolve, reject) => {
            spkDoc.isDraft = true;
            this.create(spkDoc)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(spkDoc) {
        return new Promise((resolve, reject) => {
            this._validate(spkDoc)
                .then(validSpkDoc => {
                    this.SPKDocCollection.update(validSpkDoc)
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

    updateDraft(spkDoc) {
        return new Promise((resolve, reject) => {
            spkDoc.isDraft = true;
            this.update(spkDoc)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        });

    }
    
    updateNotDraft(spkDoc) {
        return new Promise((resolve, reject) => {
            spkDoc.isDraft = false;
            this.update(spkDoc)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        });

    }

    delete(spkDoc) {
        return new Promise((resolve, reject) => {
            this._validate(spkDoc)
                .then(validSpkDoc => {
                    validSpkDoc._deleted = true;
                    this.SPKDocCollection.update(validSpkDoc)
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

    _validate(spkDoc) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = spkDoc;
            this.moduleManager.getByCode(moduleId)
                .then(module => {
                    // 1. begin: Declare promises.
                    var getSPKDoc = this.SPKDocCollection.singleOrDefault({
                        "$and": [{
                            _id: {
                                '$ne': new ObjectId(valid._id)
                            }
                        }, {
                                code: valid.code
                            }]
                    });
                    // 1. end: Declare promises.
                    var config = module.config;
                    var getSource = this.storageManager.getByIdOrDefault(valid.sourceId);
                    // var destination = config.destination.value;
                    // var getDestination;
                    // for (var i = 0; i < destination.value.length; i++) {
                    //     if (destination[i]==ObjectId(valid.destinationId))
                    //         getDestination = this.storageManager.getByIdOrDefault(valid.destinationId);
                    // }

                    var getDestination = this.storageManager.getByIdOrDefault(valid.destinationId);
                    var getItems = [];

                    if (valid.items && valid.items.length > 0) {
                        for (var item of valid.items) {
                            getItems.push(this.articleVariantManager.getByIdOrDefault(item.articleVariantId));
                        }
                    }
                    else {
                        errors["items"] = "items is required";
                    }
                    Promise.all([getSPKDoc, getSource, getDestination].concat(getItems))
                        .then(results => {
                            var _spkDoc = results[0];
                            var source = results[1];
                            var destination = results[2];
                            
                            if (valid._id=='') {
                                var getSPKDoc= this.SPKDocCollection.where(valid._id);
                                if (getSPKDoc.isDraft==0) 
                                {
                                     errors["isDraft"] = "this doc can not update because status not draft";
                                } 
                            }

                            if (!source) {
                                errors["sourceId"] = "sourceId in storage is not found";
                            }
                            else {
                                valid.sourceId = source._id;
                                valid.source = source;
                            }


                            if (!destination) {
                                errors["destinationId"] = "destinationId in storage is not found";
                            }
                            else {
                                valid.destinationId = destination._id;
                                valid.destination = destination;
                            }

                            var articleVariants = results.slice(3, results.length)
                            // 2a. begin: Validate error on item level.
                            if (articleVariants.length > 0) {
                                var itemErrors = [];
                                for (var variant of articleVariants) {
                                    var index = articleVariants.indexOf(variant);
                                    var item = valid.items[index];
                                    var itemError = {};

                                    if (!item.articleVariantId || item.articleVariantId == '') {
                                        itemError["articleVariantId"] = "articleVariantId is required";
                                    }
                                    else {
                                        for (var i = valid.items.indexOf(item) + 1; i < valid.items.length; i++) {
                                            var otherItem = valid.items[i];
                                            if (item.articleVariantId == otherItem.articleVariantId) {
                                                itemError["articleVariantId"] = "articleVariantId already exists on another detail";
                                            }
                                        }
                                    }
                                    if (!variant) {
                                        itemError["articleVariantId"] = "articleVariantId not found";
                                    }
                                    else {
                                        item.articleVariantId = variant._id;
                                        item.articleVariant = variant;
                                    }

                                    if (item.quantity == undefined || (item.quantity && item.quantity == '')) {
                                        itemError["quantity"] = "quantity is required";
                                    }
                                    else if (parseInt(item.quantity) <= 0) {
                                        itemError["quantity"] = "quantity must be greater than 0";
                                    }
                                    itemErrors.push(itemError);
                                }
                                // 2a. end: Validate error on item level.
                                // 2b. add item level errors to parent error, if any.
                                for (var itemError of itemErrors) {
                                    for (var prop in itemError) {
                                        errors.items = itemErrors;
                                        break;
                                    }
                                    if (errors.items)
                                        break;
                                }
                            }

                            // 2c. begin: check if data has any error, reject if it has.
                            for (var prop in errors) {
                                var ValidationError = require('../../validation-error');
                                reject(new ValidationError('data does not pass validation', errors));
                            }
                            valid = new SPKDoc(valid);
                            valid.stamp(this.user.username, 'manager');
                            resolve(valid)
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(new Error(`Unable to load module:${moduleId}`));
                });
        });
    }

};