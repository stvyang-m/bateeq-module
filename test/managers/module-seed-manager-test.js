var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.core;
var manager;

function getData() {
    var ModuleSeed = require('bateeq-models').core.ModuleSeed;
    var moduleSeed = new ModuleSeed();

    var now = new Date();
    var year = now / 100 | 0;
    var month = now / 10000 | 0;

    moduleSeed.moduleId = '5795dfef8f58fb782f1d0fd3';
    moduleSeed.year = year;
    moduleSeed.month = month;

    return moduleSeed;
}

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var ModuleSeedManager = require('../../src/managers/core/module-seed-manager');
            manager = new ModuleSeedManager(db, {
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
    manager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            validate.moduleSeed(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function(done) {
    createdData.seed++;

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
            validate.moduleSeed(data);
            data.moduleId.toString().should.equal(createdData.moduleId.toString());
            data.year.should.equal(createdData.year);
            data.month.should.equal(createdData.month);
            data.seed.should.equal(createdData.seed);
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
            validate.moduleSeed(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#07. should error when create new data with same moduleId, year, month', function(done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    manager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done("Should not be able to create data with same  moduleId, year, month");
        })
        .catch(e => {
            e.errors.should.have.property('moduleId');
            e.errors.should.have.property('year');
            e.errors.should.have.property('month');
            done();
        });
});