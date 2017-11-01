"use strict";

require("should");
const moment = require("moment");
const helper = require("../../../helper");

const DesignTrackingActivityManager = require("../../../../src/managers/manufacture/design-tracking-activity-manager");
const DesignTrackingActivityDataUtil = require("../../../data-util/manufacture/design-tracking-activity-data-util");
let manager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            manager = new DesignTrackingActivityManager(db, {
                username: 'dev'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. should error when create with invalid type", function (done) {
    manager.create({ type: "UNIT TEST" })
        .then((id) => {
            done("Should not be able to create with invalid type");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("type");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#02. should error when create with type NOTES and empty notes", function (done) {
    manager.create({ type: "NOTES", field: { notes: "" } })
        .then((id) => {
            done("Should not be able to create with type NOTES and empty notes");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("notes");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#03. should error when create with type TASK and empty data", function (done) {
    manager.create({ type: "TASK", field: { title: "", assignedTo: "", dueDate: "" } })
        .then((id) => {
            done("Should not be able to create with type TASK and empty data");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("title");
                e.errors.should.have.property("assignedTo");
                e.errors.should.have.property("dueDate");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#04. should success when update task status", function (done) {
    var createdData;

    DesignTrackingActivityDataUtil.getTestDataTaskType()
        .then((data) => {
            createdData = data;

            data.type = "Update Task Status";
            data.status = true;

            manager.update(data)
                .then((data) => {
                    data.ok.should.equal(1);
                    done();
                })
                .catch((e) => {
                    done(e);
                });
        });
});

it("#05. should success when update activity attachment", function (done) {
    var createdData;

    DesignTrackingActivityDataUtil.getTestDataNotesType()
        .then((data) => {
            createdData = data;

            data.field.attachments.push({
                fileName: "Unit Test",
                fileNameStorage: "Unit Test"
            });

            data.attachments = data.field.attachments;

            manager.updateActivityAttachment(data)
                .then((data) => {
                    data.ok.should.equal(1);
                    done();
                })
                .catch((e) => {
                    done(e);
                });
        });
});

it("#06. should success when search with keyword", function (done) {
    manager.read({ keyword: "Activity Status" })
        .then((e) => {
            e.should.have.property("data");
            e.data.should.instanceof(Array);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it("#07. should error when create with type TASK due date before now", function (done) {
    manager.create({ type: "TASK", field: { title: "test", assignedTo: "test", dueDate: moment().subtract(1, 'days') } })
        .then((id) => {
            done("Should not be able to create with type TASK due date before now");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("dueDate");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});