/**
 * Created by alexthomas on 5/5/16.
 */
var db = require('../db');
var _ = require('lodash');
require('../models/forum_post');
var forum_post_model = db.model('forum_post');
require('../models/forum_thread');
var forum_thread_model = db.model('forum_thread');
require('../models/forum_topic');
var forum_topic_model = db.model('forum_topic');
var userModel = require('../models/user');
var user = db.model('user');
var permissionGroupModel = require('../models/permissionGroup');
var permissionGroup = db.model('permissionGroup');
var messageModel = require('../models/message');
var message = db.model('message')

function createTopic(topic){
    return (new forum_topic_model(topic)).save();
}
function createThread(thread){
    if(_.isString(thread.tags))
        thread.tags = thread.tags.split(' ');
    return (new forum_thread_model(thread)).save();
}
function createPost(post,user){
    return forum_thread_model.findById(post.thread)
        .then(function(thread){
            if(thread.locked && !user.hasPermission('Forum Admin'))
            throw 'Thread is locked';
            else{
                var threadCreator = thread.creator;
                var postCreator = post.creator;
                if(!postCreator.id === threadCreator.id)
                user.findById(postCreator,'username').then(function(postCreator){
                    (new message({title:postCreator.username+' repied to your thread: '+thread.title,body:post.body,toUser:threadCreator,fromDelete:true})).save();
                });

                return (new forum_post_model(post)).save();
            }
        });
}

function getRootTopics(){
    return forum_topic_model.find({parent:{$exists:false}}).sort('name');
}

function lockThread(threadID){
    return forum_thread_model.findByIdAndUpdate(threadID,{locked:true});
}

function unlockThread(threadID){
    return forum_thread_model.findByIdAndUpdate(threadID,{locked:false});
}

function getTopicChildren(topicId,limit,skip){
    var getTopicsQuery = forum_topic_model.find({parent:topicId});
    getTopicsQuery = getTopicsQuery.then(function(results){
       var promises = _.map(results,function(topic){
           var findThreadCountPromise = forum_thread_model.find({topic:topic._id}).count();
           var findTopicCountPromise = forum_topic_model.find({parent:topic._id}).count();
           return Promise.all([findThreadCountPromise,findTopicCountPromise])
               .then(function(results){
                   topic = JSON.parse(JSON.stringify(topic));
                   topic.threadCount = results[0];
                   topic.topicCount = results[1];
                   return topic;
               })
       });
        return Promise.all(promises);
    });
    var getThreadsQuery = forum_thread_model.find({topic:topicId});//TODO:order by pinned then by creation date
    getThreadsQuery.sort('-pinned -creationTime');
    if(limit)
    getThreadsQuery.limit(limit);
    if(skip)
    getThreadsQuery.skip(skip);
    getThreadsQuery.populate('creator','username group');
    getThreadsQuery = getThreadsQuery.then(function(results){
        return user.populate(results,{
            path:'creator.group',
            select:'name',
            model:permissionGroup
        })
    }).then(function(threads){
        var promises = _.map(threads,function(thread){
            return forum_post_model.find({thread:thread._id}).count()
                .then(function(count){
                    thread = JSON.parse(JSON.stringify(thread));
                    thread.postCount = count;
                    return thread;
                })
        });
        return Promise.all(promises);
    });

    return Promise.all([getTopicsQuery,getThreadsQuery]).then(function(results){
        return {topics:results[0],threads:results[1]};
    });
}

//TODO: add something to increment the views on the thread

module.exports = {
    createTopic:function(req,res){
        req.body.creator = req.user._id;
        createTopic(req.body).then(function(topic){
            res.status(201).send(topic);
        },function(err){
            res.status(400).send();//assumes that the information that was submitted violates the schema and caused an error when submitting
        })
    },
    createThread:function(req,res){
        req.body.creator = req.user._id;
        createThread(req.body).then(function(thread){
            res.status(201).send(thread);
        },function(err){
            res.status(400).send();//assumes that the information that was submitted violates the schema and caused an error when submitting
        })
    },
    createPost:function(req,res){
        req.body.creator = req.user._id;
        createPost(req.body,req.user).then(function(){
            res.status(201).send();
        },function(err){
            res.status(400).send(err);//assumes that the information that was submitted violates the schema and caused an error when submitting
        })
    },
    lockThread:function(req,res){
        lockThread(req.params.threadId).then(function(){
            res.status(201).send();
        },function(err){
            console.error(err);
            res.status(500).send('Server encountered an error while processing your request.');
        })
    },
    unlockThread:function(req,res){
        unlockThread(req.params.threadId).then(function(){
            res.status(201).send();
        },function(err){
            console.error(err);
            res.status(500).send('Server encountered an error while processing your request.');
        })
    },
    getRootTopics:function(req,res){
        getRootTopics().then(function(results){
            res.json(results);
        },function(err){
            console.error(err);
            res.status(500).send('Server encountered an error while processing your request.');
        })
    },
    getTopicChildren:function(req,res){
        var limit = req.query.limit||15;
        if(limit>100)
        limit=15;
        getTopicChildren(req.params.topicId,limit,req.query.skip)
            .then(function(results){
                res.json(results);
            },function(err){
                console.error(err);
                res.status(500).send('Server encountered an error while processing your request.');
            })
    }
};
