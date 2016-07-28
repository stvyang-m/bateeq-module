var inventoryMap = new Map();
inventoryMap.set("storage", require('./src/managers/inventory/storage-manager'));
inventoryMap.set("transfer-in-doc", require('./src/managers/inventory/transfer-in-doc-manager'));
inventoryMap.set("transfer-out-doc", require('./src/managers/inventory/transfer-out-doc-manager'));
inventoryMap.set("inventory", require('./src/managers/inventory/inventory-manager'));
inventoryMap.set("inventory-movement", require('./src/managers/inventory/inventory-movement-manager')); 
inventoryMap.set("efr-kb-rtt", require('./src/managers/inventory/efr-kb-rtt-manager')); 
inventoryMap.set("efr-tb-acc", require('./src/managers/inventory/efr-tb-acc-manager')); 
inventoryMap.set("efr-kb-fng", require('./src/managers/inventory/efr-kb-fng-manager'));
inventoryMap.set("efr-tb-bjb", require('./src/managers/inventory/efr-tb-bjb-manager'));
inventoryMap.set("efr-tb-bcd", require('./src/managers/inventory/efr-tb-bcd-manager'));
inventoryMap.set("efr-kb-rtf", require('./src/managers/inventory/efr-kb-rtf-manager'));
inventoryMap.set("efr-tb-swg", require('./src/managers/inventory/efr-tb-swg-manager')); 
inventoryMap.set("efr-kb-rtp", require('./src/managers/inventory/efr-kb-rtp-manager')); 


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
        StorageManager: inventoryMap.get("storage"),
        TransferInDocManager: inventoryMap.get("transfer-in-doc"),
        TransferOutDocManager: inventoryMap.get("transfer-out-doc"),
        InventoryManager: inventoryMap.get("inventory"),
        InventoryMovementManager: inventoryMap.get("inventory-movement"),
        AccessoryTransferOutFinishingManager: inventoryMap.get("acc-out-fin"),
        FinishingTransferInAccessoryManager: inventoryMap.get("fin-in-acc"),
        FinishingTransferOutDocPusatManager: inventoryMap.get("fin-out-pus"),
        PusatTransferInDocFinishingManager: inventoryMap.get("pus-in-fin"),
        map: inventoryMap
    },
    core: {
        ModuleManager: require('./src/managers/core/module-manager')
    },
    ValidationError: require('./src/validation-error')
}