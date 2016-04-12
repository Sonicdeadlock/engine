/**
 * Created by Sonicdeadlock on 4/1/2016.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var roomSchema = new schema({
    name:String,
    deleteable:Boolean,
    description:String,
    password:String,
    bots:[{
        name:String
    }]
});

module.exports = mongoose.model('room',roomSchema);
