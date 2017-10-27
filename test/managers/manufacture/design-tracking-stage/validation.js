"use strict";

require("should");
const helper = require('../../../helper');
const DesignTrackingStageManager = require('../../../../src/managers/manufacture/design-tracking-stage-manager');
const DesignTrackingStageDataUtil = require("../../../data-util/manufacture/design-tracking-stage-data-util");
let manager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            manager = new DesignTrackingStageManager(db, {
                username: 'dev'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. should error when create with empty name", function (done) {
    manager.create({ name: "" })
        .then((id) => {
            done("Should not be able to create with empty name");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("name");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#02. should success when update stage design", function (done) {
    DesignTrackingStageDataUtil.getTestData()
        .then((data) => {
            data.type = "Activity";
            data.designs.push("");
            
            manager.update(data)
                .then((data) => {
                    data.ok.should.equal(1);
                    done();
                })
                .catch((e) => {
                    done(e);
                });
        })
});

it("#03. should success when search with keyword", function (done) {
    manager.read({ keyword: "Design Tracking Stage" })
        .then((e) => {
            e.should.have.property("data");
            e.data.should.instanceof(Array);
            done();
        })
        .catch((e) => {
            done(e);
        });
});