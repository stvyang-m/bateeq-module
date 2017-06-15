var options = {
    manager: require("../../../src/managers/master/article/article-motif-manager"),
    model: require("bateeq-models").master.article.ArticleMotif,
    util: require("../../data-util/master/article/article-motif-data-util"),
    validator: require("bateeq-models").validator.master.article.articleMotif,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);