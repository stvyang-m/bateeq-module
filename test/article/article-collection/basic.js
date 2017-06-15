var options = {
    manager: require("../../../src/managers/master/article/article-collection-manager"),
    model: require("bateeq-models").master.article.ArticleCollection,
    util: require("../../data-util/master/article/article-collection-data-util"),
    validator: require("bateeq-models").validator.master.article.articleCollection,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);