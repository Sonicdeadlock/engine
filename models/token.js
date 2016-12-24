/**
 * Created by alexthomas on 4/14/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var tokenSchema = new schema({
    type: String,
    token: String,
    tokenData: Object
});


module.exports = mongoose.model('token', tokenSchema);