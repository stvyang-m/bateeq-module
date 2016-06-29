module.exports = {
    article: {
        ArticleCategoryManager: require('./src/managers/article/article-category-manager'),
        ArticleManager: require('./src/managers/article/article-manager'),
        ArticleMotifManager: require('./src/managers/article/article-motif-manager'),
        ArticleOriginManager: require('./src/managers/article/article-origin-manager'),
        ArticleSeasonManager: require('./src/managers/article/article-season-manager'),
        ArticleStyleManager: require('./src/managers/article/article-style-manager'),
        ArticleSubCategoryManager: require('./src/managers/article/article-sub-category-manager'),
        ArticleTypeManager: require('./src/managers/article/article-type-manager'),
        ArticleVariantManager: require('./src/managers/article/article-variant-manager')
    },
    inventory: {
        StorageManager: require('./src/managers/inventory/storage-manager')
    }
}