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

module.exports = class ArticleMaterialManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleMaterialCollection = this.db.use(map.article.ArticleMaterial);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);
        
        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCode = {'code':{'$regex': regex}};
                var filterName = {'name':{'$regex': regex}};
                var $or = {'$or':[filterCode, filterName]};
                
                query['$and'].push($or);
            }


            this.articleMaterialCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(articleMaterials => {
                    resolve(articleMaterials);
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
                .then(articleMaterial => {
                    resolve(articleMaterial);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleMaterialCollection
                .single(query)
                .then(articleMaterial => {
                    resolve(articleMaterial);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleMaterial) {
        return new Promise((resolve, reject) => {
            this._validate(articleMaterial)
                .then(validArticleMaterial => {

                    this.articleMaterialCollection.insert(validArticleMaterial)
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

    update(articleMaterial) {
        return new Promise((resolve, reject) => {
            this._validate(articleMaterial)
                .then(validArticleMaterial => {
                    this.articleMaterialCollection.update(validArticleMaterial)
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

    delete(articleMaterial) {
        return new Promise((resolve, reject) => {
            this._validate(articleMaterial)
                .then(validArticleMaterial => {
                    validArticleMaterial._deleted = true;
                    this.articleMaterialCollection.update(validArticleMaterial)
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


    _validate(articleMaterial) {
        return new Promise((resolve, reject) => {
            var valid = new ArticleMaterial(articleMaterial);
            valid.stamp(this.user.username,'manager');
            resolve(valid);      
        });
    }
};