'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
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

module.exports = class ArticleMotifManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleMotifCollection = this.db.use(map.article.ArticleMotif);
    }

    read() {
        return new Promise((resolve, reject) => {
            this.articleMotifCollection
                .execute()
                .then(articleMotifs => {
                    resolve(articleMotifs);
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
                .then(articleMotif => {
                    resolve(articleMotif);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleMotifCollection
                .single(query)
                .then(articleMotif => {
                    resolve(articleMotif);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleMotif) {
        return new Promise((resolve, reject) => {
            this._validate(articleMotif)
                .then(validArticleMotif => {

                    this.articleMotifCollection.insert(validArticleMotif)
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

    update(articleMotif) {
        return new Promise((resolve, reject) => {
            this._validate(articleMotif)
                .then(validArticleMotif => {
                    this.articleMotifCollection.update(validArticleMotif)
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

    delete(articleMotif) {
        return new Promise((resolve, reject) => {
            this._validate(articleMotif)
                .then(validArticleMotif => {
                    validArticleMotif._deleted = true;
                    this.articleMotifCollection.update(validArticleMotif)
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


    _validate(articleMotif) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleMotif(articleMotif);
            valid.stamp(this.user.username,'manager');
            resolve(valid);     
        });
    }
};