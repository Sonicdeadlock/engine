/**
 * Created by Sonicdeadlock on 4/2/2016.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var update_notesSchema = new schema({
    content: String,
    title: String,
    release_time: Date,
    user: {
        type: schema.Types.ObjectId,
        ref: 'user',
        field: '_id'
    }
});


module.exports = mongoose.model('update_notes', update_notesSchema);