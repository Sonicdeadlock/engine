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
var userController = require('../../../controllers/userController');

router.route('/')
    .post(userController.hasAuthorization(['Forum Admin']),forumController.createTopic)
    .get(forumController.getRootTopics);

router.route('/:topicId')
    .get(function(req,res){
       forum_topic_model.findById(req.params.topicId).then(function(result){
           if(result)
           res.json(result);
           else  res.status(404).send('Topic not found');
       },function(){
           res.status(404).send('Topic not found');
       })
    });

router.route('/:topicId/children')
    .get(forumController.getTopicChildren);

module.exports = router;