/**
 * Created by Sonicdeadlock on 4/2/2016.
 */
var _ = require('lodash');
var db = require('../db');
var contentModel = require('../models/content');
var content = db.model('content');
var bannedWordModel = require('../models/banned_word');
var banned_word = db.model('banned_word');

var commands = {
    '!test':function(text,emitCallback){
        emitCallback('This is a test');
    },
    '!joke':function(text,emitCallback,user){
        if(user.hasPermission('Joke')){
            content.count({type:'joke'}).exec().then(function(count){
                content.findOne({type:'joke'}).skip(_.random(count)).then(function(result){
                    emitCallback(result.content)
                });
            });
        }else{
            emitCallback('You Don\'t have permission to request jokes!');
        }
    },
    '!addJoke':function(text,emitCallback,user){
        if(user.hasPermission('Joke Admin')){
            var joke = text.substr('!addJoke'.length);
            (new content({type:'joke',content:joke})).save()
            .then(function(){
                emitCallback('Joke Added');
            })
        }else{
            emitCallback('You Don\'t have permission to add jokes!');
        }
    },
    '!proverb':function(text,emitCallback,user){
        if(user.hasPermission('Proverb')){
            content.count({type:'proverb'}).exec().then(function(count){
                content.findOne({type:'proverb'}).skip(_.random(count)).then(function(result){
                    emitCallback(result.content)
                });
            });
        }else{
            emitCallback('You Don\'t have permission to request proverbs!');
        }
    },
    '!addProverb':function(text,emitCallback,user){
        if(user.hasPermission('Proverb Admin')){
            var joke = text.substr('!addProverb'.length);
            (new content({type:'proverb',content:joke})).save()
            .then(function(){
                emitCallback('Proverb Added');
            })
        }else{
            emitCallback('You Don\'t have permission to add proverbs!');
        }
    },
    '!pickupLine':function(text,emitCallback,user){
        if(user.hasPermission('Pickup Line')){
            content.count({type:'pickupLine'}).exec().then(function(count){
                content.findOne({type:'pickupLine'}).skip(_.random(count)).then(function(result){
                    emitCallback(result.content)
                });
            });
        }else{
            emitCallback('You Don\'t have permission to request Pickup Lines!');
        }
    },
    '!addPickupLine':function(text,emitCallback,user){
        if(user.hasPermission('Pickup Line Admin')){
            var joke = text.substr('!addPickupLine'.length);
            (new content({type:'pickupLine',content:joke})).save()
                .then(function(){
                    emitCallback('Pickup Line Added');
                })
        }else{
            emitCallback('You Don\'t have permission to add Pickup Lines!');
        }
    },
    '!addBannedWord':function(text,emitCallback,user){
        if(user.hasPermission('Chat Admin')){
            var word = text.substr('!addBannedWord'.length);
            (new banned_word({word:word})).save()
                .then(function(){
                    emitCallback('Banned Word Added');
                },function(err){
                    console.log(err);
                })
        }else{
            emitCallback('You Don\'t have permission to ban words!');
        }
    }
};
function isCommand(text){
    var cmds = _.keys(commands);
    return (cmds.indexOf(text.split(' ')[0])!=-1);
}

function execute(text,emitCallback,user){
    if(isCommand(text)){
        commands[text.split(' ')[0]](text,emitCallback,user);
    }
}

module.exports = {
    isCommand:isCommand,
    execute:execute
};