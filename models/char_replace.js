/**
 * Created by alexthomas on 3/26/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var character_replacementSchema = new schema({
    character: String,
    replacements: [String]
});


module.exports = mongoose.model('character_replacements', character_replacementSchema);
