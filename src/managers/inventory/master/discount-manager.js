"use strict";
const moduleId = "M-DISC";
var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");
var BateeqModels = require("bateeq-models");
var map = BateeqModels.map;
var generateCode = require('../../../utils/code-generator');
var BaseManager = require('module-toolkit').BaseManager;
var Discount = BateeqModels.inventory.master.Discount;

module.exports = class DiscountManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.inventory.master.Discount);
    }

    _getQuery(paging) {

        var _default = {
            _deleted: false
        },
            pagingFilter = paging.filter || {},
            keywordFilter = {},
            query = {};

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterNo = {
                "no": {
                    "$regex": regex
                }
            };

            var filterUnitDivisionName = {
                "unit.division.name": {
                    "$regex": regex
                }
            };
            var filterUnitName = {
                "unit.name": {
                    "$regex": regex
                }
            };

            var filterCategory = {
                "category.name": {
                    "$regex": regex
                }
            };
            keywordFilter['$or'] = [filterNo, filterUnitDivisionName, filterUnitName, filterCategory];
        }

        query["$and"] = [_default];
        return query;
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.inventory.master.Discount}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        };

        return this.collection.createIndexes([dateIndex]);
    }

    _beforeInsert(discount) {
        discount.code = generateCode(moduleId);
        return Promise.resolve(discount);
    };

    _validate(discount) {
        var valid = discount;
        var errors = {};

        return new Promise((resolve, reject) => {

            if (!valid.name || valid.name == '') {
                errors["name"] = "Masukkan nama";
            }

            if (!valid.startDate || valid.startDate == '') {
                errors["startDate"] = "Masukkan Mulai Berlaku Diskon";
            }

            if (!valid.endDate || valid.endDate == '') {
                errors["endDate"] = "Masukkan Mulai Berakhir Diskon";
            }

            if (!valid.stamp) {
                valid = new Discount(valid);
            }

            valid.stamp(this.user.username, "manager");


            if (Object.getOwnPropertyNames(errors).length > 0) {
                var ValidationError = require('module-toolkit').ValidationError;
                reject(new ValidationError('data does not pass validation', errors));
            }

            resolve(valid);
        });
    }
};