/**
 * Created by alexthomas on 4/17/16.
 */
var db = require('../db');
var _ = require('lodash');
var roomModel = require('../models/room');
var room = db.model('room');
var roomSocketHandle = require('../roomSocketHandle');

function create(req,res){
    var user = req.user;
    if(user.hasPermission('Room Admin')){
        (new room(req.body).save()).then(function(){//resolve
            roomSocketHandle.updateRooms();
        },
        function(error){//reject
            console.error(error);
            res.status(500).send('There was an error saving the room');
        })
    }else{
        res.status(403).send('Invalid Authorization')
    }
}


function remove(req,res){
    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findOneAndRemove({_id:req.body._id}).then(function(){
            roomSocketHandle.updateRooms();
            res.status(200).send();
        })
    }else{
        res.status(403).send('Invalid Authorization')
    }

}

function get(req,res){
    room.find({}).then(function(rooms){
        res.json(rooms);
    })
}

function addBot(req,res){
    var id = req.body.id,
        bot = req.body.bot;
    
        var user = req.user;
        if(user.hasPermission('Room Admin')){
            room.findByIdAndUpdate(id,{bots:{$push:{name:bot}}}).then(function(){
                res.status(200).send();
                roomSocketHandle.updateRooms();
            },function(error){console.error(error);});
        }else{
            res.status(403).send('Invalid Authorization')
        }
    
}

function removeBot(req,res){
    var id = req.body.id,
        bot = req.body.bot;

    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findByIdAndUpdate(id,{bots:{$pop:{name:bot}}}).then(function(){
            res.status(200).send();
            roomSocketHandle.updateRooms();
        },function(error){console.error(error);});
    }else{
        res.status(403).send('Invalid Authorization')
    }
}

function removeBan(req,res){
    var id = req.body.id,
        ban = req.body.ban;

    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findByIdAndUpdate(id,{bans:{$pop:ban}}).then(function(){
            res.status(200).send();
            roomSocketHandle.updateRooms();
        });
    }else{
        res.status(403).send('Invalid Authorization')
    }
}

function changeDescription(req,res){
    var id = req.body.id,
        description = req.body.description;

    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findByIdAndUpdate(id,{description:description}).then(function(){
            res.status(200).send();
            roomSocketHandle.updateRooms();
        });
    }else{
        res.status(403).send('Invalid Authorization')
    }
}

function changeName(req,res){
    var id = req.body.id,
        name = req.body.name;

    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findByIdAndUpdate(id,{name:name}).then(function(){
            res.status(200).send();
            roomSocketHandle.updateRooms();
        });
    }else{
        res.status(403).send('Invalid Authorization')
    }
}

function changePassword(req,res){
    var id = req.body.id,
        password = req.body.password;

    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findByIdAndUpdate(id,{password:password}).then(function(){
            res.status(200).send();
            roomSocketHandle.updateRooms();
        });
    }else{
        res.status(403).send('Invalid Authorization')
    }
}

function changeOptions(req,res){
    var id = req.body.id,
        options = req.body.options;

    var user = req.user;
    if(user.hasPermission('Room Admin')){
        room.findByIdAndUpdate(id,{options:options}).then(function(){
            res.status(200).send();
            roomSocketHandle.updateRooms();
        });
    }else{
        res.status(403).send('Invalid Authorization')
    }
}


module.exports.create = create;
module.exports.remove = remove;
module.exports.get = get;

module.exports.addBot = addBot;
module.exports.removeBot = removeBot;
module.exports.removeBan = removeBan;
module.exports.changeDescription = changeDescription;
module.exports.changeName = changeName;
module.exports.changePassword = changePassword;
module.exports.changeOptions = changeOptions;