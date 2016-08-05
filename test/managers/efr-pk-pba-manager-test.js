var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.merchandiser;
var manager;

function getData() {
    var SpkDoc = require('bateeq-models').merchandiser.SPK;
    var SpkItem = require('bateeq-models').merchandiser.SPKItem;
    var spkDoc = new SpkDoc();
    var now = new Date();
    spkDoc.date = now;
    spkDoc.sourceId = '57738435e8a64fc532cd5bf1';
    spkDoc.destinationId = '57738460d53dae9234ae0ae1';

    spkDoc.reference = `reference[${spkDoc.date}]`;

    spkDoc.items.push(new SpkItem({ articleVariantId: "578855c4964302281454fa51", quantity: 1, remark: 'SPK PBA.test' }));
    return spkDoc;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var SPKBarangEmbalaseManager = require('../../src/managers/merchandiser/efr-pk-pba-manager');
            manager = new SPKBarangEmbalaseManager(db, {
                username: 'unit-test'
            });
            done();
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
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#03. should success when save draft new data', function (done) {
     var data = getData();
    manager.createDraft(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdDataDraft;
it(`#04. should success when get drafted data with id`, function (done) {
    manager.getSingleByQuery({ _id: createdId })
        .then(data => { 
            createdDataDraft = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when update created data`, function (done) {

    createdData.reference += '[updated]';
    createdData.remark += '[updated]'; 
    manager.update(createdData)
        .then(id => { 
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should success when update drafted data`, function (done) {

    createdDataDraft.reference += 'Draft [updated]';
    createdDataDraft.remark += 'Draft [updated]'; 
    manager.updateDraft(createdDataDraft)
        .then(id => { 
            done();
        })
        .catch(e => {
            done(e);
        });
});


it(`#07. should success when delete data`, function (done) {
    manager.delete(createdData)
        .then(id => { 
            done();
        })
        .catch(e => {
            done(e);
        });
});

