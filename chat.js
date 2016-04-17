/**
 * Created by alexthomas on 12/11/15.
 */

var _ = require('lodash');
var db = require('./db');
var chatModel = require('./models/chat');
var chat = db.model('chat');
var roomModel = require('./models/room');
var room = db.model('room');
var bannedWordModel = require('./models/banned_word');
var banned_word = db.model('banned_word');
var textMod = require('./classes/textMod');
var commands = require('./classes/commands');
var basicBot = require('./bots/basicBot');
var hangmanBot = require('./bots/hangmanBot');


var users = [];
var serverUser = {_id:-1,username:'Server',group:{name:undefined}};
module.exports = {connect:connect,disconnect:disconnect};
function connect(socket){
    var user = socket.client.request.user;
    var chatRoom = undefined;
    var userCollectionObj = {user:user,socket:socket};
    users.push(userCollectionObj);

    function getUsersForCommunication(room){
        //TODO: determine only users who need to see the chat
        return _.filter(users,function(o){
            return o.room && o.room._id == room._id;
        });
    }

    socket.on('chatClientToServer',function(message){
        if(!chatRoom.bans || (chatRoom.bans && !_.find(chatRoom.bans,function(id){return id.id == user._id.id}))){
            if(message.text && chatRoom){
                var impersonate = undefined;
                if(message.text.indexOf('!impersonate')==0 && user.hasPermission('impersonate')){
                    var split = message.text.split(' ');
                    impersonate = {name:split[1]};
                    message.text = _.slice(split,2).join(' ');
                }
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
                    (new chatObj(user,chatRoom,text)).then(function(chat){
                        if(impersonate)
                            chat.username = impersonate.name;
                        _.forEach(getUsersForCommunication(chatRoom),function(u){
                            u.socket.emit('chatServerToClient',chat);
                        });
                        if(commands.isCommand(text))
                            commands.execute(text,function(serverText){
                                _.forEach(getUsersForCommunication(chatRoom),function(u){
                                    (new chatObj(serverUser,chatRoom,serverText)).then(function(serverChat){
                                        u.socket.emit('chatServerToClient',serverChat);
                                    })

                                })
                            },user);
                        chatRoom.bots.forEach(function(bot){
                            if(bot.name == 'basic'){
                                basicBot.chatInduction(user,chatRoom,text,function(text){
                                    _.forEach(getUsersForCommunication(chatRoom),function(u){
                                        u.socket.emit('chatServerToClient',{text:text,time: _.now()});
                                    });
                                },function(text){
                                    socket.emit('chatServerToClient',{text:text,time: _.now()});
                                });
                            }
                            else if(bot.name == 'hangman'){
                                hangmanBot.chatInduction(user,chatRoom,text,function(text){
                                    _.forEach(getUsersForCommunication(chatRoom),function(u){
                                        u.socket.emit('chatServerToClient',{text:text,time: _.now()});
                                    });
                                },function(text){
                                    socket.emit('chatServerToClient',{text:text,time: _.now()});
                                });
                            }
                        });
                    });

                })
            }
        }else{
            socket.emit('chatError',{error:'You are not allowed in this room!'});
        }

    });

    socket.on('chatEnterRoom',function(message){
        var roomData = message.room;
        room.findOne({_id:roomData._id}).then(function(roomDoc){
            if(!roomDoc){
                socket.emit('chatError',{error:'Room no longer exists!'})
                return;
            }
            var allowedInRoom = true;
            if(roomDoc.bans){
                if(_.find(roomDoc.bans,function(id){return id.id == user._id.id})){
                    allowedInRoom = false;
                    socket.emit('chatError',{error:'You are banned from this room!'});
                }
            }
            if(roomDoc.password){
                if(!(message.password && message.password == roomDoc.password)){
                    allowedInRoom = false;
                    socket.emit('chatError',{error:"Invalid Password"});
                }
            }
            if(allowedInRoom){ //TODO: check permissions to enter the room
                chatRoom = roomData;
                userCollectionObj.room = roomData;
                socket.emit('chatEnterRoom',{room:roomData});
                chatRoom.bots.forEach(function(bot){
                    if(bot.name == 'basic'){
                        basicBot.userEnterRoom(user,chatRoom);
                    }
                });
                _.forEach(getUsersForCommunication(chatRoom),function(u){
                    u.socket.emit('chatRoomEntrance',user.username);
                })
            }
        });

    });
    socket.on('chatLeaveRoom',function(){
        if(chatRoom){
            _.forEach(getUsersForCommunication(chatRoom),function(u){
                u.socket.emit('chatRoomExit',user.username);
            });
            chatRoom.bots.forEach(function(bot){
                if(bot.name == 'basic'){
                    basicBot.userExitRoom(user,chatRoom);
                }
            });
            chatRoom = undefined;
            userCollectionObj.room = undefined;
        }

    });
    socket.on('chatBanUser',function(message){
       var user_id = message.user_id;
        if(user.hasPermission('Chat Admin') && chatRoom){
            chatRoom.bans.push(user_id);
            chatRoom.save();
        }
    });
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
    var self = this;
    return banned_word.find({}).cache().exec().then(function(badWords){
        badWords.forEach(function(badWord){//TODO: count every time the user sends a bad word
            formatedText = formatedText.replace(new RegExp('('+badWord.regex.trim()+')+','g'),'<span class="text-danger">[CENSORED]</span>');
        });
        var reg_exUrl = new RegExp(/(((http|https|ftp|ftps)\:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)|(\d{1,3}\.){3}\d{1,3}(\/\S*)?/g);
        var matches = formatedText.match(reg_exUrl) || [];
        for (var i = matches.length - 1; i >= 0; i--) {
            var match = matches[i];
            formatedText = formatedText.replace(match, "<a target='_blank' href='" + match + "'>" + match + "</a>");
        }
        self.text = formatedText;
        self.username = sendUser.username;
        self.rank = sendUser.group.name;
        self.formating = sendUser.chat;
        return self;
    });


}