var express = require('express');
var router = express.Router();
var db = require('../../db');
var config = require('../../config');
var crypto = require('crypto');

var userModel = require('../../models/user');
var user = db.model('user');
var permissionGroupModel = require('../../models/permissionGroup');
var permissionGroup = db.model('permissionGroup');
var userController = require('../../controllers/userController');



function hash (salt, raw) {
    return crypto.pbkdf2Sync(raw, salt, config.hash.itterations, config.hash.length).toString('base64');
};


router.route('/getUser')
    .post(function(req,res){
        var userAccess = 'username _id';
        //TODO:splice and insert username into userAccess to make it the minimum not the default
        if(req.user) userAccess =req.user.group.userAccess||' ';
            user.findOne(req.body,userAccess)
    .then(function(obj) {

                   res.json(obj);

           });
    });









module.exports = router;