/**
 * Created by alexthomas on 3/26/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');

router.route('/remove').post(function(req,res){
   var text = req.body.text;
    var remove = req.body.remove;
    res.send(text.split(remove).join(''));
});

module.exports = router;