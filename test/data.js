var helper = require('./helper');


function getSertStorage(db) {

    var storages = [{
        code: "UT-FNG",
        name: "Finishing[UT]",
        description: "Unit test data: finishing storage."
    }, {
        code: "UT-BJB",
        name: "Pusat - Finished Goods[UT]",
        description: "Unit test data: finished goods storage."
    }, {
        code: "UT-BJR",
        name: "Pusat - Return Finished Goods[UT]",
        description: "Unit test data: returned finished goods storage."
    }, {
        code: "UT-ACC",
        name: "Accessories[UT]",
        description: "Unit test data: accessories storage."
    }, {
        code: "UT-SWG",
        name: "Sewing[UT]",
        description: "Unit test data: sewing storage."
    }, {
        code: "UT-MHD",
        name: "Merchandiser[UT]",
        description: "Unit test data: merhandiser storage."
    }, {
        code: "UT-ST1",
        name: "Store 01[UT]",
        description: "Unit test data: store 01 storage"
    }, {
        code: "UT-ST2",
        name: "Store 02[UT]",
        description: "Unit test data: store 02 storage"
    }];


    var StorageManager = require("../src/managers/inventory/storage-manager");
    return new Promise((resolve, reject) => {
        var manager = new StorageManager(db, {
            username: "unit-test"
        });
        var promises = [];

        for (var storage of storages) {
            var promise = new Promise((resolve, reject) => { 
                var _storage = storage;
                manager.getSingleOrDefaultByQuery({
                        code: _storage.code
                    })
                    .then(data => {
                        if (data)
                            resolve(data);
                        else {
                            manager.create(_storage)
                                .then(id => {
                                    manager.getById(id).then(createdData => {
                                        resolve(createdData);
                                    });
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        }
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
            promises.push(promise);
        }

        Promise.all(promises)
            .then(storages => {
                resolve(storages);
            })
            .catch(e => {
                reject(e);
            });
    });
}



function getSertVariant(db) {

    var variants = [{
        code: "UT-AV1",
        name: "Silhouette S[UT]",
        description: "Unit test data: article silhoutte [S]",
        size: "S"
    }, {
        code: "UT-AV2",
        name: "Dress Tumaruntum S[UT]",
        description: "Unit test data: article dress tumaruntum [S]",
        size: "S"
    }];

    var VariantManager = require("../src/managers/core/article/article-variant-manager");
    return new Promise((resolve, reject) => {
        var manager = new VariantManager(db, {
            username: "unit-test"
        });
        var promises = [];

        for (var variant of variants) {
            var promise = new Promise((resolve, reject) => {
                var _variant = variant;
                manager.getSingleOrDefaultByQuery({
                        code: _variant.code
                    })
                    .then(data => {
                        if (data)
                            resolve(data);
                        else {
                            manager.create(_variant)
                                .then(id => {
                                    manager.getById(id).then(createdData => {
                                        resolve(createdData);
                                    });
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        }
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
            promises.push(promise);
        }

        Promise.all(promises)
            .then(variants => {
                resolve(variants);
            })
            .catch(e => {
                reject(e);
            });
    });
}


module.exports = function(db) {
    return new Promise((resolve, reject) => {
        Promise.all([getSertStorage(db), getSertVariant(db)])
            .then(results => {
                var storages = {};
                var variants = {};

                for (var storage of results[0])
                    storages[storage.code] = storage;

                for (var variant of results[1])
                    variants[variant.code] = variant;

                resolve({
                    storages: storages,
                    variants: variants
                });
            })
            .catch(e => {
                reject(e);
            });
    });
};