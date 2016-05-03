/**
 * Created by alexthomas on 4/17/16.
 */
var express = require('express');
var router = express.Router();
var roomController = require('../../controllers/roomController');

router.route('/')
    .get(roomController.get)
    .post(roomController.create);

router.route('/delete/:id')
    .delete(roomController.remove);

router.route('/addBot')
    .post(roomController.addBot);
router.route('/removeBot')
    .post(roomController.removeBot);
router.route('/removeBan')
    .post(roomController.removeBan);
router.route('/changeDescription')
    .post(roomController.changeDescription);
router.route('/changeName')
    .post(roomController.changeName);
router.route('/changeOptions')
    .post(roomController.changeOptions);
router.route('/changePassword')
    .post(roomController.changePassword);


module.exports = router;