var helper = require('./helper');


function getSertStorages(db) {

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



function getSertVariants(db) {

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


function getSertModules(db, storages) {

    var modules = [{
        code: "EFR-HP/FNG",
        name: "Module EFR-HP/FNG",
        description: "Unit test data: module EFR-HP/FNG",
        config: {
            source: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            },
            destination: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            }
        }
    }, {
        code: "EFR-KB/EXB",
        name: "Module EFR-KB/EXB",
        description: "Unit test data: module EFR-KB/EXB",
        config: {
            destination: {
                type: "selection",
                value: [storages["UT-ST1"]._id, storages["UT-ST2"]._id]
            }
        }
    }, {
        code: "EFR-KB/FNG",
        name: "Module EFR-KB/FNG",
        description: "Unit test data: module EFR-KB/FNG",
        config: {
            source: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            },
            destination: {
                type: "fixed",
                value: storages["UT-BJB"]._id
            }
        }
    }, {
        code: "EFR-KB/RTD",
        name: "Module EFR-KB/RTD",
        description: "Unit test data: module EFR-KB/RTD",
        config: {
            source: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            },
            destination: {
                type: "fixed",
                value: storages["UT-BJR"]._id
            }
        }
    }, {
        code: "EFR-KB/RTF",
        name: "Module EFR-KB/RTF",
        description: "Unit test data: module EFR-KB/RTF",
        config: {}
    }, {
        code: "EFR-KB/RTP",
        name: "Module EFR-KB/RTP",
        description: "Unit test data: module EFR-KB/RTP",
        config: {
            source: {
              },
            destination: {
                type: "selection",
                value: [storages["UT-BJR"]._id , storages["UT-ST2"]._id, storages["UT-ST1"]._id]
            }
        }
    }, {
        code: "EFR-KB/RTT",
        name: "Module EFR-KB/RTT",
        description: "Unit test data: module EFR-KB/RTT",
        config: {
            source: {
                type: "selection",
                value: [storages["UT-ST1"]._id, storages["UT-ST2"]._id]
            },
            destination: {
                type: "selection",
                value: [storages["UT-ST1"]._id, storages["UT-ST2"]._id]
            }
        }
    }, {
        code: "EFR-TB/ACT",
        name: "Module EFR-TB/ACT",
        description: "Unit test data: module EFR-TB/ACT",
        config: {
            destination: {
                type: "fixed",
                value: storages["UT-ACC"]._id
            }
        }
    }, {
        code: "EFR-TB/BAT",
        name: "Module EFR-TB/BAT",
        description: "Unit test data: module EFR-TB/BAT",
        config: {}
    }, {
        code: "EFR-TB/BBT",
        name: "Module EFR-TB/BBT",
        description: "Unit test data: module EFR-TB/BBT",
        config: {}
    }, {
        code: "EFR-TB/BJB",
        name: "Module EFR-TB/BJB",
        description: "Unit test data: module EFR-TB/BJB",
        config: {}
    }, {
        code: "EFR-TB/BJR",
        name: "Module EFR-TB/BJR",
        description: "Unit test data: module EFR-TB/BJR",
        config: {}
    }, {
        code: "EFR-TB/BRD",
        name: "Module EFR-TB/BRD",
        description: "Unit test data: module EFR-TB/BRD",
        config: {}
    }, {
        code: "EFR-TB/BRT",
        name: "Module EFR-TB/BRT",
        description: "Unit test data: module EFR-TB/BRT",
        config: {}
    }, {
        code: "EFR-TB/SAB",
        name: "Module EFR-TB/SAB",
        description: "Unit test data: module EFR-TB/SAB",
        config: {
            source: {
                type: "selection",
                value: [storages["UT-ACC"]._id, storages["UT-SWG"]._id, storages["UT-MHD"]._id]
            },
            destination: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            }
        }
    }, {
        code: "EFR-PK/PBA",
        name: "Module EFR-PK/PBA",
        description: "Unit test data: module EFR-PK/PBA",
        config: {
            source: {
                type: "selection",
                value: [storages["UT-ACC"]._id,  storages["UT-ST2"]._id]
            },
            destination: {
                type: "selection",
                value: [storages["UT-ST1"]._id, storages["UT-ST2"]._id]
            }
        }
    }, {
        code: "EFR-PK/PBJ",
        name: "Module EFR-PK/PBJ",
        description: "Unit test data: module EFR-PK/PBJ",
        config: {
            source: {
                type: "selection",
                value: [storages["UT-BJB"]._id, storages["UT-ST2"]._id]
            },
            destination: {
                type: "selection",
                value: [storages["UT-ST1"]._id, storages["UT-ST2"]._id]
            }
        }
    }, {
        code: "EFR-PK/PBR",
        name: "Module EFR-PK/PBR",
        description: "Unit test data: module EFR-HP/FNG",
        config: {
            source: {
                type: "selection",
                value: [storages["UT-BJR"]._id, , storages["UT-ST2"]._id]
            },
            destination: {
                type: "selection",
                value: [storages["UT-ST1"]._id, storages["UT-ST2"]._id]
            }
        }
    }, {
        code: "EFR-TB/ALT",
        name: "Module EFR-TB/ALT",
        description: "Unit test data: module EFR-TB/ALT",
        config: {
            source: {
                type: "fixed",
                value: storages["UT-SWG"]._id
            },
            destination: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            }
        }
    }, {
        code: "EFR-KB/ALT",
        name: "Module EFR-KB/ALT",
        description: "Unit test data: module EFR-KB/ALT",
        config: {
            source: {
                type: "fixed",
                value: storages["UT-FNG"]._id
            },
            destination: {
                type: "fixed",
                value: storages["UT-SWG"]._id
            }
        }
    }];

    var ModuleManager = require("../src/managers/core/module-manager");
    return new Promise((resolve, reject) => {
        var manager = new ModuleManager(db, {
            username: "unit-test"
        });
        var promises = [];

        for (var module of modules) {
            var promise = new Promise((resolve, reject) => {
                var _module = module;
                manager.getSingleOrDefaultByQuery({
                        code: _module.code
                    })
                    .then(data => {
                        if (data)
                            resolve(data);
                        else {
                            manager.create(_module)
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


function getSertSuppliers(db) {
 var suppliers = [{
        code: "UT-S01",
        name: "Finishing[UT]",
        description: "Unit test data: supplier 01."
    }];

    var SupplierManager = require("../src/managers/inventory/supplier-manager");
    return new Promise((resolve, reject) => {
        var manager = new SupplierManager(db, {
            username: "unit-test"
        });
        var promises = [];

        for (var supplier of suppliers) {
            var promise = new Promise((resolve, reject) => {
                var _supplier = supplier;
                manager.getSingleOrDefaultByQuery({
                        code: _supplier.code
                    })
                    .then(data => {
                        if (data)
                            resolve(data);
                        else {
                            manager.create(_supplier)
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
            .then(suppliers => {
                resolve(suppliers);
            })
            .catch(e => {
                reject(e);
            });
    });
}



module.exports = function(db) {
    return new Promise((resolve, reject) => {
        Promise.all([getSertStorages(db), getSertVariants(db), getSertSuppliers(db)])
            .then(results => {
                var storages = {};
                var variants = {};
                var suppliers={};

                for (var storage of results[0])
                    storages[storage.code] = storage;

                for (var variant of results[1])
                    variants[variant.code] = variant;
                
                 for (var supplier of results[2])
                    suppliers[supplier.code] = supplier;

                getSertModules(db, storages)
                    .then(results => {
                        var modules = {};
                        for (var module of results)
                            modules[module.code] = module;

                        resolve({
                            storages: storages,
                            variants: variants,
                            suppliers:suppliers,
                            modules: modules
                        });
                    })
                    .catch(e => {
                        reject(e);
                    }); 

            })
            .catch(e => {
                reject(e);
            });
    });
};

