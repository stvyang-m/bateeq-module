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

module.exports = class ArticleOriginManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.articleOriginCollection = this.db.use(map.article.ArticleOrigin);
    }

    read() {
        return new Promise((resolve, reject) => {
            this.articleOriginCollection
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
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id)
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
        return new Promise((resolve, reject) => {
            var valid = new ArticleOrigin(articleOrigin);
            valid.stamp(this.user.username,'manager');
            resolve(valid);    
        });
    }
};