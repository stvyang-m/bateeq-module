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
var purchaseOrder;
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