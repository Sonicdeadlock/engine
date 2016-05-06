/**
 * Created by alexthomas on 5/5/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');

var forum_topicSchema = new schema({
    name:String,
    description:String,
    postRequirements:[String],
    creator:{
        type:schema.Types.ObjectId,
        ref:'user',
        field:'_id',
        required:true
    },
    parent:{
        type:schema.Types.ObjectId,
        ref:'forum_topic',
        field:'_id'
    },
    icon:String,
    iconStyle:String
});


module.exports = mongoose.model('forum_topic',forum_topicSchema);