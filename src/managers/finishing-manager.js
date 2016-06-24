'use strict'
// external deps 
var ObjectId = require('mongodb').ObjectId; 

// internal deps
var Manager = require('mean-toolkit').Manager;
var BateeqModels = require('bateeq-models');
var map = BateeqModels.map;
 

module.exports = class FinishingManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;
        this.finishingCollection = this.db.use(map.manufacture.Finishing);
    } 
}