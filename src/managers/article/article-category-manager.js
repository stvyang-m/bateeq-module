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

module.exports = class ArticleCategoryManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleCategoryCollection = this.db.use(map.article.ArticleCategory);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);
        
        return new Promise((resolve, reject) => {
            this.articleCategoryCollection
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
            var query = {
                _id: new ObjectId(id)
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
        return new Promise((resolve, reject) => {
            var valid = new ArticleCategory(articleCategory);
            valid.stamp(this.user.username,'manager');
            resolve(valid);      
        });
    }
};