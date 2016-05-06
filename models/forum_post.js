/**
 * Created by alexthomas on 5/5/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');
var _ = require('lodash');

var forum_postSchema = new schema({
    body:String,
    creator:{
        type:schema.Types.ObjectId,
        ref:'user',
        field:'_id',
        required:true
    },
    thread:{
        type:schema.Types.ObjectId,
        ref:'forum_thread',
        field:'_id',
        required:true
    },
    creationTime:{
        type:Date,
        default:Date.now
    },
    lastUpdateTime:{
        type:Date,
        default:Date.now
    }
});

forum_postSchema.pre('findOneAndUpdate',function(){
    this.update({},{ $set: { lastUpdateTime: new Date() } });
});

module.exports = mongoose.model('forum_post',forum_postSchema);