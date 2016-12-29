var chat = require('../chat');
var Room = require('../models/room');
var _ = require('lodash');
var db = require('../db');
const baseResponse = {text:'',time:_.now(),username:'GoogleBot',rank:'Bot'};
function chatInduction(user, room, chat, roomChatCallback, userChatCallback) {
    var responseText=undefined;
    var words = chat.split(' ');
  if(words[0]==='!g' || words[0]=== '!google'){
      var searchQuery = _.tail(words);
      responseText = "<a href='https://www.google.com/#q="+searchQuery.join('+')+"' target='_blank'>Find your search here</a>";
       roomChatCallback(response);
  }else if(words[0]==='!lmgtfy'){
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
