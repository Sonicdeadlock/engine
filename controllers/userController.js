var db = require('../db');
var config = require('../config');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('lodash');

var userModel = require('../models/user');
var user = db.model('user');
var permissionGroupModel = require('../models/permissionGroup');
var permissionGroup = db.model('permissionGroup');

function hash (salt, raw) {
    return crypto.pbkdf2Sync(raw, salt, config.hash.itterations, config.hash.length).toString('base64');
}

module.exports.create = function(req,res){
    var userData = req.body;
    var errors = [];
    if(!userData.firstName)
        errors.push('no first name');
    if(!userData.lastName)
        errors.push('no last name');
    if(!userData.email)
        errors.push('no email');
    if(!userData.password)
        errors.push('no password');
    if(!(userData.password == userData.passwordAgain))
        errors.push("passwords don't match");
    if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userData.email))
    errors.push("invalid email");

    user.findOne({'username':userData.username}).then(function(obj){
        if(obj)//there is already a user with this username
        {
            errors.push('username is taken');

        }
    }).then(function(){
        if(errors.length==0){//valid user
            userData.joinDate = new Date();
            userData.salt = crypto.randomBytes(128).toString('base64');
            userData.password = hash(userData.salt, userData.password);
            permissionGroup.findOne({default:true},'_id')
            .then(function(group){
                var u = new user(userData);
                u.group = group._id;
                u.save(function(err,data){
                    if(err) res.send(err);

                    req.login(u,function(err){
                        res.json({_id:data.id});
                    });
                });
            });
        }else{
            res.status(400).json(errors);
        }
    });
};

module.exports.update = function(req,res){
    var body = req.body;
    if(!user.hasPermission(req.user,'User Admin')){
        res.status(403).send();
    }else{
        if(body.password){
            body.salt = crypto.randomBytes(128).toString('base64');
            body.password = hash(body.salt, body.password);
        }
        if(body.group && !user.hasPermission(req.user,'User Admin')){
            delete body.group;
        }
        user.findOne({'username':body.username}).then(function(obj){
            if(obj && obj.id !== body._id)//there is already a user with this username
            {
                res.status(400).send('Username taken');

            }else{
                user.update({_id:body._id},body,function(err,numModified){
                    if(err) console.error(err);
                    res.status(200).send();
                });

            }
        });

    }
};

module.exports.updateSelf = function(req,res){
    var body = req.body;
    if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(body.email)){
        res.status(400).send('invalid email');
    }
    else{
        if(body.password){
        body.salt = crypto.randomBytes(128).toString('base64');
        body.password = hash(body.salt, body.password);
    }
    if(body.group){
        delete body.group;
    }
    user.findOne({'username':body.username}).then(function(obj){
            if(obj && obj.id !== body._id)//there is already a user with this username
            {
                res.status(400).send('Username taken');

            }else{
                user.update({_id:req.user._id},body,function(err,numModified){
                    if(err) console.error(err);
                    res.status(200).send();
                });

            }
        });
    }
};

module.exports.get = function(req,res){
    if(!(req.user && user.hasPermission(req.user,'User Admin'))){
        res.status(403).send("Unauthorized");
    }else{
        user.find({},req.user.group.userAccess)
        .populate('group')
        .exec(function(err,users){
            res.json(users);
        })
    }
};

module.exports.login = function(req,res,next){
    passport.authenticate('local',function(err,user,info){
        if(err || !user){
            res.status(400).send(info);
        }
        else{
            user.password = undefined;
            user.salt = undefined;

            req.login(user,function(err){
                if(err) {
                    res.status(400).send(err);
                }
                else{
                    res.json(user);
                }
            })
        }
    })(req,res,next);
};

module.exports.logout = function(req,res){
    req.logout();
    res.send();
};

module.exports.self = function(req,res){
    module.exports.requiresLogin(req,res,function(){
        var clone = JSON.parse(JSON.stringify(req.user));
        clone.salt = undefined;
        clone.password = undefined;
        res.json(clone);
    })

};


/**
 * Require login routing middleware
 */
 module.exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) { //Use passports is Authenticated function
        return res.status(401).send({
            message: 'User is not logged in'
        });
    }

    next();
};

/**
 * User authorizations routing middleware
 */
 module.exports.hasAuthorization = function(roles) {
    var _this = this;

    return function(req, res, next) {
        _this.requiresLogin(req, res, function() {
            if (_.intersection(req.user.group.permissions, roles).length || req.user.hasPermission('sudo')) {
                return next();
            } else {
                return res.status(403).send({
                    message: 'User is not authorized'
                });
            }
        });
    };
};



/**
 * user serialization
 */
 passport.serializeUser(function(user, done) {
    done(null, user._id);
});

 passport.deserializeUser(function(id, done) {
    user.findById(id).populate('group').exec( function(err, user) {
        done(err, user);
    });
});


/**
 * passport local strategy
 */
 passport.use(new LocalStrategy(
    function(username, password, done) {//passport expects the fields username and password to be passed in the request. this can be changed
        user.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (hash(user.salt,password)!==user.password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
    ));