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
var variantArticleId = '578855c4964302281454fa51';

var createdId;
it('#01. should success when move-in new data', function(done) {

    manager.in(storageId, 'unit-test', variantArticleId, 10, 'remark-unit-test')
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});