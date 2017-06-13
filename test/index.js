function test(name, path) {
    describe(name, function () {
        require(path);
    })
}


describe('#bateeq-module', function (done) {
    this.timeout(10000 * 60000);
    //auth
    test('@auth/account-manager', './auth/account-manager-test');
    test('@auth/role-manager', './auth/role-manager-test');

    //master 
    test('@manager/master/item-manager', './managers/master/item-manager-test');
    test('@manager/master/material-manager', './managers/master/material-manager-test');
    test('@manager/master/finished-goods-manager', './managers/master/finished-goods-manager-test');
    test('@manager/storage-manager', './managers/storage-manager-test');
    test('@manager/store-manager', './managers/store-manager-test');
    test('@manager/supplier-manager', './managers/supplier-manager-test');
    test('@manager/inventory-manager', './managers/inventory-manager-test');
    test('@manager/module-manager', './managers/module-manager-test');
    test('@manager/bank-manager', './managers/bank-manager-test');
    test('@manager/card-type-manager', './managers/card-type-manager-test');
    test('@manager/promo-manager', './managers/promo-manager-test');

    //transaction
    test('@manager/transfer-in-doc-manager', './managers/transfer-in-doc-manager-test');
    test('@manager/transfer-in-store-business', './business/store/transfer-in-store-business-test');
    test('@manager/transfer-out-doc-manager', './managers/transfer-out-doc-manager-test');
    test('@manager/transfer-in-doc-ext-manager', './managers/transfer-in-doc-ext-manager-test');
    test('@manager/efr-tb-bjr-manager', './managers/efr-tb-bjr-manager-test');
    test('@manager/efr-tb-brd-manager', './managers/efr-tb-brd-manager-test');
    test('@manager/efr-tb-brt-manager', './managers/efr-tb-brt-manager-test'); 
    test('@manager/sales-manager', './managers/sales-manager-test');
    test('@manager/sales-return-manager', './managers/sales-return-manager-test');

    //inventory

    test('@manager/adjustment-manager', './managers/inventory/adjustment');

})