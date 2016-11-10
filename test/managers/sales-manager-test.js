var should = require('should');
var helper = require('../helper');
var manager;
var testData;

function getData() {
    var store = testData.stores["ST-BJB"]; 
    var bank = testData.banks["BA-BCA"];                    //BCA, MANDIRI, BRI, dkk
    var cardType = testData.cardTypes["CT-VISA"];           //CARD, MASTERCARD, VISA
    var variant = testData.finishedGoods["UT-FG2"];
 
    var Sales = require('bateeq-models').sales.Sales;
    var SalesItem = require('bateeq-models').sales.SalesItem;
    var SalesDetail = require('bateeq-models').sales.SalesDetail;
    var sales = new Sales();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    sales.code = code;
    sales.date = now;
    sales.discount = 0;
    sales.reference = '';
    sales.remark = '';
    
    sales.storeId = store._id;
    sales.store = store;  

    sales.items.push(new SalesItem({
        itemId: variant._id,
        item: variant,
        promoId: '',
        promo: {},
        quantity: 1,
        price: 100000,
        discount1: 0,
        discount2: 0,
        margin: 0,
        specialDiscount: 0,
        total: 100000
    }));
    
    var salesTotal = 0;
    for(var i of sales.items) {
        salesTotal += i.total;
    }

    sales.salesDetail = new SalesDetail({
        paymentType : 'Card', //Cash, Card, Partial
        voucherId : {},
        voucher : {},
        bankId : bank._id,
        bank : bank,
        cardTypeId : cardType._id,
        cardType : cardType,                
        card : 'Credit', //Debit | Credit
        cardNumber : '1000200030004000',
        cardName : 'CardName',
        cashAmount : 0,
        cardAmount : salesTotal
    })
    return sales;
}  

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var data = require("../data");
            data(db)
                .then(result => { 
                    var SalesManager = require('../../src/managers/sales/sales-manager');
                    manager = new SalesManager(db, {
                        username: 'unit-test'
                    });
                    testData = result; 
                    done();
                });
        })
        .catch(e => {
            done(e);
        });
});

var createdId;
var createdData;
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
        });
});

it(`#02. should success when get created data with id`, function(done) {
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function(done) {  
    createdData.remark += '[updated]';  
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
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => { 
            data.remark.should.equal(createdData.remark); 
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
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => { 
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});
