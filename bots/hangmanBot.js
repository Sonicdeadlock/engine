/**
 * Created by alexthomas on 4/14/16.
 */
var _ = require('lodash');
var uid = require('uid');
var db = require('../db');
var tokenModel = require('../models/token');
var token = db.model('token');
var contentModel = require('../models/content');
var content = db.model('content');

var rooms = [];
var hangmanParts = [
    'Your hangman now has a head',
    'Your hangman now has a body',
    'Your hangman now has a right arm',
    'Your hangman now has a left arm',
    'Your hangman now has a right hand',
    'Your hangman now has a left hand',
    'Your hangman now has a right leg',
    'Your hangman now has a left leg',
    'Your hangman now has a right foot',
    'Your hangman now has a left foot'
];

function setWord(room,word){
    var matchedRoom = _.find(rooms,{roomId:room._id}) ;

    if(!matchedRoom){
        matchedRoom = {
            roomId:room._id
        };
        rooms.push(matchedRoom);
    }else{
        matchedRoom.mostRecentRoomCallback('New hangman word set!');
    }
    matchedRoom.strikes = 0;
    matchedRoom.word = word;
    matchedRoom.guessedLetters = [];
}

function userEnterRoom(user,room){

}

function userExitRoom(user,room){

}

function chatInduction(user,room,chat,roomChatCallback,userChatCallback){
    var matchedRoom = _.find(rooms,{roomId:room._id});
    if(matchedRoom){
        matchedRoom.mostRecentRoomCallback = roomChatCallback;
    }
    if(_.startsWith(chat,'!setWord')){
        if(user.hasPermission('hangman')){
            var tkn = {
                token:uid(36),
                type:'hangman',
                tokenData:{
                    userId:user._id,
                    room:{_id:room._id}
                }
            };
            (new token(tkn)).save().then(function(){
               userChatCallback('<a href="/#/hangmanSetWord?token='+tkn.token+'" target="_blank">Click Here to set the word</a>')
            });
        }
        else{
            userChatCallback("You don't have permission to set the hangman word.");
        }


    }
    else if(_.startsWith(chat,'!random')){
        content.count({type:'hangmanWord'}).exec().then(function(count){
            content.findOne({type:'hangmanWord'}).skip(_.random(count-1)).then(function(result){
                setWord(room,result.content.trim(''));
            });
        });

    }
    else{
        if(_.startsWith(chat,'!guess ')){
            if(!matchedRoom||!matchedRoom.word){
                userChatCallback('There is no word set!');
            }
            else{
                var character = chat.substr('!guess '.length);

                if(character.length>1){
                    userChatCallback('Please only guess one character');
                }
                else if(character.length<1){
                    userChatCallback('Please guess one character');
                }
                else{
                    guessLetter(matchedRoom,character,roomChatCallback);
                }
            }

        }
    }

}

function guessLetter(room,letter,roomChatCallback){
    if(room.guessedLetters.indexOf(letter)!=-1){
        roomChatCallback('Please guess a letter that hasn\'t been guessed yet.')
    }
    else{
        room.guessedLetters.push(_.lowerCase(letter));
        var preparedWord = prepareWord(room.guessedLetters,room.word);
        var guessedLetters = '[ '+room.guessedLetters.join(', ')+']';
        if(room.word.indexOf(letter)!=-1){
            var finishedWord = _.replace(preparedWord,'&nbsp&nbsp',' ') == room.word;
            var chat = preparedWord;
            chat += '<br>';
            chat += finishedWord?'You finished the word!':'Guessed Letters:'+guessedLetters;
            roomChatCallback(chat);
        }
        else{
            room.strikes++;
            if(room.strikes<hangmanParts.length){
                var chat = preparedWord;
                chat += '<br>';
                chat += 'Guessed Letters: '+guessedLetters;
                chat += '<br>';
                chat += hangmanParts[room.strikes];
                roomChatCallback(chat);
            }
            else{
                roomChatCallback('Game Over');
                room.word = undefined;
            }
        }
    }
}

function prepareWord(guessedLetters,word){
    return _.map(word,function(char){
        if(char == ' ')
            return '&nbsp&nbsp';
        char = _.lowerCase(char);

       if(guessedLetters.indexOf(char)==-1){
           return ' _ ';
       } else{
           return char;
       }
    }).join('');
}



module.exports.setWord = setWord;
module.exports.userEnterRoom = userEnterRoom;
module.exports.userExitRoom = userExitRoom;
module.exports.chatInduction = chatInduction;