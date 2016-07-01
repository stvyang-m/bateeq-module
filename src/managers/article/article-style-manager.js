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

module.exports = class ArticleStyleManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleStyleCollection = this.db.use(map.article.ArticleStyle);
    }
    
    read() {
        return new Promise((resolve, reject) => {
            this.articleStyleCollection
                .execute()
                .then(articleStyles => {
                    resolve(articleStyles);
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
                .then(articleStyle => {
                    resolve(articleStyle);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleStyleCollection
                .single(query)
                .then(articleStyle => {
                    resolve(articleStyle);
                })
                .catch(e => {
                    reject(e);
                });
        })
    } 

    create(articleStyle) {
        return new Promise((resolve, reject) => {
            this._validate(articleStyle)
                .then(validArticleStyle => {

                    this.articleStyleCollection.insert(validArticleStyle)
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

    update(articleStyle) {
        return new Promise((resolve, reject) => {
            this._validate(articleStyle)
                .then(validArticleStyle => {
                    this.articleStyleCollection.update(validArticleStyle)
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

    delete(articleStyle) {
        return new Promise((resolve, reject) => {
            this._validate(articleStyle)
                .then(validArticleStyle => {
                    validArticleStyle._deleted = true;
                    this.articleStyleCollection.update(validArticleStyle)
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


    _validate(articleStyle) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleStyle(articleStyle);
            valid.stamp(this.user.username,'manager');
            resolve(valid);  
        });
    }
};