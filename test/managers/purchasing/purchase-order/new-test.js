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
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. Should Success when create new Purchase request", function (done) {
    purchaseRequestDataUtil.getNewData()
        .then(pr => { 
            purchaseRequestManager.create(pr);
        })
        .then(id => {
            purchaseRequestId = id;
            done();
        })
        .catch(e => {
            done(e);
        });
});

// it('#02. should failed when create new purchase-order with unposted purchase-request', function (done) {
//     purchaseOrderDataUtil.getNewData(purchaseRequest)
//         .then((purchaseOrder) => {
//             return purchaseOrderManager.create(purchaseOrder);
//         })
//         .then(po => {
//             done(purchaseRequest, "purchase-request cannot be used to create purchase-order due unposted status");
//         })
//         .catch(e => {
//             e.errors.should.have.property('purchaseRequestId');
//             done();
//         });
// });

// it('#03. should success when create posted purchase-request', function (done) {
//     purchaseRequestManager.post([purchaseRequest])
//         .then(pr => {
//             purchaseRequest = pr[0];
//             done();
//         })
//         .catch(e => {
//             done(e);
//         });
// });

// it('#04. should success when create new purchase-order with posted purchase-request', function (done) {
//     purchaseOrderDataUtil.getNewData(purchaseRequest)
//         .then((purchaseOrder) => {
//             return purchaseOrderManager.create(purchaseOrder);
//         })
//         .then((id) => {
//             purchaseOrderId = id;
//             done();
//         })
//         .catch(e => {
//             done(e);
//         });
// });