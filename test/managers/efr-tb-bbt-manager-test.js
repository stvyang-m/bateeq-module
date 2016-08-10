var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.inventory;
var manager;
var manager2;
var manager3;

function getData(refno) {
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

    transferInDoc.reference = refno;

    transferInDoc.remark = `remark for ${code}`;

    transferInDoc.items.push(new TransferInItem({ articleVariantId: "578855c4964302281454fa51", quantity: 1, remark: 'transferInDoc.test' }));

    return transferInDoc;
}

function getDataSPK() {
    var SpkDoc = require('bateeq-models').merchandiser.SPK;
    var SpkItem = require('bateeq-models').merchandiser.SPKItem;
    var spkDoc = new SpkDoc();
    var now = new Date();
    spkDoc.date = now;
    spkDoc.sourceId = '57738435e8a64fc532cd5bf1';
    spkDoc.destinationId = '57738460d53dae9234ae0ae1';
    spkDoc.isReceived = false;

    spkDoc.reference = `reference[${spkDoc.date}]`;

    spkDoc.items.push(new SpkItem({ articleVariantId: "578855c4964302281454fa51", quantity: 1, remark: 'SPK.test' }));
    return spkDoc;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            var TokoTerimaBarangBaruManager = require('../../src/managers/inventory/efr-tb-bbt-manager');
            manager = new TokoTerimaBarangBaruManager(db, {
                username: 'unit-test'
            });

            var SPKBarangJadiManager = require('../../src/managers/merchandiser/efr-pk-pbj-manager');
            manager2 = new SPKBarangJadiManager(db, {
                username: 'unit-test'
            });
            
            var SPKManager = require('../../src/managers/merchandiser/efr-pk-manager');
            manager3 = new SPKManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdRef;
var dataSPK;
it('#01. should success when create new SPK data', function(done) {
    dataSPK = getDataSPK();
    manager2.create(dataSPK)
        .then(id => {
            id.should.be.Object();
            manager3.getById(id)
            .then(spkDoc => {
                createdRef = spkDoc.packingList;
                dataSPK.password = spkDoc.password;
                done();    
            })
            .catch(e =>{
                done();
            })
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#02. should error when create new data with invalid password', function(done) {
    var data = getData(createdRef);
    data.password = "12345678";
    manager.create(data)
        .then(id => {
            done("should error if insert invalid password");
        })
        .catch(e => {
            e.errors.should.have.property('password');
            e.errors.password.should.String();
            done();
        })
});

it('#03. should success when create new data', function(done) {
    var data = getData(createdRef);
    data.password = dataSPK.password;
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
it(`#04. should success when get created data with id`, function(done) {
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

it(`#05. should success when update created data`, function(done) {

    // createdData.reference += '[updated]';
    createdData.remark += '[updated]';
    createdData.password = dataSPK.password;

    var TransferInItem = require('bateeq-models').inventory.TransferInItem; 

    manager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done("should not update transfer in, spk must be already received");
        })
        .catch(e => {
            e.errors.should.have.property('isReceived');
            e.errors.isReceived.should.String();
            done();
        });
});

// it(`#05. should success when get updated data with id`, function(done) {
//     manager.delete(createdData)
//         .then(id => {
//             createdId.toString().should.equal(id.toString());
//             done("should not delete transfer in, spk must be already received");
//         })
//         .catch(e => {
//             e.errors.should.have.property('isReceived');
//             e.errors.isReceived.should.String();
//             done();
//         });
// });

it(`#06. should success when delete data`, function(done) { 
    manager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done("should not delete transfer in, spk must be already received");
        })
        .catch(e => {
            e.errors.should.have.property('isReceived');
            e.errors.isReceived.should.String();
            done();
        });
});

it(`#07. should _deleted=true`, function(done) {
    manager.getSingleByQuery({_id:createdId})
        .then(data => {
            validate.transferInDoc(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done("should not delete transfer in, spk must be already received");
        })
        .catch(e => {
            done();
        })
}); 

it('#08. should error with property items minimum one', function (done) {
     createdData.items= [];
    manager.create(createdData)
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

it('#09. should error with property items must be greater one', function(done) { 
  createdData.items.push({ articleVariantId: "578855c4964302281454fa51", quantity: 0, remark: 'transferInDoc.test' });
  manager.create(createdData)
      .then(id => { 
          done("Should not be error with property items must be greater one");
      })
      .catch(e => { 
          try
          {  
              e.errors.should.have.property('items');
              e.errors.items.should.String();
            //   for(var i of e.errors.items)
            //   {
            //     i.should.have.property('articleVariantId');
            //     i.should.have.property('quantity');
            //   }
              done();
          }catch(ex)
          {
              done(ex);
          } 
      })
});