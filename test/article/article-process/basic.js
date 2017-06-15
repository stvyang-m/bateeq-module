var options = {
    manager: require("../../../src/managers/master/article/article-process-manager"),
    model: require("bateeq-models").master.article.ArticleProcess,
    util: require("../../data-util/master/article/article-process-data-util"),
    validator: require("bateeq-models").validator.master.article.articleProcess,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);