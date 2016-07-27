function test(name, path) {
    describe(name, function () {
        require(path);
    })
}


describe('#bateeq-module', function (done) {
    this.timeout(2 * 60000);
    test('@manager/article-brand-manager', './managers/article-brand-manager-test');
    test('@manager/article-category-manager', './managers/article-category-manager-test');
    test('@manager/article-counter-manager', './managers/article-counter-manager-test');
    test('@manager/article-material-manager', './managers/article-material-manager-test');
    test('@manager/article-motif-manager', './managers/article-motif-manager-test');
    test('@manager/article-origin-manager', './managers/article-origin-manager-test');
    test('@manager/article-season-manager', './managers/article-season-manager-test');
    test('@manager/article-sub-counter-manager', './managers/article-sub-counter-manager-test');
    test('@manager/article-theme-manager', './managers/article-theme-manager-test');
    test('@manager/article-type-manager', './managers/article-type-manager-test');
    test('@manager/article-manager', './managers/article-manager-test');
    test('@manager/article-variant-manager', './managers/article-variant-manager-test'); 
    test('@manager/storage-manager', './managers/storage-manager-test');
    test('@manager/transfer-in-doc-manager', './managers/transfer-in-doc-manager-test');
    test('@manager/transfer-out-doc-manager', './managers/transfer-out-doc-manager-test');
    test('@manager/inventory-manager', './managers/inventory-manager-test');
    test('@manager/module-manager', './managers/module-manager-test');
    test('@manager/acc-out-fin-manager', './managers/acc-out-fin-manager-test');
    test('@manager/fin-in-acc-manager', './managers/fin-in-acc-manager-test');
    test('@manager/fin-out-pus-manager', './managers/fin-out-pus-manager-test');
    test('@manager/pus-in-fin-manager', './managers/pus-in-fin-manager-test'); 
    test('@manager/fin-in-pus-manager', './managers/fin-in-pus-manager-test');
    test('@manager/pus-out-fin-manager', './managers/pus-out-fin-manager-test');
    test('@manager/acc-in-fin-manager', './managers/acc-in-fin-manager-test');
    test('@manager/fin-out-acc-manager', './managers/fin-out-acc-manager-test');

})