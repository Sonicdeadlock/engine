/**
 * Created by alexthomas on 5/10/16.
 */
var _ = require('lodash');
var db = require('../db');
var playerModel = require('../models/player');
var Room = require('../models/room');
var chat = require('../chat');

var rooms = [];
var modes = {
    dice:require('./gamblingModes/dice'),
    slots:require('./gamblingModes/slots')
};
function userEnterRoom(user,room){//required to be exposed
    var matchedRoom = _.find(rooms,{roomId:room._id});
    if(!matchedRoom){
        var newRoom = {};
        newRoom.roomId = room._id;
        newRoom.players =[];
        matchedRoom = newRoom;
        rooms.push(newRoom);
    }
    playerModel.findOne({user:user._id}).populate('user','username').exec().then(function(result){
        if(result){
            matchedRoom.players.push(result);
        } else{
            var player = new playerModel({
                user:user._id,
                stats:{
                    level:1,
                    strength:_.random(1, 10),
                    intelligence:_.random(1, 10),
                    constitution:_.random(1, 10),
                    wisdom:_.random(1, 10),
                    dexterity:_.random(1, 10),
                    agility:_.random(1, 10),
                    BEN:_.random(1, 3)
                }
            });
            player.save();
            matchedRoom.players.push(player);
        }
    });



}

function userExitRoom(user,room){//required to be exposed
    var matchRoom = _.find(rooms,{roomId:room._id});
    matchRoom.players = _.reject(matchRoom.players,{_id:user._id});
}

function chatInduction(user,room,chat,roomChatCallback,userChatCallback) {
    room = _.find(rooms, {roomId: room._id});
    var player = _.find(room.players, ['user._id', user._id]);

    if (_.startsWith(chat, '!commands')) {
        var commands = _.union(['!money', '!setMode', '!commands', '!bet'], _.keys(modes));
        roomChatCallback('Gambling bot commands:<br>' + commands.join('<br>'));
    }
    else {
        if (!room.mode) {
            userChatCallback('Mode not set, please speak to a room admin');
        } else {
            var mode = modes[room.mode];
            if(mode.chat)
                mode.chat(user, player, room, chat, roomChatCallback, userChatCallback);
        }
    }
}

function preChat(user,room,chatToRoom,chatToUser,text){
    room = _.find(rooms, {roomId: room._id});
    var player = _.find(room.players, ['user._id', user._id]);
    if (_.startsWith(text, '!money')) {
        chatToUser("$" + player.money);
        return false;
    }
    else if (_.startsWith(text, '!setMode')) {
        if (user.hasPermission('Room Admin')) {
            var mode = text.substr('!setMode'.length + 1);
            if (_.keys(modes).indexOf(mode) === -1) {
                chatToUser('Invalid mode')
            } else {
                room.mode = mode;
                chatToRoom('mode set to: ' + mode);
            }
        }
        else {
            chatToUser("You don't have permission to do this!");
        }
        return false;
    }
    if(room && room.mode){
        var mode = modes[room.mode];
        if(mode.preChat)
           return mode.preChat(user, player, room, chat, chatToRoom, chatToUser);
    }

}



function init() {
    Room.find({bots: {"$elemMatch": {name: "gamble"}}}).then(function (roomResults) {
        roomResults.forEach(function (room) {
            chat.on('enterRoom', room._id, function (user, chatToRoom, chatToUser) {
                userEnterRoom(user, room);
            });
            chat.on('exitRoom', room._id, function (user, chatToRoom) {
                userExitRoom(user, room);
            });
            chat.on("chat", room._id, function (user, chatToRoom, chatToUser, text) {
                chatInduction(user, room, text, chatToRoom, chatToUser);
            });

            chat.on('preChat', room._id,function (user, chatToRoom, chatToUser, text) {
                return preChat(user,room,chatToRoom,chatToUser,text);
            });
        });
    });
    Room.find({}).then(function(roomResults){
        var players = [];
        roomResults.forEach(function (room) {
            chat.on('enterRoom', room._id, function (user, chatToRoom, chatToUser) {
                playerModel.findOne({user:user._id},'tokens user').then(function(result){
                    if(!result){
                        var player = new playerModel({
                            user:user._id,
                            stats:{
                                level:1,
                                strength:_.random(1, 10),
                                intelligence:_.random(1, 10),
                                constitution:_.random(1, 10),
                                wisdom:_.random(1, 10),
                                dexterity:_.random(1, 10),
                                agility:_.random(1, 10),
                                BEN:_.random(1, 3)
                            }
                        });
                        player.save();
                        result = player;
                    }
                    if(!_.find(players,{_id:result._id})){
                        players.push(result);
                    }
                });
            });
            chat.on('exitRoom', room._id, function (user, chatToRoom) {
                players = _.reject({user:user._id});
            });
            chat.on("preChat", room._id, function (user, chatToRoom, chatToUser, text) {
                if(text==="!tokens"){
                    playerModel.findOne({user:user._id},'tokens user').then(function(result){
                        if(result)
                        chatToUser(result.tokens);
                    });
                    return false;
                }
            });


        });
        setInterval(function(){
            var ids = _.map(players,'_id');
            playerModel.update({_id:{$in:ids}},{$inc:{tokens:1}},{multi:true}).then();
        },1000*60 *10);//every 10 minutes
    });
}


module.exports.init = init;
