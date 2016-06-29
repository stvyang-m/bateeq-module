'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
var Manager = require('mean-toolkit').Manager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ArticleApproval = BateeqModels.article.ArticleApproval;
var ArticleCategory = BateeqModels.article.ArticleCategory;
var ArticleColor = BateeqModels.article.ArticleColor;
var ArticleCostCalculationDetail = BateeqModels.article.ArticleCostCalculationDetail;
var ArticleCostCalculation = BateeqModels.article.ArticleCostCalculation;
var ArticleMotif = BateeqModels.article.ArticleMotif;
var ArticleOrigin = BateeqModels.article.ArticleOrigin;
var ArticleSeason = BateeqModels.article.ArticleSeason;
var ArticleSize = BateeqModels.article.ArticleSize;
var ArticleStyle = BateeqModels.article.ArticleStyle;
var ArticleSubCategory = BateeqModels.article.ArticleSubCategory;
var ArticleType = BateeqModels.article.ArticleType;
var ArticleVariant = BateeqModels.article.ArticleVariant;
var Article = BateeqModels.article.Article;

module.exports = class ArticleVariantManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.articleVariantCollection = this.db.use(map.article.ArticleVariant);
    }

    read() {
        return new Promise((resolve, reject) => {
            this.articleVariantCollection
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
                .then(articleVariant => {
                    resolve(articleVariant);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleVariantCollection
                .single(query)
                .then(articleVariant => {
                    resolve(articleVariant);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleVariant) {
        return new Promise((resolve, reject) => {
            this._validate(articleVariant)
                .then(validArticleVariant => {

                    this.articleVariantCollection.insert(validArticleVariant)
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

    update(articleVariant) {
        return new Promise((resolve, reject) => {
            this._validate(articleVariant)
                .then(validArticleVariant => {
                    this.articleVariantCollection.update(validArticleVariant)
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

    delete(articleVariant) {
        return new Promise((resolve, reject) => {
            this._validate(articleVariant)
                .then(validArticleVariant => {
                    validArticleVariant._deleted = true;
                    this.articleVariantCollection.update(validArticleVariant)
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


    _validate(articleVariant) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleVariant(articleVariant);
            valid.stamp(this.user.username,'manager');
            resolve(valid);      
        });
    }
};