function test(name, path) {
    describe(name, function () {
        require(path);
    })
}


describe('#bateeq-module', function (done) {
    this.timeout(10000 * 60000);
    //auth
    test('@auth/account-manager',                       './auth/account-manager-test');
    test('@auth/role-manager',                          './auth/role-manager-test');

    //master 
    test('@manager/master/item-manager',                './managers/master/item-manager-test');
    test('@manager/master/material-manager',            './managers/master/material-manager-test');
    test('@manager/master/finished-goods-manager',      './managers/master/finished-goods-manager-test');
    test('@manager/storage-manager',                    './managers/storage-manager-test');
    test('@manager/store-manager',                      './managers/store-manager-test');
    test('@manager/supplier-manager',                   './managers/supplier-manager-test');
    test('@manager/inventory-manager',                  './managers/inventory-manager-test');
    test('@manager/module-manager',                     './managers/module-manager-test');
    test('@manager/bank-manager',                       './managers/bank-manager-test');
    test('@manager/card-type-manager',                  './managers/card-type-manager-test');
    test('@manager/promo-manager',                      './managers/promo-manager-test');
    test('@manager/range-disc-product-manager',         './managers/range-disc-product-test');

    test('@ARTICLE/ARTICLE-MOTIF',                      './article/article-motif');
    test('@ARTICLE/ARTICLE-COUNTER',                    './article/article-counter');
    test('@ARTICLE/ARTICLE-SUB-COUNTER',                './article/article-sub-counter');
    test('@ARTICLE/ARTICLE-SEASON',                     './article/article-season');
    test('@ARTICLE/ARTICLE-COLLECTION',                 './article/article-collection');
    test('@ARTICLE/ARTICLE-SUB-COLLECTION',             './article/article-sub-collection');
    test('@ARTICLE/ARTICLE-MATERIAL',                   './article/article-material');
    test('@ARTICLE/ARTICLE-MATERIAL-COMPOSITION',       './article/article-material-composition');
    test('@ARTICLE/ARTICLE-SUB-MATERIAL-COMPOSITION',   './article/article-material-composition');
    test('@ARTICLE/ARTICLE-PROCESS',                    './article/article-process');
    test('@ARTICLE/ARTICLE-SUB-PROCESS',                './article/article-sub-process');
    test('@ARTICLE/ARTICLE-CATEGORY',                   './article/article-category');

    //transaction
    test('@manager/transfer-in-doc-manager',            './managers/transfer-in-doc-manager-test');
    test('@manager/transfer-in-store-business',         './business/store/transfer-in-store-business-test');
    test('@manager/transfer-out-doc-manager',           './managers/transfer-out-doc-manager-test');
    test('@manager/transfer-in-doc-ext-manager',        './managers/transfer-in-doc-ext-manager-test');
    test('@manager/efr-tb-bjr-manager',                 './managers/efr-tb-bjr-manager-test');
    test('@manager/efr-tb-brd-manager',                 './managers/efr-tb-brd-manager-test');
    test('@manager/efr-tb-brt-manager',                 './managers/efr-tb-brt-manager-test'); 
    test('@manager/sales-manager',                      './managers/sales-manager-test');
    test('@manager/sales-return-manager',               './managers/sales-return-manager-test');
    test('@manager/adjustment-manager',                 './managers/inventory/adjustment');
    test('@manager/stock-opname-manager',               './managers/inventory/stock-opname');

    //inventory
    // test('@managers/inventory/report-manager',                       './managers/inventory/report-manager');
})