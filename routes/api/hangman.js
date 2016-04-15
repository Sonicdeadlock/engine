/**
 * Created by alexthomas on 4/14/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var tokenModel = require('../../models/token');
var token = db.model('token');
var hangmanBot = require('../../bots/hangmanBot');

router.route('/set')
.post(function(req,res){
   var userToken = req.body.token;
    var word = req.body.word;
    if(!userToken){
        res.status(403).send('Invalid token!');
    }else if(!word){
        res.status(403).send('Invalid Word!');
    }
    else{
        token.findOne({token:userToken}).then(function(token){
            if(!token || !token.tokenData.room){
                res.status(403).send('Invalid Token!');
            }
            else if(token.tokenData.userId.id != req.user._id.id){
                res.status(403).send('Invalid user!');
            }
            else{
                hangmanBot.setWord(token.tokenData.room,word);
                token.remove().then(function(){
                    res.send('Success');
                });
            }
        })
    }
});

module.exports = router;