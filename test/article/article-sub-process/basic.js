var options = {
    manager: require("../../../src/managers/master/article/article-sub-process-manager"),
    model: require("bateeq-models").master.article.ArticleSubProcess,
    util: require("../../data-util/master/article/article-sub-process-data-util"),
    validator: require("bateeq-models").validator.master.article.articleSubProcess,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);