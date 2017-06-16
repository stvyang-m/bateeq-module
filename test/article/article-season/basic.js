var options = {
    manager: require("../../../src/managers/master/article/article-season-manager"),
    model: require("bateeq-models").master.article.ArticleSeason,
    util: require("../../data-util/master/article/article-season-data-util"),
    validator: require("bateeq-models").validator.master.article.articleSeason,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);