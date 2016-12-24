/**
 * Created by Sonicdeadlock on 5/29/2016.
 */
var _ = require('lodash');
var playerModel = require('../../models/player');

var losses = 0;
function chat(user, player, room, text, chatToRoom, chatToUser) {
    if (text === '!pull' || text.toLowerCase() === "kronk, pull the lever") {
        playerModel.findById(player._id, 'tokens').then(function (playerTokens) {
            playerTokens = playerTokens.tokens;
            if (playerTokens > 0) {//has tokens
                var chance = _.random(true);
                var winnings = 0;

                if (chance < .0001) {//jackpot
                    winnings = losses * _.random(.9, true);
                    chatToRoom(user.username + " just hit the jackpot!!!")
                } else if (chance < .1) {//normal win
                    winnings = _.random(1, 5);
                } else { //loss
                    losses++;
                }
                player.tokens = playerTokens - 1;
                player.money += winnings;
                if (winnings > 0) {
                    chatToUser("You won $" + winnings + " in the slots");
                } else {
                    chatToUser("You didn't win anything");
                }
                player.save();
            } else {
                chatToUser("You are out of tokens!");
            }
        });
    }
    else if (_.startsWith(text, '!buy')) {
        var amount = Number(text.substr(4));
        var cost = amount * 10;
        playerModel.findById(player._id, 'money').then(function (playerMoney) {
            playerMoney = playerMoney.money;
            if (playerMoney >= cost) {
                player.tokens += amount;
                player.money = playerMoney - cost;
                player.save();
                chatToUser("You just bought " + amount + " tokens for $" + cost);
            }
            else {
                chatToUser("You don't have enough money to buy that many tokens");
            }
        })
    } else if (text === '!price') {
        chatToUser('The price of a token is $10')
    }
}

module.exports.chat = chat;