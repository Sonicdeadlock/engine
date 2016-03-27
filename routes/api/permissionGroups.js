var express = require('express');
var router = express.Router();
var db = require('../../db');
var config = require('../../config');

var userModel = require('../../models/user');
var user = db.model('user');
var permissionGroupModel = require('../../models/permissionGroup');
var permissionGroup = db.model('permissionGroup');

router.route('/')
    .post(function(req,res){
        if(!(req.session.user)){
            res.status(403).send('Forbidden. Authentication required!');
        }else if(!user.hasPermission(req.user,'Group Admin')){
            res.status(403).send('Forbidden. Authorization required!');
        }else{
            function save(){
                var g= new permissionGroup(req.body);
                g.save()
                    .then(function(){
                        res.status(200).send();
                    });
            }
            if(req.body.default){
                permissionGroup.findOne({default:true},'default')
                    .then(function(group){
                        group.default = false;
                        group.save();
                        save();
                    });
            }else{
                save();
            }
        }
    })
    .put(function(req,res){
        if(!(req.user)){
            res.status(403).send('Forbidden. Authentication required!');
        }else if(!user.hasPermission(req.user,'Group Admin')){
            res.status(402).send('Forbidden. Authorization required!');
        }else{
            function update(){
                permissionGroup.update({_id:req.body._id},req.body)
                    .then(function(modified){
                        res.status(200).send();
                    });
            }
            if(req.body.default){
                permissionGroup.findOne({default:true},'default')
                    .then(function(group){
                        if(group) {
                            group.default = false;
                            group.save();
                        }
                        update();
                    });
            }else{
                update();
            }
        }
    })
    .get(function(req,res){
        permissionGroup.find({})
            .then(function(groups){
                res.json(groups);
            })
    });
router.route('/:id')
    .get(function(req,res){
        permissionGroup.find({_id:req.params.id}).then(function(group){
            if(group) res.json(group);
            else res.status(404).send("Group not found");
        })
    })
    .delete(function(req,res){
        if(!(req.user)){
            res.status(403).send('Forbidden. Authentication required!');
        }else if(!user.hasPermission(req.user,'Group Admin')){
            res.status(403).send('Forbidden. Authorization required!');
        }else{
            permissionGroup.findByIdAndRemove(req.params.id).then(function(){
                res.status(200).send();
            },function(){
                res.status(500).send();
            });

        }
    });


module.exports = router;

