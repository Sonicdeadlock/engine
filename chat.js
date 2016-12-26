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
var userModel = require('./models/user');
var User = db.model('user');
var textMod = require('./classes/textMod');
var commands = require('./classes/commands');
var config = require('./config');


var users = [];
var serverUser = {_id: undefined, username: 'Server', group: {name: undefined}};
var hooks = {};
module.exports = {connect: connect, disconnect: disconnect, on: addHookListener, removeHooks: removeHooks};
function connect(socket) {
    var user = socket.client.request.user;
    var userCollectionObj = {user: user, socket: socket};
    users.push(userCollectionObj);

    socket.on('chatClientToServer', function (message) {
        if (!userCollectionObj.chatRoom.bans || (userCollectionObj.chatRoom.bans && !_.find(userCollectionObj.chatRoom.bans, function (id) {
                return id.equals(user._id)
            }))) {
            if (message.text && userCollectionObj.chatRoom) {
                var impersonate = undefined;
                if (message.text.indexOf('!impersonate') == 0 && user.hasPermission('impersonate')) {
                    var split = message.text.split(' ');
                    impersonate = {name: split[1]};
                    message.text = _.slice(split, 2).join(' ');
                }
                var prom = new Promise(function (resolve, reject) {
                    resolve(message.text)
                });
                prom = prom.then(preChatHook.bind(this, user, userCollectionObj.chatRoom));
                if (message.mods)
                    for (var i = 0; i < message.mods.length; i++) {
                        var mod = message.mods[i];
                        switch (mod.name) {
                            case 'l337':
                                prom = prom.then(textMod.leet.bind(null, mod.attributes.chance));
                                break;
                            case 'removeCharacter':
                                prom = prom.then(textMod.remove.bind(null, mod.attributes.remove));
                                break;
                        }
                    }
                prom.then(function (text) {
                    (new chatObj(user, userCollectionObj.chatRoom, text)).then(function (chat) {
                        if (impersonate)
                            chat.username = impersonate.name;

                        chatToRoom(userCollectionObj.chatRoom, chat);
                        if (commands.isCommand(text))
                            commands.execute(text, function (serverText) {
                                _.forEach(getUsersForCommunication(userCollectionObj.chatRoom), function (u) {
                                    (new chatObj(serverUser, userCollectionObj.chatRoom, serverText)).then(function (serverChat) {
                                        u.socket.emit('chatServerToClient', serverChat);
                                    })
                                })
                            }, user);
                        chatHook(user, userCollectionObj.chatRoom, chat.text);
                    });
                })
            }
        } else {
            socket.emit('chatError', {error: 'You are not allowed in this room!'});
        }

    });

    socket.on('chatEnterRoom', function (message) {
        var roomData = message.room;
        if (!roomData) {
            socket.emit('chatError', {error: 'Room no longer exists!'});
            return;
        }
        room.findOne({_id: roomData._id}).then(function (roomDoc) {
            if (!roomDoc) {
                socket.emit('chatError', {error: 'Room no longer exists!'});
                return;
            }
            var allowedInRoom = true;
            if (roomDoc.bans) {
                if (_.find(roomDoc.bans, function (id) {
                        return user._id.equals(id)
                    })) {
                    allowedInRoom = false;
                    socket.emit('chatError', {error: 'You are banned from this room!'});
                }
            }
            if (roomDoc.password) {
                if (!(message.password && message.password == roomDoc.password)) {
                    allowedInRoom = false;
                    socket.emit('chatError', {error: "Invalid Password"});
                }
            }
            if (allowedInRoom) { //TODO: check permissions to enter the room
                userCollectionObj.chatRoom = roomDoc;
                userCollectionObj.room = roomData;
                socket.emit('chatEnterRoom', {room: roomData});
                roomEnterHook(user, userCollectionObj.chatRoom);
                _.forEach(getUsersForCommunication(userCollectionObj.chatRoom), function (u) {
                    u.socket.emit('chatRoomEntrance', user.username);
                })
            }
        });

    });
    socket.on('chatLeaveRoom', function () {
        if (userCollectionObj.chatRoom) {
            _.forEach(getUsersForCommunication(userCollectionObj.chatRoom), function (u) {
                u.socket.emit('chatRoomExit', user.username);
            });
            var hookWait = roomExitHook.bind(this, user, userCollectionObj.chatRoom);
            userCollectionObj.chatRoom = undefined;
            userCollectionObj.room = undefined;
            hookWait();
        }

    });
    socket.on('chatBanUser', function (message) {
        var user_id = message.user_id;
        if (user.hasPermission('Chat Admin') && userCollectionObj.chatRoom && userCollectionObj.chatRoom.bans.indexOf(user_id) === -1) {
            User.update({_id: user_id}, {$inc: {'strikes.bans': 1}}).then();
            var bannedUser = _.find(users, function (u) {
                return u.user._id.equals(user_id)
            });
            bannedUser.chatRoom = undefined;
            bannedUser.socket.emit('chatError', {error: 'You have been banned from this room!'});
            userCollectionObj.chatRoom.bans.push(user_id);
            userCollectionObj.chatRoom.save();
        }
    });

    socket.on('clientToServerStartTyping',function(){
        _.forEach(getUsersForCommunication(userCollectionObj.chatRoom),function(u){
            u.socket.emit('serverToClientStartTyping',{name:user.username});
        });
    });
    socket.on('clientToServerStopTyping',function(){
        _.forEach(getUsersForCommunication(userCollectionObj.chatRoom),function(u){
            u.socket.emit('serverToClientStopTyping',{name:user.username});
        });
    });
}

function disconnect(socket) {
    users = _.reject(users, {socket: socket});
}

function chatObj(sendUser, chatRoom, text) {
    this.text = text;
    this.time = new Date();
    this.user = sendUser._id;
    this.room = chatRoom._id;
    var c = new chat(this);
    c.save();
    var formatedText = text;//TODO: format,sterilize text
    var self = this;
    return banned_word.find({}).cache().exec().then(function (badWords) {
        badWords.forEach(function (badWord) {
            var count = formatedText.match(new RegExp('(' + badWord.regex.trim() + ')+', 'g'));
            count = count === null ? 0 : count.length;
            if (count > 0) {
                formatedText = formatedText.replace(new RegExp('(' + badWord.regex.trim() + ')+', 'g'), '<span class="text-danger">[CENSORED]</span>');
                if (sendUser)
                    sendUser.update({$inc: {'strikes.chat': count}}).then();
            }
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

function preChatHook(user, room, text) {
    var promise;
    var listeners = hooks["preChat"] && hooks["preChat"][room._id] || [];
    if (_.isEmpty(listeners)) return new Promise(function (resolve, reject) {
        resolve(text)
    });
    function chatToRoomCallback(text) {
        var chat = _.isObject(text) ? text : {text: text, time: _.now()};
        chatToRoom(room, chat);
    }

    function chatToUserCallback(text) {
        var chat = _.isObject(text) ? text : {text: text, time: _.now()};
        chatToUser(_.find(users, {user: user}), chat);
    }

    promise = Promise.all(_.map(listeners, function (listener) {
        try {
            var result = listener(user, chatToRoomCallback, chatToUserCallback, text);
            if (result === undefined)
                return true;
            if (_.isFunction(result.then))
                return result.then(function (shouldContinue) {
                    return shouldContinue
                }, function () {
                    return true
                });
            else if (_.isBoolean(result))
                return result;
            else
                return true
        }
        catch (ex) {
            if (ex) {
                console.error(ex);
            }
            return true;
        }
    }));
    promise = setHookPromiseTimeout(promise);
    return new Promise(function (resolve, reject) {
        promise.then(function (results) {
            if (!results || !_.isArray(results) || _.isEmpty(results) || results.indexOf(false) === -1) {
                resolve(text);
            }
            else {
                reject()
            }
        });
    });
}

function setHookPromiseTimeout(promises) {
    return Promise.race([promises, new Promise(function (resolve) {
        setTimeout(resolve, config.chat.hookTimeout)
    })])
}

function genericHookHandle(listeners, user, room, text) {

    function chatToRoomCallback(text) {
        var chat = _.isObject(text) ? text : {text: text, time: _.now()};
        chatToRoom(room, chat);
    }

    function chatToUserCallback(text) {
        var chat = _.isObject(text) ? text : {text: text, time: _.now()};
        chatToUser(_.find(users, {user: user}), chat);
    }

    return Promise.all(_.map(listeners, function (listener) {
        return listener(user, chatToRoomCallback, chatToUserCallback, text);
    }));
}

function chatHook(user, room, text) {
    var listeners = hooks["chat"] && hooks["chat"][room._id] || [];
    genericHookHandle(listeners, user, room, text);
}

function roomEnterHook(user, room) {
    var listeners = hooks["enterRoom"] && hooks["enterRoom"][room._id] || [];
    genericHookHandle(listeners, user, room);
}

function roomExitHook(user, room) {
    var listeners = hooks["exitRoom"] && hooks["exitRoom"][room._id] || [];
    genericHookHandle(listeners, user, room);
}

function chatToRoom(room, chat) {
    _.forEach(getUsersForCommunication(room), function (u) {
        chatToUser(u, chat);
    });
}

function chatToUser(user, chat) {
    user.socket.emit('chatServerToClient', chat);
}

function getUsersForCommunication(room) {
    //TODO: determine only users who need to see the chat
    return _.filter(users, function (o) {
        return o.room && o.room._id == room._id;
    });
}

function addHookListener(type, roomId, listener) {
    if (!hooks[type]) {
        hooks[type] = {};
    }
    if (!hooks[type][roomId]) {
        hooks[type][roomId] = [];
    }
    hooks[type][roomId].push(listener);
}

function removeHooks() {
    hooks = {};
}