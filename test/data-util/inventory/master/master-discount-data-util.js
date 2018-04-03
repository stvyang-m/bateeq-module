"use strict";
var helper = require("./../../../helper");
var BaseManager = require('module-toolkit').BaseManager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
var store = require("../../master/store-manager-data-util");
var item = require("../../master/item-data-util");
var codeGenerator = require("../../../../src/utils/code-generator");

class MasterDiscountDataUtil {
    getNewData() {
        var getStore = store.getNewData();
        var getItem = item.getNewData();

        return Promise.all([getStore,getItem])
            .then(result => {
                var store = result[0];
                var item = result[1];
                var now = new Date();
                var after = new Date();

                var data = {
                    code : `discount/${codeGenerator()}`,
                    name: 'discount testing',
                    startDate : now,
                    endDate : after,
                    discountMapping : 'Discount 1', 
                    storeId : store._id,
                    store : store,
                    storeCategory : 'DEPT STORE',
                    itemId : item._id,
                    item : item
                };

                return Promise.resolve(data);
            })
            .catch(e => {
                Promise.reject(e);
            });
    }
}

module.exports = new MasterDiscountDataUtil();