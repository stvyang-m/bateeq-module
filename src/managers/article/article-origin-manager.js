'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ArticleApproval = BateeqModels.article.ArticleApproval;
var ArticleBrand = BateeqModels.article.ArticleBrand;
var ArticleCategory = BateeqModels.article.ArticleCategory;
var ArticleColor = BateeqModels.article.ArticleColor;
var ArticleCostCalculationDetail = BateeqModels.article.ArticleCostCalculationDetail;
var ArticleCostCalculation = BateeqModels.article.ArticleCostCalculation;
var ArticleCounter = BateeqModels.article.ArticleCounter;
var ArticleMaterial = BateeqModels.article.ArticleMaterial;
var ArticleMotif = BateeqModels.article.ArticleMotif;
var ArticleOrigin = BateeqModels.article.ArticleOrigin;
var ArticleSeason = BateeqModels.article.ArticleSeason;
var ArticleSize = BateeqModels.article.ArticleSize;
var ArticleSubCounter = BateeqModels.article.ArticleSubCounter;
var ArticleTheme = BateeqModels.article.ArticleTheme;
var ArticleType = BateeqModels.article.ArticleType;
var ArticleVariant = BateeqModels.article.ArticleVariant;
var Article = BateeqModels.article.Article;

module.exports = class ArticleOriginManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleOriginCollection = this.db.use(map.article.ArticleOrigin);
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


            this.articleOriginCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(articleOrigins => {
                    resolve(articleOrigins);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        if (id === '')
            resolve(null);
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByIdOrDefault(id) {
        if (id === '')
            resolve(null);
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleOrDefaultByQuery(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleOriginCollection
                .single(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleOriginCollection
                .singleOrDefault(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleOrigin) {
        return new Promise((resolve, reject) => {
            this._validate(articleOrigin)
                .then(validArticleOrigin => {

                    this.articleOriginCollection.insert(validArticleOrigin)
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

    update(articleOrigin) {
        return new Promise((resolve, reject) => {
            this._validate(articleOrigin)
                .then(validArticleOrigin => {
                    this.articleOriginCollection.update(validArticleOrigin)
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

    delete(articleOrigin) {
        return new Promise((resolve, reject) => {
            this._validate(articleOrigin)
                .then(validArticleOrigin => {
                    validArticleOrigin._deleted = true;
                    this.articleOriginCollection.update(validArticleOrigin)
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


    _validate(articleOrigin) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new ArticleOrigin(articleOrigin);
            //1.begin: Declare promises.
            var getArticleMotif = this.articleOriginCollection.singleOrDefault({
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