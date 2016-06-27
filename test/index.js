function test(name, path) {
    describe(name, function() {
        require(path);
    })
}


describe('#bateeq-module', function(done) {
    this.timeout(2 * 6000);
    test('@manager/article-category-manager', './managers/article-category-manager-test');
    test('@manager/article-motif-manager', './managers/article-motif-manager-test');
    test('@manager/article-origin-manager', './managers/article-origin-manager-test');
    test('@manager/article-season-manager', './managers/article-season-manager-test');
    test('@manager/article-style-manager', './managers/article-style-manager-test');
    test('@manager/article-sub-category-manager', './managers/article-sub-category-manager-test');
    test('@manager/article-type-manager', './managers/article-type-manager-test');
})