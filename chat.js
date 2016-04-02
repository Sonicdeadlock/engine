/**
 * Created by alexthomas on 12/11/15.
 */

var _ = require('lodash');
var db = require('./db');
var chatModel = require('./models/chat');
var chat = db.model('chat');
var roomModel = require('./models/room');
var room = db.model('room');
var textMod = require('./classes/textMod');



var users = [];
module.exports = {connect:connect,disconnect:disconnect};
function connect(socket){
    var user = socket.client.request.user;
    var chatRoom = undefined;
    var userCollectionObj = {user:user,socket:socket};
    users.push(userCollectionObj);

    function getUsersForCommunication(room){
        //TODO: determine only users who need to see the chat
        return _.filter(users,{room:room});
    }

    socket.on('chatClientToServer',function(message){
        if(message.text && chatRoom){
            if(message.mods){
                var prom = new Promise(function(resolve,reject){resolve(message.text)});
                for(var i=0;i<message.mods.length;i++){
                    var mod = message.mods[i];
                    switch (mod.name){
                        case 'l337':
                            prom = prom.then(textMod.leet.bind(null,mod.attributes.chance));
                            break;
                        case 'removeCharacter':
                            prom = prom.then(textMod.remove.bind(null,mod.attributes.remove));
                            break;
                    }
                }
                prom.then(function(text){
                    var chat = new chatObj(user,chatRoom,text);
                    _.forEach(getUsersForCommunication(chatRoom),function(u){
                        u.socket.emit('chatServerToClient',chat);
                    })
                })
            }
            else{
                var chat = new chatObj(user,chatRoom,message.text);
                _.forEach(getUsersForCommunication(chatRoom),function(u){
                    u.socket.emit('chatServerToClient',chat);
                })
            }

        }

    });

    socket.on('chatEnterRoom',function(roomData){
        if(true){ //TODO: check permissions to enter the room
            chatRoom = roomData;
            userCollectionObj.room = roomData;
            _.forEach(getUsersForCommunication(chatRoom),function(u){
                u.socket.emit('chatRoomEntrance',user.username);
            })
        }
    });
    socket.on('chatLeaveRoom',function(){
        _.forEach(getUsersForCommunication(chatRoom),function(u){
            u.socket.emit('chatRoomExit',user.username);
        });
        chatRoom = undefined;
        userCollectionObj.room = undefined;
    })
}

function disconnect(socket){
    users = _.reject(users,{socket:socket});
}


function chatObj(sendUser,chatRoom,text){
    this.text = text;
    this.time = new Date();
    this.user = sendUser._id;
    this.room = chatRoom._id;
    var c = new chat(this);
    c.save();
    var formatedText = text;//TODO: format,sterilize text
    var reg_exUrl = new RegExp(/(((http|https|ftp|ftps)\:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)|(\d{1,3}\.){3}\d{1,3}(\/\S*)?/g);
    var matches = formatedText.match(reg_exUrl) || [];
    for (var i = matches.length - 1; i >= 0; i--) {
        var match = matches[i];
        formatedText = formatedText.replace(match, "<a target='_blank' href='" + match + "'>" + match + "</a>");
    }
    this.text = formatedText;
    this.username = sendUser.username;
    this.rank = sendUser.group.name;
    this.formating = sendUser.chat;

}