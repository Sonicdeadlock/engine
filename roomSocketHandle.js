/**
 * Created by Sonicdeadlock on 4/1/2016.
 */
var _ = require('lodash');
var db = require('./db');
var roomModel = require('./models/chat');
var room = db.model('room');
var io = require('socket.io');

module.exports = {connect:connect,disconnect:disconnect};
function connect(socket){
    room.find({}).then(function(results){
        socket.emit('chatRooms',results);
    });
    var user = socket.client.request.user;
    socket.on('addRoom',function(roomData){
        if(user.hasPermission('Room Admin')){
            (new room(roomData)).save().then(function(){
                room.find({}).then(function(results){
                    io.emit('chatRooms',results);
                });
            })
        }
    });
    socket.on('deleteRoom',function(roomId){
        room.findOne({_id:roomId}).then(function(result){
            if(result){
                if(user.hasPermission('Room Admin') && (result.deleteable || user.hasPermission('god'))){
                    room.findOneAndRemove({_id:roomId}).then(function(){
                        room.find({}).then(function(results){
                            io.emit('chatRooms',results);
                        });
                    })
                }
            }
        })
    });
}

function disconnect(socket){

}