/**
 * Created by Sonicdeadlock on 4/1/2016.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var roomSchema = new schema({
    name:String,
    deletable:Boolean,
    description:String,
    password:String,
    bots:{type:[{name:String}],default:[]},
    bans:{type:[{
            type:schema.Types.ObjectId,
            ref:'user',
            field:'_id'
    }],
        default:[]}
});

module.exports = mongoose.model('room',roomSchema);
