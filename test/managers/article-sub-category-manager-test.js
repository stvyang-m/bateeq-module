var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.article;
var manager;

function getData() {
    var ArticleSubCategory = require('bateeq-models').article.ArticleSubCategory;
    var articleSubCategory = new ArticleSubCategory();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    articleSubCategory.code = code;
    articleSubCategory.name = `name[${code}]`;
    articleSubCategory.description = `description for ${code}`;

    return articleSubCategory;
}

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var ArticleSubCategoryManager = require('../../src/managers/article/article-sub-category-manager');
            manager = new ArticleSubCategoryManager(db, {
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
    manager.getById(createdId)
        .then(data => {
            validate.articleSubCategory(data);
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
    manager.getById(createdId)
        .then(data => {
            validate.articleSubCategory(data);
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
    manager.getById(createdId)
        .then(data => {
            validate.articleSubCategory(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});