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

module.exports = class ArticleSeasonManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.articleSeasonCollection = this.db.use(map.article.ArticleSeason);
    }

    read() {
        return new Promise((resolve, reject) => {
            this.articleSeasonCollection
                .execute()
                .then(articleSeasons => {
                    resolve(articleSeasons);
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
                .then(articleSeason => {
                    resolve(articleSeason);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleSeasonCollection
                .single(query)
                .then(articleSeason => {
                    resolve(articleSeason);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
 
    create(articleSeason) {
        return new Promise((resolve, reject) => {
            this._validate(articleSeason)
                .then(validArticleSeason => {
                    this.articleSeasonCollection.insert(validArticleSeason)
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

    update(articleSeason) {
        return new Promise((resolve, reject) => {
            this._validate(articleSeason)
                .then(validArticleSeason => {
                    this.articleSeasonCollection.update(validArticleSeason)
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

    delete(articleSeason) {
        return new Promise((resolve, reject) => {
            this._validate(articleSeason)
                .then(validArticleSeason => {
                    validArticleSeason._deleted = true;
                    this.articleSeasonCollection.update(validArticleSeason)
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


    _validate(articleSeason) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleSeason(articleSeason);
            valid.stamp(this.user.username,'manager');
            resolve(valid);   
        });
    }
};