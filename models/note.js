/**
 * Created by alexthomas on 9/21/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var noteSchema = new schema({
    owner: {
        type: schema.Types.ObjectId,
        ref: 'user',
        field: '_id',
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    body: {
        type: String,
        default: ""
    },
    parent: {
        type: schema.Types.ObjectId,
        ref: 'note_dir',
        field: '_id',
        required: true
    },
    lastUpdateTime: {
        type: Date,
        required: true
    },
    createTime: {
        type: Date,
        required: true
    },
    sharedEditable: {
        type: Boolean,
        default: false
    },
    private: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('note', noteSchema);