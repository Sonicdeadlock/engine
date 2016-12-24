/**
 * Created by alexthomas on 1/2/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var messageSchema = new schema({
    fromUser: {
        type: schema.Types.ObjectId,
        ref: "user",
        field: '_id'
    },
    toUser: {
        type: schema.Types.ObjectId,
        ref: "user",
        field: '_id'
    },
    title: String,
    body: String,
    replyBody: String,
    read: {type: Boolean, default: false},
    fromDelete: {type: Boolean, default: false},
    toDelete: {type: Boolean, default: false},
    time: {type: Date, default: Date.now}
});

module.exports = mongoose.model('message', messageSchema);

