var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.inventory;
var manager;

function getData() {
    var TransferInDoc = require('bateeq-models').inventory.TransferInDoc;
    var TransferInItem = require('bateeq-models').inventory.TransferInItem;
    var transferInDoc = new TransferInDoc();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    transferInDoc.code = code;
    transferInDoc.date = now;
    
    transferInDoc.sourceId = '57738435e8a64fc532cd5bf1';
    transferInDoc.destinationId = '57738460d53dae9234ae0ae1';
    
    transferInDoc.reference = `reference[${code}]`;
    
    transferInDoc.remark = `remark for ${code}`;
    
    transferInDoc.items.push(new TransferInItem({articleVariantId:"578855c4964302281454fa51", quantity: 5, remark:'transferInDoc.test'}));

    return transferInDoc;
}

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var TransferInDocManager = require('../../src/managers/inventory/transfer-in-doc-manager');
            manager = new TransferInDocManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#01. should success when create new data', function(done) {
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
it(`#02. should success when get created data with id`, function(done) {
    manager.getSingleByQuery({_id:createdId})
        .then(data => {
            validate.transferInDoc(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function(done) {
 
    createdData.reference += '[updated]';
    createdData.remark += '[updated]';
    
    var TransferInItem = require('bateeq-models').inventory.TransferInItem;
    // createdData.items.push(new TransferInItem());

    manager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#04. should success when get updated data with id`, function(done) {
    manager.getSingleByQuery({_id:createdId})
        .then(data => {
            validate.transferInDoc(data);
            data.remark.should.equal(createdData.remark);
            data.reference.should.equal(createdData.reference); 
            data.items.length.should.equal(1);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when delete data`, function(done) { 
    manager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should _deleted=true`, function(done) {
    manager.getSingleByQuery({_id:createdId})
        .then(data => {
            validate.transferInDoc(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});