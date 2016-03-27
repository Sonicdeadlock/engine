/**
 * Created by alexthomas on 3/26/16.
 */

var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var SessionStore = require('connect-mongo')(session);
var passport = require('passport');
var server = require('http').createServer(app);
var db = require('./db');
//Web Routes
var web = require('./routes/index');
var api = require('./routes/api');
var auth = require('./routes/auth');


//Configure Express
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

//Debug
console.log('serving from:', __dirname);
console.log('listening on:', config.web.port);

module.exports = app;

