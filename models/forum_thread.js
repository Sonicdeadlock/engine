/**
 * Created by alexthomas on 5/5/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');
var _ = require('lodash');

var forum_threadSchema = new schema({
    title:String,
    postRequirements:[String],
    tags:[String],
    creator:{
        type:schema.Types.ObjectId,
        ref:'user',
        field:'_id',
        required:true
    },
    topic:{
        type:schema.Types.ObjectId,
        ref:'forum_topic',
        field:'_id',
        required:true
    },
    creationTime:{
        type:Date,
        default: Date.now
    },
    lastUpdateTime:{
        type:Date,
        default: Date.now
    },
    locked:{
        type:Boolean,
        default:false
    },
    pinned:{
        type:Boolean,
        default:false
    },
    views:{
        type:Number,
        default:0
    },
    history:[{
        date:{type:Date,default:Date.now},
        actor:{
            type:schema.Types.ObjectId,
            ref:'user',
            field:'_id',
            required:true
        },
        action:String
    }]
});

//TODO: make the last update time from the child posts last update time
module.exports = mongoose.model('forum_thread',forum_threadSchema);