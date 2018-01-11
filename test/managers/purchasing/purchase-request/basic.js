var options = {
    manager: require("../../../../src/managers/purchasing/purchasing-request-manager"),
    model: require("bateeq-models").purchasing.PurchaseRequest,
    util: require("../../../data-util/purchasing/purchase-request-data-util"),
    validator: require("bateeq-models").validator.purchasing.purchaseRequest,
    createDuplicate: false,
    keys: ["no"]
};

var basicTest = require("../../../basic-test-factory");
basicTest(options); 