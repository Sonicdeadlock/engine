/**
 * Created by Alex on 8/4/2016.
 */
var _ = require('lodash');
var db = require('../db');
var Room = require('../models/room');
var chat = require('../chat');

var NBSP = '\u00A0';
var LETTERS = ['A','B','C','D','E','F','G','H','I','J'];
var NUMBERS = [NBSP+'1',NBSP+'2',NBSP+'3',NBSP+'4',NBSP+'5',NBSP+'6',NBSP+'7',NBSP+'8',NBSP+'9','10'];
var SHIPS = [
    {
        type:"Aircraft carrier",
        alias:"a",
        size:5
    },
    {
        type:"Battleship",
        alias:"b",
        size:4
    },
    {
        type:"Submarine",
        alias:"s",
        size:3
    },
    {
        type:"Destroyer",
        alias:"d",
        size:3
    },
    {
        type:"Patrol Boat",
        alias:"p",
        size:2
    }
];

function init(){
    Room.find({bots:{"$elemMatch":{name:"battleship"}}}).then(function(roomResults){
        roomResults.forEach(function(room){
            //room init
            room.players = [];
            room.currentPlayerIndex=0;
            //hook init
            chat.on('enterRoom',room._id,function(user,chatToRoom,chatToUser){
               chatToUser("WARNING: Battleship is not suitable for mobile devices. YOU HAVE BEEN WARNED!")
            });
            chat.on("chat",room._id,function(user,chatToRoom,chatToUser,text){
                chatInduction(user,room,text,chatToRoom,chatToUser);
            });
            chat.on("preChat",room._id,function(user,chatToRoom,chatToUser,text){
              return preChat(user,room,text,chatToUser,chatToRoom);
            });
        });
    });
}

function chatInduction(user,room,text,chatToRoom,chatToUser){

    if(text === '!status')
        sendStatus(chatToRoom,room);
    else if(text === "!join")
        joinGame(user,room,chatToRoom,chatToUser);
    else if(text==='!instructions' || text==="!help"){
        var instructions = [
            'The goal of the game is to sink the other players ships',
            'Start by joining the game with <pre>!join</pre> There can only be two players at a time',
            'Once you are a player you can start placing your ships. The game can\'t start until both players have placed all their ships',
            'The ships are as follows:'
        ];
        SHIPS.forEach(function(ship){
          instructions.push(ship.type+"("+ship.alias+") size:"+ship.size);
        });
        instructions.push("You can place a ship with <pre>!place [ship alias] [start coordinate] [end coordinate]</pre>");
        instructions.push("Examples:");
        instructions.push("<pre>!place b b2 b6</pre><pre>!place p h3 i3</pre>");
        instructions.push("You can not place a ship diagonally");
        instructions.push("If you place a ship you've already placed it will be moved");
        instructions.push("Once you are ready and have placed all your ships you can run <pre>!ready</pre> after this point you won't be able to move your ships.");
        instructions.push("In order to attack run <pre>!attack [coordinate]</pre>");

        chatToRoom(instructions.join("<br>"));
    }

}

function joinGame(user,room,chatToRoom,chatToUser){

    if(room.players.length<2){
        if(room.players.length==1 && room.players[0]._id == user._id){
            chatToUser("You can't be both players in the game...");
            return false;
        }else{
            user.grid = [];
            for(var x in LETTERS){
                user.grid[x] = [];
                for(var y in NUMBERS){
                    user.grid[x][y] = {};
                }
            }
            user.ships = [];
            user.ready = false;
            room.players.push(user);
            chatToUser('You join the match');

           sendStatus(chatToRoom,room)
        }
    }else{
        chatToUser('There are already two people playing.');
        return false;
    }
}

function sendStatus(chatFunction,room){
    switch (room.players.length){
        case 0:
            chatFunction("There are no players. Waiting for two more");
            break;
        case 1:
            chatFunction(room.players[0].username+" is waiting for a second player");
            break;
        case 2:
        {
            var unreadyPlayers = _.filter(room.players,function(o){return !o.ready});
            if(unreadyPlayers.length>0){
                chatFunction('Waiting on '+ _.map(unreadyPlayers,'username').join(' and ')+'to place their ships')
            }
            else{
                chatFunction(room.players[0].username+" and "+room.players[1].username+" are currently playing")
            }
            break
        }

    }
}

function preChat(user,room,text,chatToUser,chatToRoom){
    //let the users place their ships and
    var playerIndex = getPlayerIndex(room.players,user);
    if(text === '!board'){
        if(room.players.length==2 || playerIndex!==-1){
            var board1,board2,concatBoard=[];
            if(playerIndex!==-1){
                board1 = makeBoard(room.players[playerIndex].grid);
                board2 = makeBoard(room.players[playerIndex==0?1:0].grid,true);
            }else{
                 board1 = makeBoard(room.players[0].grid);
                 board2 = makeBoard(room.players[1].grid);
            }
            for(var index in board1){
                var row1 = board1[index];
                var row2 = board2[index];
                concatBoard[index] = row1 + NBSP+NBSP+NBSP+NBSP+'|'+NBSP+'|'+NBSP+NBSP+NBSP+NBSP + row2;
            }
            concatBoard.forEach(function(line){
                chatToUser(line);
            })
        }else{
            chatToUser("There is no game in session");
        }
        return false;
    }
    else if(_.startsWith(text,'!place')){
        if(playerIndex===-1){
            chatToUser("You are not a player!");
        }else{
            var parts =text.split(' ');
            if (parts.length!==4){
                chatToUser("Invalid input!")
            }else{
                var ship=_.find(SHIPS,['alias',parts[1]]);
                if(!ship || ship===-1){
                    chatToUser("Invalid Ship");
                }else{
                    if(parts[2].length!==2 || parts[3].length!==2){
                        chatToUser("Invalid coordinates");
                    }else{
                        var response = place(room.players[playerIndex],ship,parts[2],parts[3]);
                        if(response)
                            chatToUser(response);
                        else
                            chatToUser("Placed Ship");
                    }
                }
            }
        }
        return false;
    }
    else if(text==='!ready'){
        if(playerIndex===-1){
            chatToUser("You are not a player!");
        }
        else{
            var result = ready(room.players[playerIndex]);
            if(result){
                chatToUser(result);
            }else{
                chatToRoom("Player "+user.username+" is ready");
            }
        }
        return false;
    }
    else if(_.startsWith(text,'!attack')){
        if(playerIndex===-1){
            chatToUser("You are not a player");
            return false;
        }else{
            if(room.currentPlayerIndex!=playerIndex){
                chatToUser("It's not your turn!");
                return false;
            }else{
                var parts = text.split(' ');
                if(parts.length!==2){
                    chatToUser("Invalid coordinates");
                    return false;
                }else{
                    var result = attack(room.players[playerIndex==0?1:0],parts[1]);
                    if(result.success){
                        setTimeout(chatToRoom.bind(this,result.response),20);//delay to let the user's chat go first
                        room.currentPlayerIndex = playerIndex==0?1:0;
                    }else{
                        chatToUser(result.response);
                        return false;
                    }
                }
            }
        }
    }
}

function makeBoard(grid,masked){
    var board = [];
    var floorRow = NBSP+NBSP+NBSP;
    var line = NBSP+NBSP+NBSP+NBSP;
    for(var i in LETTERS){
        floorRow+="_ ";
    }
    line+=LETTERS.join('|');
    board.push(line);line='';
    board.push(floorRow);
    
    for(var y in NUMBERS){
        line+=NUMBERS[y];
        line+='|';
        for(var x in LETTERS){
            if(grid[x][y].hit){
                line+='h';
            }
            else if(grid[x][y].miss){
                line+='m';
            }
            else if(grid[x][y].ship && !masked){
                line+=grid[x][y].ship;
            }
            else{
                line+=' ';
            }
            line+='|';
        }

        board.push(line);line='';
        // board.push(floorRow);
    }
    return board;
    
}

function getPlayerIndex(players, user){
    for(var index in players){
        if(players[index]._id === user._id)
            return index;
    }
    return -1;
}

function place(player,ship,start,end){
    var startX = letterToCoord(start[0]);
    var startY = Number(start[1])-1;//minus one because the grid starts at 1

    if(!_.isFinite(startX) || !_.isFinite(startY))
        return "Invalid start";

    var endX = letterToCoord(end[0]),
        endY = Number(end[1])-1;
    if(!_.isFinite(endX) || !_.isFinite(endY))
        return "Invalid end";

    if((startX!==endX) && (startY!==endY))
        return "Can not be diagonal";
    var distance =0;

    if(startX!==endX){
        distance = Math.abs(startX-endX)+1;//plus one to account for the first cell that is taken up
    }
    else{
        distance = Math.abs(startY-endY)+1;
    }

    if(distance!==ship.size)
        return "Invalid size";

    ship = _.clone(ship);
    ship.startX = startX<endX?startX:endX;
    ship.endX = startX>endX?startX:endX;
    ship.startY = startY<endY?startY:endY;
    ship.endY = startY>endY?startY:endY;
    var shipIndex = _.findIndex(player.ships,['type',ship.type]);
    if(shipIndex!==-1){
        player.ships.splice(shipIndex,1);
    }
    player.ships.push(ship);
    player.grid.forEach(function(row){
        row.forEach(function(cell){
            cell.ship = undefined;
        });
    });
    player.ships.forEach(function(ship){
        for(var x=ship.startX;x<=ship.endX;x++){
            for(var y=ship.startY;y<=ship.endY;y++){
                player.grid[x][y].ship=ship.alias;
            }
        }
    });


}

function ready(player){
    if(player.ships.length !== SHIPS.length){
        var missing = _.filter(SHIPS,function(ship){
            return _.findIndex(player.ships,['type',ship.type])===-1;
        });
        return "Missing "+_.map(missing,'type').join(',');
    }

    player.ready=true;
}

function attack(player,coord){
    var x = letterToCoord(coord[0]);
    var y = Number(coord[1]);
    if(!(_.isFinite(x)&&_.isFinite(y)))
        return {response:"Invalid position",success:false};
    if(player.grid[x][y].hit || player.grid[x][y].miss)
        return {response:"You've already attacked this position",success:false};
    if(player.grid[x][y].ship)
    {
        player.grid[x][y].hit=true;
        var response = "Hit!";
        player.ships.forEach(function (ship) {
            if(_.inRange(x,ship.startX,ship.endX+1) && _.inRange(y,ship.startY,ship.endY+1)){
                ship.hits+=1;
                if(ship.hits==ship.size){
                    response+=" You sunk my "+ship.type;
                }
            }
        });
        return {response:response,success:true};
    }
    player.grid[x][y].miss = true;
    return {response:"Miss!",success:true};
}

function letterToCoord(letter){
    for(var index in LETTERS){
        if(LETTERS[index] === letter.toUpperCase())
            return Number(index);
    }
}

module.exports.init = init;

