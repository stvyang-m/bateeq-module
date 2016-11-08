var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.sales;
var manager;
var testData;

function getDataDiscountItem() {
    var variant = testData.finishedGoods["UT-FG2"];
    var stores = [];
    stores.push(testData.stores["ST-FNG"]);
    stores.push(testData.stores["ST-BJB"]);
    stores.push(testData.stores["ST-BJR"]);

    var Promo = require('bateeq-models').sales.Promo;
    var PromoCriteria = require('bateeq-models').sales.PromoCriteria;
    var PromoReward = require('bateeq-models').sales.PromoReward;
    var PromoCriteriaSelectedProduct = require('bateeq-models').sales.PromoCriteriaSelectedProduct;
    var PromoRewardDiscountProduct = require('bateeq-models').sales.PromoRewardDiscountProduct;
    
    var promo = new Promo();
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    promo.code = code;
    promo.name = 'Discount Item';
    promo.description = `description for ${code}`; 
    promo.validDateFrom = new Date(); 
    promo.validDateTo = new Date(); 
    promo.stores = stores;
    promo.criteria = {};
    promo.reward = {};
     
    var promoCriteria = new PromoCriteria();
    promoCriteria.type = 'selected-product';
    promoCriteria.criterions = [];
    
    var promoCriteriaSelectedProduct = new PromoCriteriaSelectedProduct();
    promoCriteriaSelectedProduct.itemId = variant._id;
    promoCriteriaSelectedProduct.item = variant;
    promoCriteriaSelectedProduct.minimumQuantity = 0;
    promoCriteria.criterions.push(promoCriteriaSelectedProduct);
    
    var promoReward = new PromoReward();
    promoReward.type = 'discount-product';
    promoReward.rewards = [];
    
    var promoRewardDiscountProduct = new PromoRewardDiscountProduct();
    promoRewardDiscountProduct.unit = 'percentage';
    promoRewardDiscountProduct.discount1 = '10';
    promoRewardDiscountProduct.discount2 = '5';
    promoRewardDiscountProduct.nominal = '0';
    promoReward.rewards.push(promoRewardDiscountProduct);

    promo.criteria = promoCriteria;
    promo.reward = promoReward;
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
var createdData;
it('#01. [Discount Item] should success when create new data', function(done) {
    var data = getDataDiscountItem();
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

it(`#02. [Discount Item] should success when get created data with id`, function(done) {
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            validate.promo(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. [Discount Item] should success when update created data`, function(done) {

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

it(`#04. [Discount Item] should success when get updated data with id`, function(done) {
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            validate.promo(data);
            data.code.should.equal(createdData.code);
            data.name.should.equal(createdData.name);
            data.description.should.equal(createdData.description); 
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. [Discount Item] should success when delete data`, function(done) {
    manager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. [Discount Item] should _deleted=true`, function(done) {
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            validate.promo(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#07. [Discount Item] should error when create new data with same code', function(done) {
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

it('#08. [Discount Item] should error with property code and name ', function(done) {
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