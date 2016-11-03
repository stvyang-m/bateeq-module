var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.sales;
var manager;
var testData;

function getData() {
    var rewardType = testData.rewardTypes["RT-DISKON"];
    var variant = testData.finishedGoods["UT-FG2"];
    var stores = [];
    stores.push(testData.stores["ST-FNG"]);
    stores.push(testData.stores["ST-BJB"]);
    stores.push(testData.stores["ST-BJR"]);

    var Promo = require('bateeq-models').sales.Promo;
    var PromoProduct = require('bateeq-models').sales.PromoProduct;
    var PromoDiscount = require('bateeq-models').sales.PromoDiscount;
    var promo = new Promo();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    promo.code = code;
    promo.name = `name[${code}]`;
    promo.description = `description for ${code}`; 
    promo.validDateFrom = new Date(); 
    promo.validDateTo= new Date(); 
    promo.stores = stores;
    promo.promoProducts = [];
     
    var promoDiscount = new PromoDiscount();
    promoDiscount.reward = 'Discount Product';      //Discount Product
    promoDiscount.unit = 'Percentage';              //Percentage, Nominal
    promoDiscount.discount1 = '10';
    promoDiscount.discount2 = '5';
    promoDiscount.nominal = '0';
    promoDiscount.rewardTypeId = rewardType._id;
    promoDiscount.rewardType = rewardType;
    
    var promoProduct = new PromoProduct();
    promoProduct.itemId = variant._id;
    promoProduct.item = variant;
    promoProduct.promoDiscount = promoDiscount;

    promo.promoProducts.push(promoProduct);
    
    return promo;
}

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var data = require("../data");
            data(db)
                .then(result => { 
                    var PromoManager = require('../../src/managers/sales/promo-manager');
                    manager = new PromoManager(db, {
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
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            validate.promoDoc(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function(done) {

    createdData.code += '[updated]';
    createdData.name += '[updated]';
    createdData.description += '[updated]'; 

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
            validate.promoDoc(data);
            data.code.should.equal(createdData.code);
            data.name.should.equal(createdData.name);
            data.description.should.equal(createdData.description); 
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
            validate.promoDoc(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#07. should error when create new data with same code', function(done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    manager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done("Should not be able to create data with same code");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('code');
                done();
            }
            catch (e) {
                done(e);
            }
        })
});

it('#08. should error with property code and name ', function(done) {
    manager.create({})
        .then(id => {
            done("Should not be error with property code and name");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('code');
                e.errors.should.have.property('name');
                done();
            }
            catch (ex) {
                done(ex);
            }
        })
});