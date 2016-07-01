'use strict'
// external deps 
var ObjectId = require('mongodb').ObjectId; 

// internal deps
require('mongodb-toolkit');
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
 

module.exports = class FinishingManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.finishingCollection = this.db.use(map.manufacture.Finishing);
    } 
}