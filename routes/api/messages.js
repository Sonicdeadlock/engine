/**
 * Created by alexthomas on 1/2/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var userController = require('../../controllers/userController');
var messageModel = require('../../models/message');
var message = db.model('message');
var messageController = require('../../controllers/messageController');

router.route('/')
    .post(userController.requiresLogin, messageController.create);

router.route('/mine')
    .get(userController.requiresLogin, messageController.mine);

router.route('/mark')
    .post(userController.requiresLogin, messageController.markRead);

router.route('/:id')
    .get(userController.requiresLogin, messageController.get)
    .delete(userController.requiresLogin, messageController.delete);


module.exports = router;
