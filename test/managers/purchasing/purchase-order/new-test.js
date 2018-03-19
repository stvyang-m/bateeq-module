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
var purchaseRequestId;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            purchaseRequestManager = new PurchaseRequestManager(db, {
                username: 'dev'
            });
            purchaseOrderManager = new PurchaseOrderManager(db, {
                username: 'dev'
            });

            purchaseRequestDataUtil.getPRData()
                .then(result => purchaseRequestManager.create(result))
                .then(id => {
                    purchaseRequestId = id;
                    done();
                })
                .catch(e => {
                    done(e);
                });
        })
        .catch(e => {
            done(e);
        });
});

it('#01. should failed when create new purchase-order with unposted purchase-request', function (done) {
    purchaseRequestManager.getSingleByIdOrDefault(purchaseRequestId)
        .then(result => {
            purchaseOrderDataUtil.getNewData(result);
        })
        .then(poDataUtil => {
            purchaseOrderManager.create(poDataUtil);
        })
        .then(id => {
            purchaseOrderId = id;
            done();
        })
        .catch(e => {
            done(e);
        });
});