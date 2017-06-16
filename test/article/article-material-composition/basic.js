var options = {
    manager: require("../../../src/managers/master/article/article-material-composition-manager"),
    model: require("bateeq-models").master.article.ArticleMaterialComposition,
    util: require("../../data-util/master/article/article-material-composition-data-util"),
    validator: require("bateeq-models").validator.master.article.articleMaterialComposition,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);