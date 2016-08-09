var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.inventory;
var manager;

function getData() {
    var expeditionDoc = {};
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    expeditionDoc.code = code;
    expeditionDoc.date = now; 
    expeditionDoc.sourceId = '57738435e8a64fc532cd5bf1';
    expeditionDoc.destinationId = '57738460d53dae9234ae0ae1'; 
    expeditionDoc.reference = `reference[${code}]`; 
    expeditionDoc.spkDocuments = [ { spkDocumentId: '57a9ac2c1b31132b943bd6aa' } ];
        
    // var spk = {};
    // spk.spkDocumentId = '57a3018b9259e20a8840880f';
    //spk.spkDocument = { _id : "57a3018b9259e20a8840880f", items : [] } 
    //spk.spkDocument.items.push( { articleVariantId: "578855c4964302281454fa51", quantity: 10 } )
         
    return expeditionDoc;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var PusatBarangBaruKirimBarangJadiAksesorisManager = require('../../src/managers/inventory/efr-kb-exb-manager');
            manager = new PusatBarangBaruKirimBarangJadiAksesorisManager(db, {
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
 