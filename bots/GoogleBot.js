var chat = require('../chat');
var Room = require('../models/room');
var _ = require('lodash');
var db = require('../db');
const baseResponse = {text:'',time:_.now(),username:'GoogleBot',rank:'Bot'};
function chatInduction(user, room, chat, roomChatCallback, userChatCallback) {
    var responseText=undefined;
  if(_.startsWith(chat,'!g')){
      var searchQuery = _.tail(chat.split(' '));
      responseText = "<a href='https://www.google.com/#q="+searchQuery.join('+')+"' target='_blank'>Find your search here</a>";
       roomChatCallback(response);
  }else if(_.startsWith(chat,'!lmgtfy')){
      var searchQuery = _.tail(chat.split(' '));
      responseText = '<a href="http://lmgtfy.com/?q='+searchQuery.join('+')+'" target="_blank">Find your search here</a>';
  }
  if(responseText!==undefined){
      var response = _.cloneDeep(baseResponse);
      response.time = _.now();
      response.text = responseText;
      roomChatCallback(response);
  }
}

function init() {
    Room.find({}).then(function (roomResults) {
        roomResults.forEach(function (room) {
            chat.on("chat", room._id, function (user, chatToRoom, chatToUser, text) {
                chatInduction(user, room, text, chatToRoom, chatToUser);
            });
        });
    });
}
module.exports.init = init;
