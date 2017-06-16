var options = {
    manager: require("../../../src/managers/master/article/article-counter-manager"),
    model: require("bateeq-models").master.article.ArticleCounter,
    util: require("../../data-util/master/article/article-counter-data-util"),
    validator: require("bateeq-models").validator.master.article.articleCounter,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);