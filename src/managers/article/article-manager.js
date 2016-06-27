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

module.exports = class ArticleManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.articleCollection = this.db.use(map.article.Article);
        this.articleApprovalCollection = this.db.use(map.article.ArticleApproval);
    }

    create(article) {
        return new Promise((resolve, reject) => {
            this._validate(article)
                .then(validArticle => {

                    this.articleCollection.insert(validArticle)
                        .catch(id => {

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
            resolve(article);
        });
    }
};