var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.inventory;
var manager;
var testData;

function getData() {
    var source = testData.storages["UT-BJR"];
    var destination = testData.storages["UT-FNG"];
    var variant = testData.variants["UT-AV1"];

    var TransferOutDoc = require('bateeq-models').inventory.TransferOutDoc;
    var TransferOutItem = require('bateeq-models').inventory.TransferOutItem;
    var transferOutDoc = new TransferOutDoc();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    transferOutDoc.code = code;
    transferOutDoc.date = now;

    transferOutDoc.destinationId = destination._id;
    transferOutDoc.sourceId = source._id;

    transferOutDoc.reference = `reference[${code}]`;

    transferOutDoc.remark = `remark for ${code}`;

    transferOutDoc.items.push(new TransferOutItem({ articleVariantId: variant._id, quantity: 1, remark: 'doc efr-kb-rtf' }));

    return transferOutDoc;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var data = require("../data");
            data(db)
                .then(result => {
                    var PusatReturTokoKirimBarangReturManager = require('../../src/managers/inventory/efr-kb-rtf-manager');
                    manager = new PusatReturTokoKirimBarangReturManager(db, {
                        username: 'unit-test'
                    });
                    testData = result;
                    done();
                });
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#01. should success when create new data', function (done) {
    var data = getData();
    manager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#02. should success when get created data with id`, function (done) {
    manager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validate.transferOutDoc(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function (done) {

    createdData.reference += '[updated]';
    createdData.remark += '[updated]';

    var TransferOutItem = require('bateeq-models').inventory.TransferOutItem;

    manager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#04. should success when get updated data with id`, function (done) {
    manager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validate.transferOutDoc(data);
            data.remark.should.equal(createdData.remark);
            data.reference.should.equal(createdData.reference);
            data.items.length.should.equal(1);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when delete data`, function (done) {
    manager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should _deleted=true`, function (done) {
    manager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validate.transferOutDoc(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});


it('#07. should error with property items minimum one', function (done) {
     var data = getData();
    data.items = [];
    manager.create(data)
        .then(id => {
            done("Should not be error with property items minimum one");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('items');
                e.errors.items.should.String();
                done();
            } catch (ex) {
                done(ex);
            }
        })
});

it('#08. should error with property items must be greater one', function (done) {
    var data = getData();
    data.items =  [{ articleVariantId: '578dd8a976d4f1003e0d7a3f' },
        { quantity: 0 }];
    manager.create(data)
        .then(id => {
            done("Should not be error with property items must be greater one");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('items');
                e.errors.items.should.Array();
                for (var i of e.errors.items) {
                    i.should.have.property('articleVariantId');
                    i.should.have.property('quantity');
                }
                done();
            } catch (ex) {
                done(ex);
            }
        })
});