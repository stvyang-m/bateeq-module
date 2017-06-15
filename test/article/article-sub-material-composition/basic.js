var options = {
    manager: require("../../../src/managers/master/article/article-sub-material-composition-manager"),
    model: require("bateeq-models").master.article.ArticleSubMaterialComposition,
    util: require("../../data-util/master/article/article-sub-material-composition-data-util"),
    validator: require("bateeq-models").validator.master.article.articleSubMaterialComposition,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);