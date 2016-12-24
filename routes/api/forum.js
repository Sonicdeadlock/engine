/**
 * Created by Sonicdeadlock on 5/5/2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var post = require('./forum/post');
var thread = require('./forum/thread');
var topic = require('./forum/topic');
var search = require('./forum/search');

router.use('/posts', post);
router.use('/threads', thread);
router.use('/topics', topic);
router.use('/search', search);

module.exports = router;