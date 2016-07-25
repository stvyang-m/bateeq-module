module.exports = {
    article: {
        ArticleBrandManager: require('./src/managers/article/article-brand-manager'),
        ArticleCategoryManager: require('./src/managers/article/article-category-manager'),
        ArticleCounterManager: require('./src/managers/article/article-counter-manager'),
        ArticleMaterialManager: require('./src/managers/article/article-material-manager'),
        ArticleManager: require('./src/managers/article/article-manager'),
        ArticleMotifManager: require('./src/managers/article/article-motif-manager'),
        ArticleOriginManager: require('./src/managers/article/article-origin-manager'),
        ArticleSeasonManager: require('./src/managers/article/article-season-manager'),
        ArticleSubCounterManager: require('./src/managers/article/article-sub-counter-manager'),
        ArticleThemeManager: require('./src/managers/article/article-theme-manager'),
        ArticleTypeManager: require('./src/managers/article/article-type-manager'),
        ArticleVariantManager: require('./src/managers/article/article-variant-manager')
    },
    inventory: {
        StorageManager: require('./src/managers/inventory/storage-manager'),
        TransferInDocManager: require('./src/managers/inventory/transfer-in-doc-manager'),
        TransferOutDocManager: require('./src/managers/inventory/transfer-out-doc-manager'),
        InventoryManager: require('./src/managers/inventory/inventory-manager'),
        InventoryMovementManager: require('./src/managers/inventory/inventory-movement-manager'),
        AccessoryTransferOutFinishingManager: require('./src/managers/inventory/accessories-transferout-finishing-manager'),
        FinishingTransferInAccessoryManager: require('./src/managers/inventory/finishing-transferin-accessories-manager')
    },
    ValidationError : require('./src/validation-error')
}