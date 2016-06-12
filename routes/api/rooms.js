/**
 * Created by alexthomas on 4/17/16.
 */
var express = require('express');
var router = express.Router();
var roomController = require('../../controllers/roomController');
var userController = require('../../controllers/userController');

router.route('/')
    .get(userController.hasAuthorization(['Room Admin']),roomController.get)
    .post(userController.hasAuthorization(['Room Admin']),roomController.create);

router.route('/delete/:id')
    .delete(userController.hasAuthorization(['Room Admin']),roomController.remove);

router.route('/addBot')
    .post(userController.hasAuthorization(['Room Admin']),roomController.addBot);
router.route('/removeBot')
    .post(userController.hasAuthorization(['Room Admin']),roomController.removeBot);
router.route('/removeBan')
    .post(userController.hasAuthorization(['Room Admin']),roomController.removeBan);
router.route('/changeDescription')
    .post(userController.hasAuthorization(['Room Admin']),roomController.changeDescription);
router.route('/changeName')
    .post(userController.hasAuthorization(['Room Admin']),roomController.changeName);
router.route('/changeOptions')
    .post(userController.hasAuthorization(['Room Admin']),roomController.changeOptions);
router.route('/changePassword')
    .post(userController.hasAuthorization(['Room Admin']),roomController.changePassword);


module.exports = router;