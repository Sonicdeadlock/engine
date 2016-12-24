var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var appenderSchema = new schema({
    name: String,
    description: String,
    owner: {
        type: schema.Types.ObjectId,
        ref: "user",
        field: '_id'
    },
    note: {
        type: schema.Types.ObjectId,
        ref: 'note',
        field: '_id'
    },
    appendString: String,
    buttonStyle: String
});

module.exports = mongoose.model('appender', appenderSchema);