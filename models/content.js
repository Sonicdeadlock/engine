/**
 * Created by Sonicdeadlock on 4/2/2016.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var contentSchema = new schema({
    type:String,
    content:String
});


module.exports = mongoose.model('content',contentSchema);