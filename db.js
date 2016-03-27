/**
 * Created by Sonicdeadlock on 7/21/2015.
 */
var config = require('./config');
var mongoose = require('mongoose');

module.exports = mongoose.connect(config.db.host + config.db.name)
    .connection
    .on('error', function(err){
        console.log(err);
    })
    .once('open', function(callback){
        console.log('mongodb:', config.db.host + config.db.name);

        if(callback){
            callback();
        }
    });