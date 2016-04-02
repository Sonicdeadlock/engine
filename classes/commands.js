/**
 * Created by Sonicdeadlock on 4/2/2016.
 */
var _ = require('lodash');
var db = require('../db');
var contentModel = require('../models/content');
var content = db.model('content');

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
            emitCallback('You Don\'t have permission to request jokes');
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
            emitCallback('You Don\'t have permission to add jokes');
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
            emitCallback('You Don\'t have permission to request proverbs');
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
            emitCallback('You Don\'t have permission to add proverbs');
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