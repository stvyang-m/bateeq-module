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

module.exports = class ArticleSubCategoryManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleSubCategoryCollection = this.db.use(map.article.ArticleSubCategory);
    }
    
    read() {
        return new Promise((resolve, reject) => {
            this.articleSubCategoryCollection
                .execute()
                .then(articleSubCategories => {
                    resolve(articleSubCategories);
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
                .then(articleSubCategory => {
                    resolve(articleSubCategory);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleSubCategoryCollection
                .single(query)
                .then(articleSubCategory => {
                    resolve(articleSubCategory);
                })
                .catch(e => {
                    reject(e);
                });
        })
    } 
 
    create(articleSubCategory) {
        return new Promise((resolve, reject) => {
            this._validate(articleSubCategory)
                .then(validArticleSubCategory => {

                    this.articleSubCategoryCollection.insert(validArticleSubCategory)
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

    update(articleSubCategory) {
        return new Promise((resolve, reject) => {
            this._validate(articleSubCategory)
                .then(validArticleSubCategory => {
                    this.articleSubCategoryCollection.update(validArticleSubCategory)
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

    delete(articleSubCategory) {
        return new Promise((resolve, reject) => {
            this._validate(articleSubCategory)
                .then(validArticleSubCategory => {
                    validArticleSubCategory._deleted = true;
                    this.articleSubCategoryCollection.update(validArticleSubCategory)
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


    _validate(articleSubCategory) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleSubCategory(articleSubCategory);
            valid.stamp(this.user.username,'manager');
            resolve(valid); 
        });
    }
};