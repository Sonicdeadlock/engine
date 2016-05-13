/**
 * Created by alexthomas on 5/10/16.
 */
var _ = require('lodash');
var db = require('../db');
var playerSchema = require('../models/player');
var playerModel = db.model('player');


var rooms = [];

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

function chatInduction(user,room,chat,roomChatCallback,userChatCallback){
    room = _.find(rooms,{roomId:room._id});
    var player = _.find(room.players,['user._id',user._id]);
    if(_.startsWith(chat,'!money')){
        userChatCallback("$"+player.money)
    }
    else if(_.startsWith(chat,'!setMode')){
        if(user.hasPermission('Room Admin')){
            var mode = chat.substr('!setMode'.length+1);
            if(_.keys(modes).indexOf(mode)===-1){
                userChatCallback('Invalid mode')
            }else{
                room.mode = mode;
                roomChatCallback('mode set to: '+mode);
            }
        }
        else{
            userChatCallback("You don't have permission to do this!");
        }
    }
    else if(_.startsWith(chat,'!commands')){
        var commands = _.union(['!money','!setMode','!commands','!bet'], _.keys(modes));
        roomChatCallback('Gambling bot commands:<br>'+commands.join('<br>'));
    }
    else{
        if(!room.mode){
            userChatCallback('Mode not set, please speak to a room admin');
        }else{
            modes[room.mode](user,player,room,chat,roomChatCallback,userChatCallback);
        }
    }
}

module.exports.userEnterRoom = userEnterRoom;
module.exports.userExitRoom = userExitRoom;
module.exports.chatInduction = chatInduction;


var modes = {
  dice:function(user,player,room,chat,roomChatCallback,userChatCallback){
      if(_.startsWith(chat,'!bet')){
          var pieces = chat.split(' ');
          var bet = Number(pieces[1]);
          if(!bet || bet<1 || bet>player.money){
              userChatCallback('invalid bet')
          }
          else if( _.toLower(pieces[2]) === 'even' || _.toLower(pieces[2]) === 'odd'){
              var value = _.random(1,20);
              var winnings = _.floor(bet/2);
              if(_.toLower(pieces[2]) === 'even' && value%2===0){
                  roomChatCallback("Rolled: "+value+" "+user.username+" won $"+winnings);
                  player.money+=winnings;
                  player.save();
              }else if(_.toLower(pieces[2]) === 'odd' && value%2===1){
                  roomChatCallback("Rolled: "+value+" "+user.username+" won $"+winnings);
                  player.money+=winnings;
                  player.save();
              }else{
                  roomChatCallback("Rolled: "+value+" "+user.username+" lost $"+bet);
                  player.money-=bet;
                  player.save();
              }
          }
          else{
              var numberBetOn = Number(pieces[2]);
           if(!numberBetOn || numberBetOn<=0 || numberBetOn>20){
                  userChatCallback('invalid number to bet on')
              }else{
                  var value = _.random(1,20);
                    var winnings = bet*5;
                  if(value===numberBetOn){
                      roomChatCallback("Rolled: "+value+" "+user.username+" won $"+winnings);
                      player.money+=winnings;
                      player.save();
                  }else{
                      roomChatCallback("Rolled: "+value+" "+user.username+" lost $"+bet);
                      player.money-=bet;
                      player.save();
                  }
              }
          }

      }
  }
};