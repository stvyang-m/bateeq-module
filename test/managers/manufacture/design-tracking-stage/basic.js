var options = {
    manager: require('../../../../src/managers/manufacture/design-tracking-stage-manager'),
    model: require('bateeq-models').manufacture.DesignTrackingStage,
    util: require('../../../data-util/manufacture/design-tracking-stage-data-util'),
    validator: require('bateeq-models').validator.manufacture.designTrackingStage,
    createDuplicate: false,
    keys: []
};

var basicTest = require('../../../basic-test-factory');
basicTest(options);
