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
    .post(userController.requiresLogin,forumController.createPost);

router.route('/:postId')
    .get(function(req,res){
        forum_post_model.findById(req.params.postId).populate('creator','username group').then(function(result){
            if(result)
                user.populate(result,{
                    path:'creator.group',
                    select:'name',
                    model:permissionGroup
                }).then(function(result){
                    res.json(result);
                });
            else
                res.status(404).send('Post not found');
        },function(){
            res.status(404).send('Post not found');
        })
    })
    .delete(function(req,res){
        forum_post_model.findById(req.params.postId).then(function(result){
            if(!result)
                res.status(404).send('Thread not found');
            else{
                if(!(req.user.hasPermission('Forum Admin')||req.user._id.id ===result.creator.id)){
                    res.status(403).send({
                        message: 'User is not authorized'
                    });
                }else{
                    forum_post_model.findOneAndRemove({_id:req.params.postId})
                        .then(function(){res.status(200).send()},
                            function(err){res.send(400).send()})
                }
            }
        });

    })
    .patch(function(req,res){
        forum_post_model.findByIdAndUpdate(req.params.postId,{$set:{body:req.body.body}})
            .then(function(){res.status(200).send()},
                function(err){res.send(400).send()})
    });

module.exports = router;