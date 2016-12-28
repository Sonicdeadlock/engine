/**
 * Created by alexthomas on 4/14/16.
 */
var _ = require('lodash');
var uid = require('uid');
var db = require('../db');
var token = require('../models/token');
var content = require('../models/content');
var Room = require('../models/room');
var chat = require('../chat');

var rooms = [];
var hangmanParts = [
    '<img class="hangman-image" src="/images/hangman/0.png"alt="Missing Image"></img>',
    'Your hangman now has a head <img class="hangman-image" src="/images/hangman/1.png"alt="Missing Image"></img>',
    'Your hangman now has a body <img class="hangman-image" src="/images/hangman/2.png"alt="Missing Image"></img>',
    'Your hangman now has a right arm <img class="hangman-image" src="/images/hangman/3.png"alt="Missing Image"></img>',
    'Your hangman now has a left arm <img class="hangman-image" src="/images/hangman/4.png"alt="Missing Image"></img>',
    'Your hangman now has a right leg <img class="hangman-image" src="/images/hangman/5.png"alt="Missing Image"></img>',
    'Your hangman now has a left leg <img class="hangman-image" src="/images/hangman/6.png"alt="Missing Image"></img>',
    'Your hangman now has a right hand <img class="hangman-image" src="/images/hangman/7.png"alt="Missing Image"></img>',
    'Your hangman now has a left hand <img class="hangman-image" src="/images/hangman/8.png"alt="Missing Image"></img>',
    'Your hangman now has a right foot <img class="hangman-image" src="/images/hangman/9.png"alt="Missing Image"></img>',
    'Your hangman now has a left foot <img class="hangman-image" src="/images/hangman/10.png"alt="Missing Image"></img>'
];

function setWord(room, word, cb) {
    var matchedRoom = _.find(rooms, {roomId: room._id});
	var message = "New hangman word set!<br/>"+prepareWord([], word);
    if (!matchedRoom) {
        matchedRoom = {
            roomId: room._id
        };
        rooms.push(matchedRoom);
        if (cb)
            cb(message);
    } else {
        if (cb)
            cb(message);
        else
            matchedRoom.mostRecentRoomCallback(message);
    }
    matchedRoom.strikes = 0;
    matchedRoom.word = word;
    matchedRoom.guessedLetters = [];
}

function chatInduction(user, room, chat, roomChatCallback, userChatCallback) {
    var matchedRoom = _.find(rooms, {roomId: room._id});
    if (matchedRoom) {
        matchedRoom.mostRecentRoomCallback = roomChatCallback;
    }
    if (_.startsWith(chat, '!setWord')) {
        if (user.hasPermission('hangman')) {
            var tkn = {
                token: uid(36),
                type: 'hangman',
                tokenData: {
                    userId: user._id,
                    room: {_id: room._id}
                }
            };
            (new token(tkn)).save().then(function () {
                userChatCallback('<a href="/#/hangmanSetWord?token=' + tkn.token + '" target="_blank">Click Here to set the word</a>')
            });
        }
        else {
            userChatCallback("You don't have permission to set the hangman word.");
        }


    }
    else if (_.startsWith(chat, '!random')) {
        content.count({type: 'hangmanWord'}).exec().then(function (count) {
            content.findOne({type: 'hangmanWord'}).skip(_.random(count - 1)).then(function (result) {
                setWord(room, result.content.trim(''), roomChatCallback);
            });
        });

    }
    else if (_.startsWith(chat, '!commands')) {
        roomChatCallback("Hangman Commands are:" +
            "<br>!setWord" +
            "<br>!random" +
            "<br>!guess {character}" +
            "<br>!commands")
    }
    else {
        if (_.startsWith(chat, '!guess ')) {
            if (!matchedRoom || !matchedRoom.word) {
                userChatCallback('There is no word set!');
            }
            else {
                var character = chat.substr('!guess '.length);
                if (_.lowerCase(character) === _.lowerCase(matchedRoom.word)) {
                    matchedRoom.guessedLetters = _.union(matchedRoom.guessedLetters, character.split(''));
                    var chat = character;
                    roomChatCallback(chat);
                }
                else if (character.length > 1) {
                    userChatCallback('Please only guess one character');
                }
                else if (character.length < 1) {
                    userChatCallback('Please guess one character');
                }
                else {
                    guessLetter(matchedRoom, character, roomChatCallback);
                }
            }

        }
    }

}

function guessLetter(room, letter, roomChatCallback) {
    if (room.guessedLetters.indexOf(letter) != -1) {
        roomChatCallback('Please guess a letter that hasn\'t been guessed yet.')
    }
    else {
        room.guessedLetters.push(_.lowerCase(letter));
        var preparedWord = prepareWord(room.guessedLetters, room.word);
        var guessedLetters = '[ ' + room.guessedLetters.join(', ') + ']';
        if (room.word.indexOf(letter) != -1) {
            var isFinishedWord = _.replace(preparedWord, '&nbsp&nbsp', ' ') == room.word;
            var chat = preparedWord;
            chat += '<br>';
            chat += isFinishedWord ? 'You finished the word!' : 'Guessed Letters:' + guessedLetters;
		if(!isFinishedWord){
           	chat += '<br>';
            	chat += hangmanParts[room.strikes];
		}
            roomChatCallback(chat);
        }
        else {
            room.strikes++;
            if (room.strikes < hangmanParts.length - 1) {
                var chat = preparedWord;
                chat += '<br>';
                chat += 'Guessed Letters: ' + guessedLetters;
                chat += '<br>';
                chat += hangmanParts[room.strikes];
                roomChatCallback(chat);
            }
            else {
                roomChatCallback('Game Over');
                room.word = undefined;
            }
        }
    }
}

function prepareWord(guessedLetters, word) {
    return _.map(word, function (char) {
        if (char == ' ')
            return '&nbsp&nbsp';
        char = _.lowerCase(char);

        if (guessedLetters.indexOf(char) == -1) {
            return ' _ ';
        } else {
            return char;
        }
    }).join('');
}

function init() {
    Room.find({bots: {"$elemMatch": {name: "hangman"}}}).then(function (roomResults) {
        roomResults.forEach(function (room) {
            chat.on('enterRoom', room._id, function (user, chatToRoom, chatToUser) {
                var matchedRoom = _.find(rooms, {roomId: room._id});
                if (!matchedRoom)
                    content.count({type: 'hangmanWord'}).exec().then(function (count) {
                        content.findOne({type: 'hangmanWord'}).skip(_.random(count - 1)).then(function (result) {
                            setWord(room, result.content.trim(''));
                        });
                    });
            });
            chat.on("chat", room._id, function (user, chatToRoom, chatToUser, text) {
                chatInduction(user, room, text, chatToRoom, chatToUser);
            });
        });
    });
}


module.exports.init = init;
module.exports.setWord = setWord;
