var config = require('../config.js');
var express = require('express');
var router = express.Router();

//apis
var users = require('./api/users');
var permissionGroups = require('./api/permissionGroups');
var messages = require('./api/messages');
var textEngine = require('./api/textEngine');
var hangman = require('./api/hangman');


//route apis
router.use('/users',users);
router.use('/permissionGroups',permissionGroups);
router.use('/messages',messages);
router.use('/textEngine',textEngine);
router.use('/hangman',hangman);

module.exports = router;