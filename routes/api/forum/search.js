/**
 * Created by Sonicdeadlock on 5/9/2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../../../db');
var forumController = require('../../../controllers/forumController');

router.route('/tag/:tag')
    .get(forumController.getByTag);

router.route('/tags')
    .post(forumController.getByTag);

module.exports = router;