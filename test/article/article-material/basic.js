var options = {
    manager: require("../../../src/managers/master/article/article-material-manager"),
    model: require("bateeq-models").master.article.ArticleMaterial,
    util: require("../../data-util/master/article/article-material-data-util"),
    validator: require("bateeq-models").validator.master.article.articleMaterial,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);