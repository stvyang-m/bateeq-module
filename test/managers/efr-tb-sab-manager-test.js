var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.inventory;
var manager;

function getData() {
    var finishingDoc = {};
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    finishingDoc.code = code;
    finishingDoc.date = now; 
    finishingDoc.sourceId = '57738435e8a64fc532cd5bf1';
    finishingDoc.destinationId = '57738460d53dae9234ae0ae1'; 
    finishingDoc.reference = `reference[${code}]`; 
    finishingDoc.remark = `remark for ${code}`; 
    finishingDoc.items = [];
    
    
    now = new Date();
    stamp = now / 1000 | 0;
    var code2 = stamp.toString(36); 
    
    var item = {};
    item.articleVariant = { _id : "578855c4964302281454fa51", code : "[Updated]", name : code , size:"size" , finishings : [] } 
    item.articleVariant.finishings.push({ quantity: 10, articleVariant: { name : code2 } });
    item.articleVariant.finishings.push({ articleVariantId: "578855c4964302281454fa51", quantity: 10, articleVariant: { _id: "578855c4964302281454fa51", code : code, name : code, size:"size" } });
    finishingDoc.items.push(item);
     
    return finishingDoc;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var FinishingTerimaKomponenManager = require('../../src/managers/inventory/efr-tb-sab-manager');
            manager = new FinishingTerimaKomponenManager(db, {
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
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});
 