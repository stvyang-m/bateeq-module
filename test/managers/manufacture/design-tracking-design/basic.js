"use strict";

let options = {
    manager: require("../../../../src/managers/manufacture/design-tracking-design-manager"),
    model: require("bateeq-models").manufacture.DesignTrackingDesign,
    util: require("../../../data-util/manufacture/design-tracking-design-data-util"),
    validator: require("bateeq-models").validator.manufacture.designTrackingDesign,
    createDuplicate: false,
    keys: []
};

let basicTest = require("../../../basic-test-factory");
basicTest(options);