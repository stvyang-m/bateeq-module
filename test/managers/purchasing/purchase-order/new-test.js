/*jshint esversion: 6 */

var should = require("should");
var helper = require("../../../helper");

var purchaseRequestDataUtil = require("../../../data-util/purchasing/purchase-request-data-util");
var validatePR = require("bateeq-models").validator.purchasing.purchaseRequest;
var PurchaseRequestManager = require("../../../../src/managers/purchasing/purchase-request-manager");
var purchaseRequestManager = null;
var purchaseOrderDataUtil = require("../../../data-util/purchasing/purchase-order-data-util");
var validatePO = require("bateeq-models").validator.purchasing.purchaseOrder;
var PurchaseOrderManager = require("../../../../src/managers/purchasing/purchase-order-manager");
var purchaseOrderManager = null;
var purchaseOrderId;
var purchaseRequest;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            purchaseRequestManager = new PurchaseRequestManager(db, {
                username: 'dev'
            });
            purchaseOrderManager = new PurchaseOrderManager(db, {
                username: 'dev'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. Should Success when create new Purchase Order", function (done) {
    purchaseRequestDataUtil.getNewData()
        .then(prDataUtil => purchaseRequestManager.create(prDataUtil))
        .then(id => purchaseRequestManager.getSingleByIdOrDefault(id))
        .then(data => {
            purchaseRequest = data;
            done();
        })
        .catch(e => {
            done(e);
        });
});