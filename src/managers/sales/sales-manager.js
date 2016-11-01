'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

var Sales = BateeqModels.sales.Sales; 
var TransferOutDoc = BateeqModels.inventory.TransferOutDoc;
var generateCode = require('../../utils/code-generator');


module.exports = class SalesManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.salesCollection = this.db.use(map.sales.SalesDoc);
        
        var ItemManager = require('../master/item-manager');
        this.itemManager = new ItemManager(db, user);
        
        var StoreManager = require('../master/store-manager');
        this.storeManager = new StoreManager(db, user); 
        
        var BankManager = require('../master/bank-manager');
        this.bankManager = new BankManager(db, user);  
        
        var CardTypeManager = require('../master/card-type-manager');
        this.cardTypeManager = new CardTypeManager(db, user);  
                
        var TransferOutDocManager = require('../inventory/transfer-out-doc-manager');
        this.transferOutDocManager = new TransferOutDocManager(db, user);
        
        var InventoryManager = require('../inventory/inventory-manager');
        this.inventoryManager = new InventoryManager(db, user);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCode = {
                    'code': {
                        '$regex': regex
                    }
                }; 
                var $or = {
                    '$or': [filterCode]
                };

                query['$and'].push($or);
            }


            this.salesCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(sales => {
                    resolve(sales);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(sales => {
                    resolve(sales);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQueryOrDefault(query)
                .then(sales => {
                    resolve(sales);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByCode(code) {
        return new Promise((resolve, reject) => {
            var query = {
                code: code,
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(sales => {
                    resolve(sales);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.salesCollection
                .single(query)
                .then(sales => {
                    resolve(sales);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleByQueryOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.salesCollection
                .singleOrDefault(query)
                .then(sales => {
                    resolve(sales);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(sales) {
        return new Promise((resolve, reject) => {
            sales.code = generateCode("sales");
            this._validate(sales)
                .then(validSales => {   
                    var validTransferOutDoc = {};
                    validTransferOutDoc.code = generateCode("sales");
                    validTransferOutDoc.reference = validSales.code;
                    validTransferOutDoc.sourceId = validSales.store.storageId;
                    validTransferOutDoc.destinationId = validSales.store.storageId;
                    validTransferOutDoc.items = [];
                    for (var item of validSales.items) {
                        var newitem = {};
                        newitem.articleVariantId = item.articleVariantId;
                        newitem.quantity = item.quantity;
                        validTransferOutDoc.items.push(newitem);
                    } 
                    validTransferOutDoc = new TransferOutDoc(validTransferOutDoc);
                    
                    var createData = [];
                    createData.push(this.transferOutDocManager.create(validTransferOutDoc));
                    createData.push(this.salesCollection.insert(validSales));
                    
                    Promise.all(createData)
                        .then(results => {
                            resolve(results[1]);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(sales) {
        return new Promise((resolve, reject) => {
            this._validate(sales)
                .then(validSales => {
                    this.salesCollection.update(validSales)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    delete(sales) {
        return new Promise((resolve, reject) => {
            this._validate(sales)
                .then(validSales => {
                    validSales._deleted = true;
                    this.salesCollection.update(validSales)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
 
    _validate(sales) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new Sales(sales); 
            
            var salesDetailError = {};
            if (!valid.code || valid.code == '')
                errors["code"] = "code is required";
            if (!sales.storeId || sales.storeId == '')
                errors["storeId"] = "storeId is required"; 
            if (!sales.salesDetail.paymentType || sales.salesDetail.paymentType == '')
                salesDetailError["paymentType"] = "paymentType is required";
            
            for (var prop in salesDetailError) {
                errors["salesDetail"] = salesDetailError;
                break;
            }
                                

            //Get sales data
            var getSales = this.salesCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });  
            var getStore = this.storeManager.getSingleByIdOrDefault(sales.storeId);
            var getBank = this.bankManager.getSingleByIdOrDefault(sales.salesDetail.bankId);
            var getCardType = this.cardTypeManager.getSingleByIdOrDefault(sales.salesDetail.cardTypeId);
            var getVoucher = Promise.resolve(null);
            var getItems = [];
            if (valid.items && valid.items.length > 0) {
                for (var item of valid.items) {  
                    getItems.push(this.itemManager.getSingleByIdOrDefault(item.articleVariantId));
                }
            }
            else {
                errors["items"] = "items is required";
            }
            
            Promise.all([getSales, getStore, getBank, getCardType, getVoucher].concat(getItems))
               .then(results => {
                    var _sales = results[0];
                    var _store = results[1];
                    var _bank = results[2];
                    var _cardType = results[3];
                    var _voucherType = results[4];
                    var articleVariants = results.slice(5, results.length) 
                     
                    if (_sales) {
                        errors["code"] = "code already exists";
                    }  
                    
                    if (!_store) {
                        errors["storeId"] = "storeId not found";
                    }
                    else {
                        valid.storeId = _store._id;
                        valid.store = _store;
                    } 
                      
                    valid.totalProduct = 0;
                    valid.subTotal = 0;
                    valid.grandTotal = 0;
                    if (articleVariants.length > 0) {
                        var itemErrors = [];
                        for (var variant of articleVariants) {
                            var index = articleVariants.indexOf(variant);
                            var item = valid.items[index];
                            var itemError = {};

                            if (!item.articleVariantId || item.articleVariantId == '') {
                                itemError["articleVariantId"] = "articleVariantId is required";
                            }
                            else {
                                for (var i = valid.items.indexOf(item) + 1; i < valid.items.length; i++) {
                                    var otherItem = valid.items[i];
                                    if (item.articleVariantId == otherItem.articleVariantId) {
                                        itemError["articleVariantId"] = "articleVariantId already exists on another detail";
                                    }
                                }
                            }
                            if (!variant) {
                                itemError["articleVariantId"] = "articleVariantId not found";
                            }
                            else {
                                item.articleVariantId = variant._id;
                                item.articleVariant = variant;
                                if(variant.size)
                                    if(variant.size.name)
                                        item.size = variant.size.name;
                                item.price = parseInt(variant.domesticSale);
                            }

                            if (item.quantity == undefined || (item.quantity && item.quantity == '')) {
                                itemError["quantity"] = "quantity is required";
                                item.quantity = 0;
                            }
                            else if (parseInt(item.quantity) <= 0) {
                                itemError["quantity"] = "quantity must be greater than 0";
                            } 
                            
                            if (item.discount1 == undefined || (item.discount1 && item.discount1 == '')) {
                                itemError["discount1"] = "discount1 is required";
                                item.discount1 = 0;
                            }
                            else if (parseInt(item.discount1) < 0) {
                                itemError["discount1"] = "discount1 must be greater than 0";
                            } 
                            
                            if (item.discount2 == undefined || (item.discount2 && item.discount2 == '')) {
                                itemError["discount2"] = "discount2 is required";
                                item.discount2 = 0;
                            }
                            else if (parseInt(item.discount2) < 0) {
                                itemError["discount2"] = "discount2 must be greater than 0";
                            } 
                            
                            if (item.discountNominal == undefined || (item.discountNominal && item.discountNominal == '')) {
                                itemError["discountNominal"] = "discountNominal is required";
                                item.discountNominal = 0;
                            }
                            else if (parseInt(item.discountNominal) < 0) {
                                itemError["discountNominal"] = "discountNominal must be greater than 0";
                            } 
                            
                            if (item.margin == undefined || (item.margin && item.margin == '')) {
                                itemError["margin"] = "margin is required";
                                item.margin = 0;
                            }
                            else if (parseInt(item.margin) < 0) {
                                itemError["margin"] = "margin must be greater than 0";
                            } 
                            
                            if (item.specialDiscount == undefined || (item.specialDiscount && item.specialDiscount == '')) {
                                itemError["specialDiscount"] = "specialDiscount is required";
                                item.margin = 0;
                            }
                            else if (parseInt(item.specialDiscount) < 0) {
                                itemError["specialDiscount"] = "specialDiscount must be greater than 0";
                            } 
                            
                            item.total = 0;
                            if(parseInt(item.quantity) > 0) {
                                //Price
                                item.total = parseInt(item.quantity) * parseInt(item.price);
                                //Diskon
                                item.total = (item.total * (1 - (parseInt(item.discount1) / 100)) * (1 - (parseInt(item.discount2) / 100))) - parseInt(item.discountNominal);
                                //Spesial Diskon 
                                item.total = item.total * (1 - (parseInt(item.specialDiscount) / 100))
                                //Margin
                                item.total = item.total * (1 - (parseInt(item.margin) / 100))
                            }  
                            valid.subTotal = parseInt(valid.subTotal) + parseInt(item.total);
                            valid.totalProduct = parseInt(valid.totalProduct) + parseInt(item.quantity);
                            itemErrors.push(itemError);
                        }
                        var totalDiscount = parseInt(valid.subTotal) * parseInt(valid.discount) / 100;
                        var totalVoucher = 0;
                        valid.grandTotal = parseInt(valid.subTotal) - parseInt(totalDiscount) - parseInt(totalVoucher);
                        
                        for (var itemError of itemErrors) {
                            for (var prop in itemError) {
                                errors.items = itemErrors;
                                break;
                            }
                            if (errors.items)
                                break;
                        }
                    } 
                    
                    if (valid.salesDetail.paymentType.toLowerCase() != "card" && valid.salesDetail.paymentType.toLowerCase() != "cash" && valid.salesDetail.paymentType.toLowerCase() != "partial") {
                        salesDetailError["paymentType"] = "paymentType not valid";
                    }
                    else {                        
                        if(valid.salesDetail.paymentType.toLowerCase() == "card" || valid.salesDetail.paymentType.toLowerCase() == "partial"){
                            if (!sales.salesDetail.bankId || sales.salesDetail.bankId == '')
                                salesDetailError["bankId"] = "bankId is required";
                            if (!_bank) {
                                salesDetailError["bankId"] = "bankId not found";
                            }
                            else {
                                valid.salesDetail.bankId = _bank._id;
                                valid.salesDetail.bank = _bank;
                            } 
                            
                            if (!valid.salesDetail.card || valid.salesDetail.card == '')
                                salesDetailError["card"] = "card is required";
                            else {
                                if(valid.salesDetail.card.toLowerCase() != 'debit' && valid.salesDetail.card.toLowerCase() != 'credit')
                                    salesDetailError["card"] = "card must be debit or credit"; 
                                else { 
                                    if(valid.salesDetail.card.toLowerCase() != 'debit')
                                    {
                                        if (!sales.salesDetail.cardTypeId || sales.salesDetail.cardTypeId == '')
                                            salesDetailError["cardTypeId"] = "cardTypeId is required"; 
                                        if (!_cardType) {
                                            salesDetailError["cardTypeId"] = "cardTypeId not found";
                                        }
                                        else {
                                            valid.salesDetail.cardTypeId = _cardType._id;
                                            valid.salesDetail.cardType = _cardType;
                                        }   
                                    }
                                }
                            }
                                
                            if (!valid.salesDetail.cardNumber || valid.salesDetail.cardNumber == '')
                                salesDetailError["cardNumber"] = "cardNumber is required";
                                
                            if (!valid.salesDetail.cardName || valid.salesDetail.cardName == '')
                                salesDetailError["cardName"] = "cardName is required"; 
                                
                            if (valid.salesDetail.cardAmount == undefined || (valid.salesDetail.cardAmount && valid.salesDetail.cardAmount == '')) {
                                salesDetailError["cardAmount"] = "cardAmount is required";
                                valid.salesDetail.cardAmount = 0;
                            } 
                            else if(parseInt(valid.salesDetail.cardAmount) <= 0) {
                                salesDetailError["cardAmount"] = "cardAmount must be greater than 0";
                            }  
                        }  
                        
                        if(valid.salesDetail.paymentType.toLowerCase() == "cash" || valid.salesDetail.paymentType.toLowerCase() == "partial"){ 
                            if (valid.salesDetail.cashAmount == undefined || (valid.salesDetail.cashAmount && valid.salesDetail.cashAmount == '')) {
                                salesDetailError["cashAmount"] = "cashAmount is required";
                                valid.salesDetail.cashAmount = 0;
                            } 
                            else if(parseInt(valid.salesDetail.cashAmount) <= 0) {
                                salesDetailError["cashAmount"] = "cashAmount must be greater than 0";
                            } 
                        } 
                        
                        if(valid.salesDetail.paymentType.toLowerCase() == "partial")
                            if((parseInt(valid.salesDetail.cashAmount) + parseInt(valid.salesDetail.cardAmount)) < parseInt(valid.grandTotal))
                                errors["grandTotal"] = "grandTotal is bigger than payment";  
                                
                        if(valid.salesDetail.paymentType.toLowerCase() == "card")
                            if(parseInt(valid.salesDetail.cardAmount) < parseInt(valid.grandTotal))
                                errors["grandTotal"] = "grandTotal is bigger than payment";  
                                
                        if(valid.salesDetail.paymentType.toLowerCase() == "cash")
                            if(parseInt(valid.salesDetail.cashAmount) < parseInt(valid.grandTotal))
                                errors["grandTotal"] = "grandTotal is bigger than payment";  
                    } 
                    
                    for (var prop in salesDetailError) {
                        errors["salesDetail"] = salesDetailError;
                        break;
                    }
            
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    // valid = new Sales(valid);
                    // valid.stamp(this.user.username, 'manager');
                    // resolve(valid);

                    var getStocks = [];
                    for (var variant of articleVariants) {
                        getStocks.push(this.inventoryManager.getByStorageIdAndItemIdOrDefault(_store.storageId, variant._id));
                    } 
                    Promise.all(getStocks) 
                        .then(resultStocks => { 
                            var itemErrors = [];
                            for(var stock of resultStocks) { 
                                var index = resultStocks.indexOf(stock);
                                var item = valid.items[index];
                                var itemError = {};
                                if(stock) {
                                    if (item.quantity > stock.quantity) {
                                        itemError["quantity"] = "Quantity is bigger than Stock";
                                    } 
                                }
                                itemErrors.push(itemError);
                            }
                            for (var itemError of itemErrors) {
                                for (var prop in itemError) {
                                    errors.items = itemErrors;
                                    break;
                                }
                                if (errors.items)
                                    break;
                            }
                            for (var prop in errors) {
                                var ValidationError = require('../../validation-error');
                                reject(new ValidationError('data does not pass validation', errors));
                            }
                    
                            valid = new Sales(valid);
                            valid.stamp(this.user.username, 'manager');
                            resolve(valid);
                        })
                        .catch(e => { 
                            reject(e);
                        })
                })
                .catch(e => { 
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    } 
                    reject(e);
                })
        });
    }
};