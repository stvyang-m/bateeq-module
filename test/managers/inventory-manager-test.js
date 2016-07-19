var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.inventory;
var manager;

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var InventoryManager = require('../../src/managers/inventory/inventory-manager');
            manager = new InventoryManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var storageId = '57738435e8a64fc532cd5bf1';
var articleVariantId = '578855c4964302281454fa51';

var createdInId;
it('#01. should success when move-in new data', function(done) {

    manager.in(storageId, 'unit-test', articleVariantId, 10, 'remark-unit-test')
        .then(id => {
            id.should.be.Object();
            createdInId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdOutId;
it('#02. should success when move-out new data', function(done) {

    manager.out(storageId, 'unit-test', articleVariantId, 10, 'remark-unit-test')
        .then(id => {
            id.should.be.Object();
            createdOutId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#03. should success when read by storageId', function(done) {
    manager.readByStorageId(storageId)
        .then(inventories => {
            inventories.should.not.equal(null);
            inventories.should.instanceof(Array);

            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#04. should success when read by storageId and articleVariantId', function(done) {
    manager.getByStorageIdAndArticleVarianId(storageId, articleVariantId)
        .then(inventory => {
            validate.inventory(inventory)
            done();
        })
        .catch(e => {
            done(e);
        })
});