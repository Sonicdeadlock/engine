/**
 * Created by alexthomas on 4/11/16.
 */
var _ = require('lodash');
var db = require('../db');
var playerSchema = require('../models/player');
var playerModel = db.model('player');
var Room = require('../models/room');
var chat = require('../chat');


var rooms = [];
var battleStatuses = {
    1: "There is no battle in progress",
    2: "There is a battle pending, player one is ready",
    3: "A battle is in progress;"
};

function userEnterRoom(user, room) {//required to be exposed
    var matchedRoom = _.find(rooms, {roomId: room._id});
    if (!matchedRoom) {
        var newRoom = {};
        newRoom.roomId = room._id;
        newRoom.players = [];
        matchedRoom = newRoom;
        rooms.push(newRoom);
    }
    playerModel.findOne({user: user._id}).populate('user', 'username').exec().then(function (result) {
        if (result) {
            matchedRoom.players.push(result);
        } else {
            var player = new playerModel({
                user: user._id,
                stats: {
                    level: 1,
                    strength: _.random(1, 10),
                    intelligence: _.random(1, 10),
                    constitution: _.random(1, 10),
                    wisdom: _.random(1, 10),
                    dexterity: _.random(1, 10),
                    agility: _.random(1, 10),
                    BEN: _.random(1, 3)
                }
            });
            player.save();
            matchedRoom.players.push(player);
        }
    });


}

function userExitRoom(user, room) {//required to be exposed
    var matchRoom = _.find(rooms, {roomId: room._id});
    //check if the user is in a battle
    matchRoom.players = _.reject(matchRoom.players, {_id: user._id});
}

function chatInduction(user, room, chat, roomChatCallback, userChatCallback) {
    room = _.find(rooms, {roomId: room._id});
    var player = _.find(room.players, ['user._id', user._id]);
    if (_.startsWith(chat, '!UserStats')) {
        //return user stats
        var stats = _.clone(player._doc.stats);
        stats = _.assign(stats, {
            minAttack: player.stats.minAttack,
            maxAttack: player.stats.maxAttack,
            mAtk: player.stats.mAtk,
            critical: player.stats.critical,
            HP: player.stats.HP,
            SP: player.stats.SP,
            HDef: player.stats.HDef,
            SDef: player.stats.SDef,
            hit: player.stats.hit,
            flee: player.stats.flee
        });
        var statsString = '';
        _.forOwn(stats, function (value, key) {
            statsString += key + ":" + value + '<br>';
        });
        roomChatCallback(statsString);
    } else if (_.startsWith(chat, '!GameStatus')) {
        roomChatCallback(getBattleStatus(room));
    }
    else { //check for a combat related command
        if (_.startsWith(chat, '!Duel')) {
            if (getBattleStatusId(room) != 1) {
                userChatCallback('A battle can not be initialized at this time.');
            } else {
                room.battle = {};
                var parts = chat.split(' ');
                if (parts.length == 1) {
                    roomChatCallback('Batlle initialized, waiting for opponent.');
                    room.battle.playerOne = _.find(room.players, ['user._id', user._id]);
                } else {
                    var otherPlayer = _.find(room.players, {user: {username: parts[1]}});
                    if (!otherPlayer) {
                        userChatCallback('Could not find a user with that Username in this room.');
                    } else {
                        room.battle.challangedPlayer = otherPlayer;
                        room.battle.playerOne = player;
                        roomChatCallback(user.username + ' challanged ' + otherPlayer.user.username + ' to battle');
                    }
                }
            }
        }
        if (_.startsWith(chat, '!Accept')) {
            if (room.battle.challangedPlayer) {
                if (room.battle.challangedPlayer == player) {
                    room.battle.playerTwo = player;
                    roomChatCallback('Battle Start')
                } else {
                    userChatCallback('You are not the player that was challenged...');
                }
            } else {
                room.battle.playerTwo = player;
                roomChatCallback('Battle Start')
            }
        }
        if (_.startsWith(chat, '!Decline')) {
            if (getBattleStatusId(room) == 1) {
                userChatCallback('There is no battle to decline');
            } else {
                if (room.battle.challangedPlayer == player) {
                    room.battle = {};
                    roomChatCallback('Battle Declined');
                } else {
                    userChatCallback('You are not the player that was challenged...');
                }
            }
        }
        if (_.startsWith(chat, '!flee' || _.startsWith(chat, '!die'))) {
            roomChatCallback('The battle is over');
            room.battle = undefined;
        }

    }
}

function getBattleStatusId(room) {
    if (!room.battle || room.battle === {}) {
        return 1;
    } else if (room.battle.playerOne && !room.battle.playerTwo) {
        return 2;
    } else {
        return 3;
    }
}

function getBattleStatus(room) {
    var statusId = getBattleStatusId(room);
    var status = battleStatuses[statusId];
    if (statusId == 3) {
        status += room.battle.playerOne.user.username + ' & ' + room.battle.playerTwo.user.username + ' are playing';
    }
    return status;

}


function init() {
    Room.find({bots: {"$elemMatch": {name: "basic"}}}).then(function (roomResults) {
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
        });
    });
}


module.exports.init = init;