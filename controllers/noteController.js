/**
 * Created by alexthomas on 9/22/16.
 */
var db = require('../db');
var Note = require('../models/note');
var NoteDir = require('../models/note_dir');
var notes = require('../classes/notes');
var _ = require('lodash');

function create(req,res){
    if(!req.body){
        res.status(412).send("Missing Body");
    }else{
        notes.createNewNote(req.user,req.body).then(function(note){
            res.json(note);
        },function(err){console.error(err);})
    }
}

function updateNote(req,res){
    if(!req.body){
        res.status(412).send("Missing Body");
    }else{
        if(req.body.body)
        notes.updateNoteBody(req.params.id,req.body.body)
            .then(function(note){
                res.json(note);
            },function(err){
                res.status(412).send(err);
            });
        if(req.body.title){
            notes.updateNoteTitle(req.params.id,req.body.title)
                .then(function(note){
                    res.json(note);
                },function(err){
                    res.status(412).send(err);
                });
        }
    }
}



function getNote(req,res){
    Note.findById(req.params.id).then(function(note){
        res.json(note);
    })
}

function append(req,res){
    if(!req.body){
        res.status(412).send("Missing Body");
    }
    else{
        Note.findById(req.params.id,'body').then(function(note){
            if(!note){
                res.status(412).send("Invalid note ID");
            }
            else
            notes.updateNoteBody(note._id,note.body+req.body.body).then(function(note){
                res.json(note);
            },function(err){
                res.status(500).send(err);
            });
        });
    }

}

function patchPrivate(req,res){
    Note.findById(req.params.id).then(function(note){
        if(!note)
            throw "Invalid note";
        if(note.owner != req.user._id && !req.user.hasPermission("sudo")){
            throw "Invalid user to edit this note";
        }
        if(!req.body && !_.isSet(req.body.private))
            throw "Missing Body or body components";
        note.private = req.body.private;
        return note.save();
    },function(err){console.error(err);}).then(function(note){
        res.json(note);
    },function(error){
        res.status(412).send(error);
    });
}

function patchSharedEditable(req,res){
    Note.findById(req.params.id).then(function(note){
        if(!note)
            throw "Invalid note";
        if(note.owner != req.user._id && !req.user.hasPermission("sudo")){
            throw "Invalid user to edit this note";
        }
        if(!req.body && !_.isSet(req.body.sharedEditable))
            throw "Missing Body or body components";
        note.sharedEditable = req.body.sharedEditable;
        return note.save();
    },function(err){console.error(err);}).then(function(note){
        res.json(note);
    },function(error){
        res.status(412).send(error);
    });
}

function deleteNote(req,res){
    Note.findById(req.params.id).then(function(note){
        if(note.owner != req.user._id && !req.user.hasPermission("sudo")){
            res.status(401).send();
        }else{
            Note.findByIdAndRemove(req.params.id).then(function(){
                res.send("");
            })
        }
    });


}

module.exports = {
    create:create,
    updateNote:updateNote,
    getNote:getNote,
    append:append,
    patchPrivate:patchPrivate,
    patchSharedEditable:patchSharedEditable,
    deleteNote:deleteNote
};