/**
 * Created by alexthomas on 3/26/16.
 */
var express = require('express');
var router = express.Router();
var db = require('../../db');
var _ = require('lodash');

var char_replaceModel = require('../../models/char_replace');
var char_replace = db.model('character_replacements');

router.route('/remove').post(function(req,res){
   var text = req.body.text;
    var remove = req.body.remove;
    res.send(text.split(remove).join(''));
});

router.route('/leet').post(function(req,res){
    var chance = req.body.chance/100;
    char_replace.find({}).then(function(replacements){
        var result = _.map(req.body.text.split(' '),function(word){
            word = _.map(word,function(character){
                if(Math.random()>chance)//if the chance is not meet dont chance the character
                    return character;
                var options = _.find(replacements,{character: _.toLower(character)});
                if(options ==undefined )//if the character has no replacements dont' change it
                    return character;
                return _.sample(options.replacements);

            }).join('');
            if(Math.random()>chance/10)
            return word+' ';
            var word_options = [
                function(word){
                    return "<<"+word+">> ";
                },
                function(word){
                    return "<"+word+"> ";
                },
                function(word){
                    return ""+word+"_";
                }
            ];
            return _.sample(word_options)(word);
        }).join('');
        res.send(result);
    })
});

module.exports = router;