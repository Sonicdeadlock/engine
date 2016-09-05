/**
 * Created by Sonicdeadlock on 4/1/2016.
 */
var _ = require('lodash');
var db = require('./db');
var roomModel = require('./models/chat');
var room = db.model('room');
var io = require('socket.io');

module.exports = {connect:connect,disconnect:disconnect,updateRooms:updateRooms};

function emitRooms(emitter){
    room.find({}).sort('name').then(function(results){
        results = _.map(results,function(obj){
            obj = obj.toObject();
            obj = _.omit(obj,['bans']);
            if(obj.password){
                obj = _.omit(obj,['password']);
                obj.hasPassword = true;
                return obj;
            }
            return obj;

        });
        emitter.emit('chatRooms',results);
    });
}

function updateRooms(){
    emitRooms(io);
}

function connect(socket){
    emitRooms(socket);

    socket.on('getRooms',function(){
        emitRooms(socket);
    });
}

function disconnect(socket){

}