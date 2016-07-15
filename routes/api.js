var config = require('../config.js');
var express = require('express');
var router = express.Router();

//apis
var users = require('./api/users');
var permissionGroups = require('./api/permissionGroups');
var messages = require('./api/messages');
var textEngine = require('./api/textEngine');
var hangman = require('./api/hangman');
var rooms = require('./api/rooms');
var update_notes = require('./api/update_notes');
var forum = require('./api/forum');
var imageEngine = require('./api/imageEngine');


//route apis
router.use('/users',users);
router.use('/permissionGroups',permissionGroups);
router.use('/messages',messages);
router.use('/textEngine',textEngine);
router.use('/hangman',hangman);
router.use('/rooms',rooms);
router.use('/update_notes',update_notes);
router.use('/forum',forum);
router.use('/imageEngine',imageEngine);

module.exports = router;