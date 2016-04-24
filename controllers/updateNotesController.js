/**
 * Created by Sonicdeadlock on 4/24/2016.
 */
var db = require('../db');
var _ = require('lodash');
var update_notesModel = require('../models/update_notes');
var update_notes = db.model('update_notes');
var userModel = require('../models/user');
var user = db.model('user');
var permissionGroupModel = require('../models/permissionGroup');
var permissionGroup = db.model('permissionGroup');

var get = function(req,res){
    var skip = req.params.skip || 0;
    var limit = req.params.limit || 10;
    if(limit>25){
        limit = 25;
    }
    update_notes.find({release_time:{$lte: _.now()}})
        .populate('user','_id username firstName lastName group')
        .sort('-release_time')
        .limit(limit)
        .skip(skip)
        .then(function(results){
            user.populate(results,{
                path:'user.group',
                select:'name',
                model:permissionGroup
            }).then(function(results){
                res.json(results);
            })
        });
};

var create = function(req,res){
  if(req.user && req.user.hasPermission('Admin')){
      var update_note = req.body;
      update_note.user = req.user._id;
      update_note.time = _.now();
      (new update_notes(req.body)).save().then(function(){
          res.status(200).send();
      })
  }  else{
      res.status(403).send('Invalid Authorization')
  }
};

var count = function(req,res){
    update_notes.find({release_time:{$lte: _.now()}}).count().then(function(count){
        res.json(count);
    })
};

module.exports.get = get;
module.exports.create = create;
module.exports.count = count;