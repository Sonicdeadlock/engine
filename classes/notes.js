/**
 * Created by alexthomas on 9/21/16.
 */
var _ = require('lodash');
var db = require('../db');
var Note = require('../models/note');
var NoteDir = require('../models/note_dir');

function createNewNote(user,note){
    note.owner = user._id;
    note.createTime = Date.now();
    note.lastUpdateTime = Date.now();
    if(!note.parent){
        return NoteDir.findOne({owner:user,parent:undefined}).then(function(result){
            if(result)
             return result;
            return (new NoteDir({owner:user._id}).save())
        },function(err){console.error(err);}).then(function(dir){
            note.parent = dir;
            return (new Note(note)).save();
        },function(err){console.error(err);});
    }else{
        return (new Note(note)).save();
    }
}

function updateNoteBody(noteId,body){
    return Note.findById(noteId).then(function(note){
        if(!note){
            throw "Invalid note ID";
        }else{
            note.lastUpdateTime = Date.now();
            note.body = body;
            return note.save();
        }
    })
}

function updateNoteTitle(noteId,title){
    return Note.findById(noteId).then(function(note){
        if(!note)
            throw "Invalid note ID";
        else{
            note.lastUpdateTime = Date.now();
            note.title = title;
            return note.save();
        }
    });
}

function getByUser(userId){
    return Note.find({owner:userId});
}

module.exports = {
    createNewNote:createNewNote,
    updateNoteBody:updateNoteBody,
    updateNoteTitle:updateNoteTitle,
    getByUser:getByUser
};