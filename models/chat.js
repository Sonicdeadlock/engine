/**
 * Created by alexthomas on 12/11/15.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');
var userModel = require('./user');
var user = db.model('user');

var chatSchema = new schema({
    text: String,
    time: Date,
    user: {
        type: schema.Types.ObjectId,
        ref: 'user',
        field: '_id'
    },
    room: {
        type: schema.Types.ObjectId,
        ref: 'room',
        field: "_id"
    }
});


module.exports = mongoose.model('chat', chatSchema);