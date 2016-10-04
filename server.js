/**
 * Created by alexthomas on 3/26/16.
 */

var config = require('./config');
var _ = require('lodash');
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var SessionStore = require('connect-mongo')(session);
var passport = require('passport');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var db = require('./db');
var chat = require('./chat');
require('./bots/bots')();//load bots
var roomSocketHandle = require('./roomSocketHandle');
var passportSocketIo = require("passport.socketio");
//Web Routes
var web = require('./routes/index');
var api = require('./routes/api');
var auth = require('./routes/auth');



//Configure Express
app.use(compression());
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
    store:new SessionStore({mongooseConnection:db}),
    secret:config.session.secret,
    cookie:config.session.cookie,
    resave:false,
    saveUninitialized:false,
    unset:"destroy"
}));
app.use(passport.initialize());
app.use(passport.session());

//Register routes
app.use('/', web);
app.use('/api', api);
app.use('/auth',auth);

//On Request
app.use(function(req, res, next) {
    //Enable CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

//On Error
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("There was an error processing your request");
});


//Start app
server.listen(config.web.port);

io.use(passportSocketIo.authorize({
    cookieParser: require('cookie-parser'),
    key:          'connect.sid',       //make sure is the same as in your session settings in app.js
    secret:       config.session.secret,      //make sure is the same as in your session settings in app.js
    store:        new SessionStore({mongooseConnection:db}),
    fail: function(data, message, error, accept){if(error)  throw new Error(message);return accept();}
}));

io.on("connection",function(socket){
    var socketHandlers = [chat,roomSocketHandle];
    _.forEach(socketHandlers,function(handler){
        handler.connect(socket);
    });
    socket.on('disconnect',function(){
        _.forEach(socketHandlers,function(handler){
            handler.disconnect(socket);
        });
    })
});

//Debug
console.log('serving from:', __dirname);
console.log('listening on:', config.web.port);

module.exports = app;

