'esversion: 6'

var should = require("should");
var helper = require("../../../helper");
var PurchaseOrderManager = require("../../../../src/managers/purchasing/purchase-order-manager");
var PurchaseRequestManager = require("../../../../src/managers/purchasing/purchase-request-manager");
var purchaseRequestDataUtil = require("../../../data-util/purchasing/purchase-request-data-util");
var purchaseOrderDataUtil = require("../../../data-util/purchasing/purchase-order-data-util");
var purchaseOrderManager;
var purchaseRequestManager;
var purchaseRequest;
var purchaseOrderFromDataUtil;
var purchaseOrderId;
var purchaseOrder;

before('#00. connect db & create instance', function (done) {
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


it('#01. Create Purchase Request', function (done) {
    purchaseRequestDataUtil.getNewTestData()
        .then(data => {
            purchaseRequest = data;

            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#02. should failed when create new purchase-order with unposted purchase-request', function (done) {
    purchaseOrderDataUtil.getNewData(purchaseRequest)
        .then((purchaseOrder) => {
            return purchaseOrderManager.create(purchaseOrder);
        })
        .then(po => {
            done(purchaseRequest, "purchase-request cannot be used to create purchase-order due unposted status");
        })
        .catch(e => {
            e.errors.should.have.property('purchaseRequestId');
            done();
        });
});

it('#03. should success when get new purchase-order data from util with posted purchase-request', function (done) {
    purchaseRequestManager.post([purchaseRequest])
        .then(pr => {
            purchaseRequest = pr[0];
            purchaseOrderDataUtil.getNewData(purchaseRequest)
                .then((data) => {
                    purchaseOrderFromDataUtil = data;
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

it('#04. should success when create new purchase-order with posted purchase-request', function (done) {
    purchaseOrderManager.create(purchaseOrderFromDataUtil)
        .then(id => {
            purchaseOrderId = id;
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#05. should success when validate purchase-order with posted purchase-request', function (done) {
    purchaseOrderManager.getSingleById(purchaseOrderId)
    .then(data => {
        purchaseOrder = data;
        done();
    })
    .catch(e => {
        done(e);
    });
});