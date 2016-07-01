'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var ArticleApproval = BateeqModels.article.ArticleApproval;
var Article = BateeqModels.article.Article;
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

module.exports = class ArticleManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleCollection = this.db.use(map.article.Article);
        this.articleApprovalCollection = this.db.use(map.article.ArticleApproval);
    } 
    
    read() {
        return new Promise((resolve, reject) => {
            this.articleCollection
                .execute()
                .then(articles => {
                    resolve(articles);
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
                .then(article => {
                    resolve(article);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleCollection
                .single(query)
                .then(article => {
                    resolve(article);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(article) {
        return new Promise((resolve, reject) => {
            this._validate(article)
                .then(validArticle => {

                    this.articleCollection.insert(validArticle)
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

    update(article) {
        return new Promise((resolve, reject) => {
            this._validate(article)
                .then(validArticle => {
                    this.articleCollection.update(validArticle)
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

    delete(article) {
        return new Promise((resolve, reject) => {
            this._validate(article)
                .then(validArticle => {
                    validArticle._deleted = true;
                    this.articleCollection.update(validArticle)
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


    _validate(article) {
        return new Promise((resolve, reject) => {
            var valid = new Article(article);
            valid.stamp(this.user.username,'manager');
            resolve(valid);      
        });
    }
};