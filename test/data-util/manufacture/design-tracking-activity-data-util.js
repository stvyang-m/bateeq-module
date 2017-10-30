"use strict";
const helper = require('../../helper');
const DesignTrackingActivityManager = require('../../../src/managers/manufacture/design-tracking-activity-manager');
const generateCode = require("../../../src/utils/code-generator");
const designTrackingDesign = require("./design-tracking-design-data-util");
const account = require("../auth/account-data-util.js");

class DesignTrackingActivityDataUtil {
    getNewData() {
        return designTrackingDesign.getTestData()
            .then((result) => {
                const Model = require('bateeq-models').manufacture.DesignTrackingActivity;
                let data = new Model();

                let code = generateCode("EFR-DTA");

                data.code = code;
                data.dealId = result._id;
                data.type = "ADD";
                data.field = {};

                return Promise.resolve(data);
            });
    }

    getTestDataTaskType() {
        return helper
            .getManager(DesignTrackingActivityManager)
            .then((manager) => {
                return this.getNewData().then((data) => {
                    return account.getTestData()
                        .then((result) => {
                            data.type = "TASK";
                            data.field = {
                                title: "Unit Test Title",
                                notes: "Unit Test Notes",
                                assignedTo: result,
                                dueDate: "2017-26-07 03:00",
                                status: false
                            };

                            return manager.create(data)
                                .then((id) => manager.getSingleById(id));
                        })
                });
            });
    }

    getTestDataNotesType() {
        return helper
            .getManager(DesignTrackingActivityManager)
            .then((manager) => {
                return this.getNewData().then((data) => {
                    return account.getTestData()
                        .then((result) => {
                            data.type = "NOTES";
                            data.field = {
                                notes: "Unit Test Notes",
                                attachments: []
                            };

                            return manager.create(data)
                                .then((id) => manager.getSingleById(id));
                        })
                });
            });
    }

    getTestData() {
        return helper
            .getManager(DealTrackingActivityManager)
            .then((manager) => {
                return this.getNewData().then((data) => {
                    return manager.create(data)
                        .then((id) => manager.getSingleById(id));
                });
            });
    }
}
module.exports = new DesignTrackingActivityDataUtil();
