var should = require("should");
var helper = require("../../../helper");
var ReportManager = require("../../../../src/managers/inventory/report-manager");
var InventoryDataUtil = require("../../../../test/data-util/inventory/report-manager-data-util");
var reportManager = null;

function processingData(data) {
    return new Promise((resolve, reject) => {
        var dataInventory = InventoryDataUtil.getInventoryData(data);

        Promise.all([dataInventory])
            .then(result => {
                if (result[0].item.article.realizationOrder) {
                    var id = result[0].item.article.realizationOrder;
                    resolve(id);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

it('#01. test report per ro with realization order', function (done) {
    helper.getDb()
        .then(db => {
            var data = require("../../../data");
            reportManager = new ReportManager(db, 'unit-test');

            processingData(data).then(realizationOrder => {
                reportManager.getReportItemsByRealizationOrder(realizationOrder)
                    .then(result => {
                        result.should.be.Array();
                        console.log("Done: with result");
                        done();
                    })
                    .catch(e => {
                        done(e);
                    })
            });
        })
        .catch(e => {
            done(e);
        });
});