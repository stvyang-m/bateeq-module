'use strict'
// external deps 
var ObjectId = require('mongodb').ObjectId; 

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;

 
module.exports = class InventoryManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.inventoryCollection = this.db.use(map.inventory.Inventory);
        this.inventoryMovementCollection = this.db.use(map.inventory.InventoryMovement);
        this.stockOutCollection = this.db.use(map.inventory.StockOut);
        this.stockInCollection = this.db.use(map.inventory.StockIn);
        this.storageCollection = this.db.use(map.inventory.Storage);
    } 
}