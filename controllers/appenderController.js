var _ = require('lodash');
var db = require('../db');
var Appender = require('../models/appender');
var Notes = require('../classes/notes');
var Note = require('../models/note');
var dateFormat = require('dateformat');

function create(req, res) {
    var appender = req.body;
    appender.owner = req.user._id;
    (new Appender(appender)).save().then(function (appender) {
        res.json(appender);
    })
}

function append(req, res) {
    Appender.findById(req.params.id).populate('note').then(function (appender) {
        if (appender.owner.equals(req.user._id)) {
            res.status(401).send();
        } else {
            formatAppenderString(appender.appendString).then(function (appendString) {
                Notes.updateNoteBody(appender.note._id, appender.note.body + appendString).then(function () {
                    res.status(200).send();
                }, function (err) {
                    console.error(err);
                    res.status(500).send("There was an error processing your request");
                });
            });
        }
    });
}

function getByUser(req, res) {
    Appender.find({owner: req.user._id}).then(function (results) {
        res.json(results);
    });
}

function formatAppenderString(appenderString) {
    return new Promise(function (resolve, reject) {
        appenderString = formatTime(appenderString);
        resolve(appenderString);
    });
}

function formatTime(appenderString) {
    appenderString = appenderString.replace(/(%T)/g, dateFormat(_.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT"));
    return appenderString;
}

module.exports = {
    create: create,
    append: append,
    getByUser: getByUser
};
