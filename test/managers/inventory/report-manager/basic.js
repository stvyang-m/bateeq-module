var helper = require("../../../helper");
var InventoryManager = require("../../../../src/managers/inventory/inventory-manager");
var ExpeditionManager = require("../../../../src/managers/inventory/efr-kb-exp-manager");
var SalesManager = require("../../../../src/managers/sales/sales-manager");
var ReportManager = require("../../../../src/managers/inventory/report-manager");
var reportManager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var data = require("../../../data");
            data(db).then((results) => {
                
                console.log("Initialize Report Manager");
                reportManager = new ReportManager(db, {
                    username: 'unit-test'
                });
                console.log("Finish Initialize Report Manager");

                done();
            });
        })
        .catch(e => {
            done(e);
        })
});

before('#01. test report per ro with no realization order', function (done) {
    helper.getDb()
        .then(db => {
            var realizationOrder = "";
            reportManager.getReportItemsByRealizationOrder(realizationOrder)
                .then(result => {
                    
                    if(result.length > 0) {
                        done("has result with no realization order");
                    } else {
                        done("no result");
                    }

                })
                .catch(e => {
                    done(e);
                });
        })
        .catch(e => {
            done(e);
        });
});

before('#01. test report per ro with realization order', function (done) {
    helper.getDb()
        .then(db => {
            var realizationOrder = "";
            reportManager.getReportItemsByRealizationOrder(realizationOrder)
                .then(result => {
                    
                    if(result.length > 0) {
                        done("has result with no realization order");
                    } else {
                        done("no result");
                    }

                })
                .catch(e => {
                    done(e);
                });
        })
        .catch(e => {
            done(e);
        });
});