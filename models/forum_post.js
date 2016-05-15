/**
 * Created by alexthomas on 5/5/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');
var _ = require('lodash');
var forum_thread_model = require('./forum_thread');

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
    replyTo:{
        type:schema.Types.ObjectId,
        ref:'forum_post',
        field:'_id'
    },
    replies:[{
        type:schema.Types.ObjectId,
        ref:'forum_post',
        field:'_id'
    }],
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
    if(!(this._update.$push && this._update.$push.replies))
        this.update({},{ $set: { lastUpdateTime: new Date() } });

});

forum_postSchema.post('findOneAndUpdate',function(){
    forum_thread_model.findByIdAndUpdate(this.thread,{ $set: { lastUpdateTime: new Date() } }).then();
});

forum_postSchema.post('save',function(){
    forum_thread_model.findByIdAndUpdate(this.thread,{$set:{lastUpdateTime:new Date()}}).then();
});

forum_postSchema
    .pre('findOne', populateCreator)
    .pre('find', populateCreator);

function populateCreator(next){
    this.populate('creator');
    next();
}
module.exports = mongoose.model('forum_post',forum_postSchema);