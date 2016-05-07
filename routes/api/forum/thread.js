/**
 * Created by Sonicdeadlock on 5/5/2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../../../db');
require('../../../models/forum_post');
var forum_post_model = db.model('forum_post');
require('../../../models/forum_thread');
var forum_thread_model = db.model('forum_thread');
require('../../../models/forum_topic');
var forum_topic_model = db.model('forum_topic');
var forumController = require('../../../controllers/forumController');
var userModel = require('../../../models/user');
var user = db.model('user');
var permissionGroupModel = require('../../../models/permissionGroup');
var permissionGroup = db.model('permissionGroup');
var userController = require('../../../controllers/userController');

router.route('/')
    .post(userController.requiresLogin,forumController.createThread);

router.route('/:threadId')
    .get(function(req,res){
        var getThreadQuery = forum_thread_model.findById(req.params.threadId);
        getThreadQuery.populate('creator','username group');
        getThreadQuery.populate('history.actor','username');
        var limit = req.query.limit || 15;
        if(limit>100)
        limit = 15;
        getThreadQuery.then(function(result){
            if(result){
               var threadUserPopulateQuery = user.populate(result,{
                    path:'creator.group',
                    select:'name',
                    model:permissionGroup
                });

                var getThreadPostsQuery = forum_post_model.find({thread:req.params.threadId});
                getThreadPostsQuery.sort('-createTime');
                if(req.query.skip)
                    getThreadPostsQuery.skip(req.query.skip);

                getThreadPostsQuery.limit(limit);

                getThreadPostsQuery.populate('creator','username group');

                getThreadPostsQuery = getThreadPostsQuery.then(function(results){
                    if(results==[])
                    return results;
                    return user.populate(results,{
                        path:'creator.group',
                        select:'name',
                        model:permissionGroup
                    });
                });

                Promise.all([threadUserPopulateQuery,getThreadPostsQuery]).then(function(results){
                   var thread = JSON.parse(JSON.stringify(results[0]));
                    thread.posts = results[1];
                    res.json(thread);
                });
            }else res.status(404).send('Thread not found');
        },function(){
            res.status(404).send('Thread not found');
        })
    })
    .delete(userController.requiresLogin,function(req,res){
        var id = req.params.threadId;
        forum_thread_model.findById(req.params.threadId)
            .then(function(result){
                if(!result)
                    res.status(404).send('Thread not found');
                else{
                    if(!(req.user.hasPermission('Forum Admin')||req.user._id.id ==result.creator.id)){
                        res.status(403).send({
                            message: 'User is not authorized'
                        });
                    }else{
                        forum_thread_model.findOneAndRemove({_id:req.params.threadId})
                            .then(function(){res.status(200).send()},
                                function(err){res.send(400).send()})
                    }
                }
            })
    });

router.route('/:threadId/view')
    .patch(function(req,res){
        forum_thread_model.findByIdAndUpdate(req.params.threadId,{$inc:{views:1}})
            .then(function(){res.status(200).send()},
                function(err){res.status(400).send()});
    });

router.route('/:threadId/lock')
    .patch(userController.hasAuthorization(['Forum Admin']),forumController.lockThread);
router.route('/:threadId/unlock')
    .patch(userController.hasAuthorization(['Forum Admin']),forumController.unlockThread);
router.route('/:threadId/pin')
    .patch(userController.hasAuthorization(['Forum Admin']),forumController.pinThread);
router.route('/:threadId/unpin')
    .patch(userController.hasAuthorization(['Forum Admin']),forumController.unpinThread);

module.exports = router;