var chat = require('../chat');
var Room = require('../models/room');
var _ = require('lodash');
var db = require('../db');

function chatInduction(user, room, chat, roomChatCallback, userChatCallback) {
  if(_.startsWith(chat,'!g')){
      var searchQuery = _.tail(chat.split(' '));
      var response = "<a href='https://www.google.com/#q="+searchQuery.join('+')+"' target='_blank'>Find your search here</a>";
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
