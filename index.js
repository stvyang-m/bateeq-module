var inventoryMap = new Map();
inventoryMap.set("storage", require('./src/managers/inventory/storage-manager'));
inventoryMap.set("transfer-in-doc", require('./src/managers/inventory/transfer-in-doc-manager'));
inventoryMap.set("transfer-out-doc", require('./src/managers/inventory/transfer-out-doc-manager'));
inventoryMap.set("inventory", require('./src/managers/inventory/inventory-manager'));
inventoryMap.set("inventory-movement", require('./src/managers/inventory/inventory-movement-manager'));

inventoryMap.set("efr-kb-rtt", require('./src/managers/inventory/efr-kb-rtt-manager'));
inventoryMap.set("efr-kb-fng", require('./src/managers/inventory/efr-kb-fng-manager'));
inventoryMap.set("efr-kb-rtf", require('./src/managers/inventory/efr-kb-rtf-manager'));
inventoryMap.set("efr-kb-rtp", require('./src/managers/inventory/efr-kb-rtp-manager'));
inventoryMap.set("efr-kb-rtd", require('./src/managers/inventory/efr-kb-rtd-manager'));
inventoryMap.set("efr-kb-exb", require('./src/managers/inventory/efr-kb-exb-manager'));  
inventoryMap.set("efr-tb-acc", require('./src/managers/inventory/efr-tb-acc-manager'));
inventoryMap.set("efr-tb-bat", require('./src/managers/inventory/efr-tb-bat-manager'));
inventoryMap.set("efr-tb-bbt", require('./src/managers/inventory/efr-tb-bbt-manager')); 
inventoryMap.set("efr-tb-bjb", require('./src/managers/inventory/efr-tb-bjb-manager'));
inventoryMap.set("efr-tb-bjr", require('./src/managers/inventory/efr-tb-bjr-manager'));
inventoryMap.set("efr-tb-brd", require('./src/managers/inventory/efr-tb-brd-manager'));
inventoryMap.set("efr-tb-brt", require('./src/managers/inventory/efr-tb-brt-manager')); 
inventoryMap.set("efr-tb-sab", require('./src/managers/inventory/efr-tb-sab-manager'));
inventoryMap.set("efr-hp-fng", require('./src/managers/inventory/efr-hp-fng-manager'));
inventoryMap.set("supplier", require('./src/managers/inventory/supplier-manager'));

var merchandiserMap = new Map();

merchandiserMap.set("efr-pk", require('./src/managers/merchandiser/efr-pk-manager'));
merchandiserMap.set("efr-pk-pbj", require('./src/managers/merchandiser/efr-pk-pbj-manager'));
merchandiserMap.set("efr-pk-pbr", require('./src/managers/merchandiser/efr-pk-pbr-manager'));
merchandiserMap.set("efr-pk-pba", require('./src/managers/merchandiser/efr-pk-pba-manager'));

module.exports = {
    inventory: {
        StorageManager: inventoryMap.get("storage"),
        TransferInDocManager: inventoryMap.get("transfer-in-doc"),
        TransferOutDocManager: inventoryMap.get("transfer-out-doc"),
        InventoryManager: inventoryMap.get("inventory"),
        InventoryMovementManager: inventoryMap.get("inventory-movement"),
        FinishedGoodsManager: inventoryMap.get("efr-hp-fng"),
        ExpeditionsManager: inventoryMap.get("efr-kb-exb"),
        TokoTransferStokManager: inventoryMap.get("efr-kb-rtt"),
        FinishingKirimBarangBaruManager:inventoryMap.get("efr-kb-fng"),
        PusatReturTokoKirimBarangReturManager:inventoryMap.get("efr-kb-rtf"),
        TokoKirimBarangReturnManager:inventoryMap.get("efr-kb-rtp"),
        FinishingKirimBarangReturSelesaiPerbaikanManager: inventoryMap.get("efr-kb-rtd"),
        FinishingTerimaAksesorisManager: inventoryMap.get("efr-tb-acc"),
        TokoTerimaAksesorisManager: inventoryMap.get("efr-tb-bat"),
        TokoTerimaBarangBaruManager: inventoryMap.get("efr-tb-bbt"),
        PusatBarangBaruTerimaBarangBaruManager: inventoryMap.get("efr-tb-bjb"),
        FinishingTerimaBarangReturManager: inventoryMap.get("efr-tb-bjr"),
        PusatReturTokoTerimaBarangReturSelesaiPerbaikanManager: inventoryMap.get("efr-tb-brd"),
        PusatReturTokoTerimaBarangReturManager: inventoryMap.get("efr-tb-brt"), 
        FinishingTerimaKomponenManager: inventoryMap.get("efr-tb-sab"),
        SupplierManager: inventoryMap.get("supplier"), 
        map: inventoryMap
    },
    core: {
        article: {
            ArticleBrandManager: require('./src/managers/core/article/article-brand-manager'),
            ArticleCategoryManager: require('./src/managers/core/article/article-category-manager'),
            ArticleCounterManager: require('./src/managers/core/article/article-counter-manager'),
            ArticleMaterialManager: require('./src/managers/core/article/article-material-manager'),
            ArticleManager: require('./src/managers/core/article/article-manager'),
            ArticleMotifManager: require('./src/managers/core/article/article-motif-manager'),
            ArticleOriginManager: require('./src/managers/core/article/article-origin-manager'),
            ArticleSeasonManager: require('./src/managers/core/article/article-season-manager'),
            ArticleSubCounterManager: require('./src/managers/core/article/article-sub-counter-manager'),
            ArticleThemeManager: require('./src/managers/core/article/article-theme-manager'),
            ArticleTypeManager: require('./src/managers/core/article/article-type-manager'),
            ArticleVariantManager: require('./src/managers/core/article/article-variant-manager')
        },
        AccountManager: require('./src/managers/core/account-manager'),
        ModuleManager: require('./src/managers/core/module-manager')
    },
    merchandiser: {
        SPKManager: require('./src/managers/merchandiser/efr-pk-manager'),
        SPKBarangJadiManager: require('./src/managers/merchandiser/efr-pk-pbj-manager'),
        SPKBarangEmbalaseManager: require('./src/managers/merchandiser/efr-pk-pba-manager'),
        SPKBarangJadiReturManager: require('./src/managers/merchandiser/efr-pk-pbr-manager'),
        map: merchandiserMap
    },
    ValidationError: require('./src/validation-error')
}