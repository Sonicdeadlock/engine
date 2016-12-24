/**
 * Created by alexthomas on 1/2/16.
 */
var db = require('../db');
var _ = require('lodash');
var messageModel = require('../models/message');
var message = db.model('message');


var exports = module.exports;
var failRespond = function (res) {
    res.status(500).send("failure to respond error")
};
exports.create = function (req, res) {
    var body = req.body;
    if (!(body.toUser && body.body)) {
        res.status(412).send();
    } else {
        var newMessage = {};
        newMessage.toUser = body.toUser;
        newMessage.fromUser = req.user._id;
        newMessage.body = body.body;
        newMessage.title = body.title;
        newMessage.replyBody = body.replyBody;
        var m = new message(newMessage);
        m.save(function (err, data) {
            if (err) res.send(err);
            else res.status(201).send();
        });

    }
};

exports.get = function (req, res) {
    var messageId = req.params.id;
    var userId = req.user._id;
    var query = {};
    if (req.user.hasPermission('violate privacy')) {
        query = {_id: messageId}
    } else {
        query = {_id: messageId, $or: [{fromUser: userId}, {toUser: userId}]}
    }
    message.findOne(query, '_id').then(function (doc) {
        if (!doc) {
            res.status(403).send();
        } else {
            message.findOne({_id: messageId})
                .populate('toUser', req.user.group.userAccess)
                .populate('fromUser', req.user.group.userAccess)
                .exec(function (err, doc) {
                    if (err) res.status(500).send(err);
                    else res.send(doc)
                })
        }
    });

};

exports.mine = function (req, res) {
    var response = {};
    message.find({
        fromUser: req.user._id,
        fromDelete: false
    }, "_id title time toUser").populate("toUser", "username").then(function (docs) {
        response.sent = docs;
        message.find({toUser: req.user._id, toDelete: false}, "_id title time fromUser read")
            .populate('fromUser', 'username')
            .then(function (docs) {
                response.received = docs;
                res.json(response);
            });
    })
};

exports.markRead = function (req, res) {
    var messageId = req.params.id || req.body.id;
    message.findOne({_id: messageId, toUser: req.user._id}, '_id').then(function (doc) {
        if (!doc) {
            res.status(403).send();
        }
        else {
            message.update({_id: messageId}, {read: true}).then(function () {
                res.status(200).send();
            });
        }
    })
};

exports.delete = function (req, res, next) {
    var messageId = req.params.id;
    var userId = req.user._id;
    message.update({_id: messageId, toUser: userId}, {toDelete: true}).then();
    message.update({_id: messageId, fromUser: userId}, {fromDelete: true}).then();
    res.status(200).send();

};

