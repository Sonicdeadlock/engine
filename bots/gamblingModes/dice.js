/**
 * Created by Sonicdeadlock on 5/29/2016.
 */
var _ = require('lodash');

function chat(user, player, room, chat, roomChatCallback, userChatCallback){
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

module.exports.chat = chat;