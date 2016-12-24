/**
 * Created by Sonicdeadlock on 5/28/2016.
 */
var chat = require('../chat');
var db = require('../db');
var roomModel = require('../models/room');
var _ = require('lodash');


module.exports.init = function () {
    roomModel.find({bots: {"$elemMatch": {name: "test"}}}).then(function (rooms) {
        rooms.forEach(function (room) {
            chat.on("chat", room._id, function (user, chatToRoom, chatToUser, text) {
                chatToUser("hey");
            });
            chat.on('enterRoom', room._id, function (user, chatToRoom, chatToUser) {
                chatToUser({
                    username: "Test Bot",
                    text: "Hey " + user.username + ", this is just a message to let you know that test bot is running in this room"
                });
                chatToRoom({username: "Test Bot", text: "Everyone say hey to " + user.username});
            });

            chat.on('preChat', room._id, function (user, chatToRoom, chatToUser, text) {
                if (_.startsWith(text, 'f')) {
                    chatToUser("oh, don't say that");
                    return false;
                }
                if (text === 'crash') {
                    chatToUser("hey, don't do that");
                    throw "crash";
                }
            });

            chat.on('exitRoom', room._id, function (user, chatToRoom) {
                chatToRoom("farewell " + user.username);
            })
        })
    });
};
