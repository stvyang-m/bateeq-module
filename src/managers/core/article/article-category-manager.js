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

module.exports = class ArticleCategoryManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleCategoryCollection = this.db.use(map.core.article.ArticleCategory);
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


            this.articleCategoryCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(articleCategories => {
                    resolve(articleCategories);
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
                .then(articleCategory => {
                    resolve(articleCategory);
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
                .then(articleCategory => {
                    resolve(articleCategory);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleCategoryCollection
                .single(query)
                .then(articleCategory => {
                    resolve(articleCategory);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleCategoryCollection
                .singleOrDefault(query)
                .then(articleCategory => {
                    resolve(articleCategory);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleCategory) {
        return new Promise((resolve, reject) => {
            this._validate(articleCategory)
                .then(validArticleCategory => {

                    this.articleCategoryCollection.insert(validArticleCategory)
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

    update(articleCategory) {
        return new Promise((resolve, reject) => {
            this._validate(articleCategory)
                .then(validArticleCategory => {
                    this.articleCategoryCollection.update(validArticleCategory)
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

    delete(articleCategory) {
        return new Promise((resolve, reject) => {
            this._validate(articleCategory)
                .then(validArticleCategory => {
                    validArticleCategory._deleted = true;
                    this.articleCategoryCollection.update(validArticleCategory)
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


    _validate(articleCategory) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new ArticleCategory(articleCategory);
            //1.begin: Declare promises.
            var getArticleMotif = this.articleCategoryCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    code: valid.code
                }]
            });
            //1. end:Declare promises.

            //2.begin: Validation 
            Promise.all([getArticleMotif])
                .then(results => {
                    var _articleMotif = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_articleMotif) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required";

                    // 2a. begin: check if data has any error, reject if it has.
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