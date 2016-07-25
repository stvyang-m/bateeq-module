function test(name, path) {
    describe(name, function() {
        require(path);
    })
}


describe('#bateeq-module', function(done) {
    this.timeout(2 * 6000);
    // test('@manager/article-brand-manager', './managers/article-brand-manager-test');
    // test('@manager/article-category-manager', './managers/article-category-manager-test');
    // test('@manager/article-counter-manager', './managers/article-counter-manager-test');
    // test('@manager/article-material-manager', './managers/article-material-manager-test');
    // test('@manager/article-motif-manager', './managers/article-motif-manager-test');
    // test('@manager/article-origin-manager', './managers/article-origin-manager-test');
    // test('@manager/article-season-manager', './managers/article-season-manager-test');
    // test('@manager/article-sub-counter-manager', './managers/article-sub-counter-manager-test');
    // test('@manager/article-theme-manager', './managers/article-theme-manager-test');
    // test('@manager/article-type-manager', './managers/article-type-manager-test');
    // test('@manager/article-manager', './managers/article-manager-test');
    // test('@manager/article-variant-manager', './managers/article-variant-manager-test');
    // test('@manager/storage-manager', './managers/storage-manager-test');
    // test('@manager/transfer-in-doc-manager', './managers/transfer-in-doc-manager-test');
    // test('@manager/transfer-out-doc-manager', './managers/transfer-out-doc-manager-test');
    //  test('@manager/inventory-manager', './managers/inventory-manager-test');

    // test('@manager/accessories-transferout-finishing-manager', './managers/accessories-transferout-finishing-manager-test');
     test('@manager/finishing-transferin-accessories-manager', './managers/finishing-transferin-accessories-manager-test');

})