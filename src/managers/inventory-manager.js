'use strict'
// external deps 
var ObjectId = require('mongodb').ObjectId; 

// internal deps
var Manager = require('mean-toolkit').Manager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

 
module.exports = class InventoryManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.inventoryCollection = this.db.use(map.inventory.Inventory);
        this.inventoryMovementCollection = this.db.use(map.inventory.InventoryMovement);
        this.stockOutCollection = this.db.use(map.inventory.StockOut);
        this.stockInCollection = this.db.use(map.inventory.StockIn);
        this.storageCollection = this.db.use(map.inventory.Storage);
    } 
}