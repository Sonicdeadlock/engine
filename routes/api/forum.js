/**
 * Created by Sonicdeadlock on 5/5/2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var post = require('./forum/post');
var thread = require('./forum/thread');
var topic = require('./forum/topic');

router.use('/posts',post);
router.use('/threads',thread);
router.use('/topics',topic);

module.exports = router;