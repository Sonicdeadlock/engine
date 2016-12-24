/**
 * Created by alexthomas on 9/21/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var note_dirSchema = new schema({
    owner: {
        type: schema.Types.ObjectId,
        ref: 'user',
        field: '_id'
    },
    name: String,
    parent: {
        type: schema.Types.ObjectId,
        ref: 'note_dir',
        field: '_id'
    }
});


module.exports = mongoose.model('note_dir', note_dirSchema);