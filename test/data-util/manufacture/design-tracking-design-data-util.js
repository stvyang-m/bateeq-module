"use strict";
const helper = require('../../helper');
const DesignTrackingDesignManager = require("../../../src/managers/manufacture/design-tracking-design-manager");
const generateCode = require("../../../src/utils/code-generator");
const designer = require("../auth/account-data-util");
const articleCategory = require("../master/article/article-category-data-util");
const articleSeason = require("../master/article/article-season-data-util");
const articleMaterialComposition = require("../master/article/article-material-composition-data-util");
const articleSubCounter = require("../master/article/article-sub-counter-data-util");
const articleMaterial = require("../master/article/article-material-data-util");

const designTrackingStage = require("./design-tracking-stage-data-util");

class DesignTrackingDesignDataUtil {
    getNewData() {
        return Promise.all([designer.getTestData(), articleCategory.getTestData(), articleSeason.getTestData(), articleMaterialComposition.getTestData(), articleSubCounter.getTestData(), articleMaterial.getTestData(), designTrackingStage.getTestData()])
            .then((results) => {
                let _designer = results[0];
                let _articleCategory = results[1];
                let _articleSeason = results[2];
                let _articleMaterialComposition = results[3];
                let _articleSubCounter = results[4];
                let _articleMaterial = results[5];
                let _designTrackingStage = results[6];

                let Model = require('bateeq-models').manufacture.DesignTrackingDesign;
                let data = new Model();

                let code = generateCode("EFR-DTD");

                data.code = code;
                data.name = `name[${code}]`;
                data.designerId = _designer._id;
                data.designer = _designer;
                data.articleCategoryId = _articleCategory._id;
                data.articleCategory = _articleCategory;
                data.articleSeasonId = _articleSeason._id;
                data.articleSeason = _articleSeason;
                data.articleMaterialCompositionId = _articleMaterialComposition._id;
                data.articleMaterialComposition = _articleMaterialComposition;
                data.articleSubCounterId = _articleSubCounter._id;
                data.articleSubCounter = _articleSubCounter;
                data.articleMaterialId = _articleMaterial._id;
                data.articleMaterial = _articleMaterial;
                data.closeDate = new Date();
                data.description = `description[${code}]`;
                data.stageId = _designTrackingStage._id;

                return Promise.resolve(data);
            });
    }

    getTestData() {
        return helper
            .getManager(DesignTrackingDesignManager)
            .then((manager) => {
                return this.getNewData().then((data) => {
                    return manager.create(data)
                        .then((id) => manager.getSingleById(id));
                });
            });
    }
}
module.exports = new DesignTrackingDesignDataUtil();
