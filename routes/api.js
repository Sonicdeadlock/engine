var config = require('../config.js');
var express = require('express');
var router = express.Router();

//apis
var users = require('./api/users');
var permissionGroups = require('./api/permissionGroups');
var messages = require('./api/messages');


//route apis
router.use('/users',users);
router.use('/permissionGroups',permissionGroups);
router.use('/messages',messages);

module.exports = router;