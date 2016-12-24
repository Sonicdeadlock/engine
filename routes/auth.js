/**
 * Created by alexthomas on 1/20/16.
 */
var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

router.route('/')
    .post(userController.create)
    .put(userController.requiresLogin, userController.updateSelf)
    .get(userController.get);

router.route('/register')
    .post(userController.create);

router.route('/login')
    .post(userController.login);

router.route('/logout')
    .get(userController.logout)
    .post(userController.logout);

router.route('/self')
    .get(userController.self);

module.exports = router;