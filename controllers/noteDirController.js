/**
 * Created by alexthomas on 9/22/16.
 */
var db = require('../db');
var Note = require('../models/note');
var NoteDir = require('../models/note_dir');
var notes = require('../classes/notes');
var _ = require('lodash');

function getUserBase(req, res) {
    NoteDir.findOne({owner: req.user, parent: undefined}).then(function (noteDir) {
        _getDir(noteDir._id).then(function (noteDir) {
            res.json(noteDir);
        })
    });
}

function getDir(req, res) {
    _getDir(req.params.id).then(function (noteDir) {
        res.json(noteDir);
    })

}

function _getDir(id) {
    var _noteDir;
    return NoteDir.findById(id).then(function (noteDir) {
        _noteDir = noteDir;
        var getChildDirsPromise = NoteDir.find({parent: noteDir});
        var getChildNotesPromise = Note.find({parent: noteDir});
        return Promise.all([getChildDirsPromise, getChildNotesPromise]);
    }).then(function (results) {
        _noteDir = JSON.parse(JSON.stringify(_noteDir));
        _noteDir.dirs = results[0];
        _noteDir.notes = results[1];
        return _noteDir;
    });
}

function createDir(req, res) {
    if (!req.body || !req.body.parent)
        res.status(412).send("Invalid request");
    else {
        req.body.owner = req.user._id;
        (new NoteDir(req.body)).save().then(function (noteDir) {
            res.json(noteDir);
        });
    }

}


module.exports = {
    getUserBase: getUserBase,
    getDir: getDir,
    createDir: createDir
};

