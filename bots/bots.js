/**
 * Created by Sonicdeadlock on 5/28/2016.
 */
var chat = require('../chat');
var bots = ['test','hangmanBot','basicBot','gambleBot','battleshipBot'];


function initBots(){
    chat.removeHooks();
    bots.forEach(function(bot){
        require('./'+bot).init();
    });
}

module.exports = initBots;