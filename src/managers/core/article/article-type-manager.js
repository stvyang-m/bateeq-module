'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ArticleApproval = BateeqModels.core.article.ArticleApproval;
var ArticleBrand = BateeqModels.core.article.ArticleBrand;
var ArticleCategory = BateeqModels.core.article.ArticleCategory;
var ArticleColor = BateeqModels.core.article.ArticleColor;
var ArticleCostCalculationDetail = BateeqModels.core.article.ArticleCostCalculationDetail;
var ArticleCostCalculation = BateeqModels.core.article.ArticleCostCalculation;
var ArticleCounter = BateeqModels.core.article.ArticleCounter;
var ArticleMaterial = BateeqModels.core.article.ArticleMaterial;
var ArticleMotif = BateeqModels.core.article.ArticleMotif;
var ArticleOrigin = BateeqModels.core.article.ArticleOrigin;
var ArticleSeason = BateeqModels.core.article.ArticleSeason;
var ArticleSize = BateeqModels.core.article.ArticleSize;
var ArticleSubCounter = BateeqModels.core.article.ArticleSubCounter;
var ArticleTheme = BateeqModels.core.article.ArticleTheme;
var ArticleType = BateeqModels.core.article.ArticleType;
var ArticleVariant = BateeqModels.core.article.ArticleVariant;
var Article = BateeqModels.core.article.Article;


module.exports = class ArticleTypeManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleTypeCollection = this.db.use(map.core.article.ArticleType);
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


            this.articleTypeCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(articleTypes => {
                    resolve(articleTypes);
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
                .then(articleType => {
                    resolve(articleType);
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
                .then(articleType => {
                    resolve(articleType);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleTypeCollection
                .single(query)
                .then(articleType => {
                    resolve(articleType);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
    
    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleTypeCollection
                .singleOrDefault(query)
                .then(articleType => {
                    resolve(articleType);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleType) {
        return new Promise((resolve, reject) => {
            this._validate(articleType)
                .then(validArticleType => {

                    this.articleTypeCollection.insert(validArticleType)
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

    update(articleType) {
        return new Promise((resolve, reject) => {
            this._validate(articleType)
                .then(validArticleType => {
                    this.articleTypeCollection.update(validArticleType)
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

    delete(articleType) {
        return new Promise((resolve, reject) => {
            this._validate(articleType)
                .then(validArticleType => {
                    validArticleType._deleted = true;
                    this.articleTypeCollection.update(validArticleType)
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
 
    _validate(articleType) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new ArticleType(articleType);
            // 1. begin: Declare promises.
            var getArticleType = this.articleTypeCollection.singleOrDefault({
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
            Promise.all([getArticleType])
                .then(results => {
                    var _articleType = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_articleType) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required"; 

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../../validation-error');
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