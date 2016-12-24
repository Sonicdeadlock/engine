/**
 * Created by Sonicdeadlock on 3/27/2016.
 */
var db = require('../db');
var _ = require('lodash');

var char_replaceModel = require('../models/char_replace');
var char_replace = db.model('character_replacements');


function leet(chance, text) {
    chance = chance / 100;
    return char_replace.find({}).cache().exec().then(function (replacements) {
        var result = _.map(text.split(' '), function (word) {
            word = _.map(word, function (character) {
                if (Math.random() > chance)//if the chance is not meet don't chance the character
                    return character;
                var options = _.find(replacements, {character: _.toLower(character)});
                if (options == undefined)//if the character has no replacements don't change it
                    return character;
                return _.sample(options.replacements);

            }).join('');
            if (Math.random() > chance / 10)
                return word + ' ';
            var word_options = [
                function (word) {
                    return "<<" + word + ">> ";
                },
                function (word) {
                    return "<" + word + "> ";
                },
                function (word) {
                    return "" + word + "_";
                }
            ];
            return _.sample(word_options)(word);
        }).join('');
        return result;
    })
}

function remove(character, text) {
    return text.split(character).join('')
}
module.exports.leet = leet;
module.exports.remove = remove;