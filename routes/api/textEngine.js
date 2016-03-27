/**
 * Created by alexthomas on 3/26/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var _ = require('lodash');
var textMod = require('../../classes/textMod');


router.route('/remove').post(function(req,res){
    res.send(textMod.remove(req.body.remove,req.body.text));
});

router.route('/leet').post(function(req,res){
    textMod.leet(req.body.text,req.body.chance)
        .then(function(result){
            res.send(result);
        })
});

module.exports = router;