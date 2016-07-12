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

module.exports = class ArticleCounterManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleCounterCollection = this.db.use(map.article.ArticleCounter);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);
        
        return new Promise((resolve, reject) => {
            this.articleCounterCollection
                .where({_deleted:false})
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(articleCounters => {
                    resolve(articleCounters);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }  

    getById(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id)
            };
            this.getSingleByQuery(query)
                .then(articleCounter => {
                    resolve(articleCounter);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleCounterCollection
                .single(query)
                .then(articleCounter => {
                    resolve(articleCounter);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleCounter) {
        return new Promise((resolve, reject) => {
            this._validate(articleCounter)
                .then(validArticleCounter => {

                    this.articleCounterCollection.insert(validArticleCounter)
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

    update(articleCounter) {
        return new Promise((resolve, reject) => {
            this._validate(articleCounter)
                .then(validArticleCounter => {
                    this.articleCounterCollection.update(validArticleCounter)
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

    delete(articleCounter) {
        return new Promise((resolve, reject) => {
            this._validate(articleCounter)
                .then(validArticleCounter => {
                    validArticleCounter._deleted = true;
                    this.articleCounterCollection.update(validArticleCounter)
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


    _validate(articleCounter) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleCounter(articleCounter);
            valid.stamp(this.user.username,'manager');
            resolve(valid);      
        });
    }
};