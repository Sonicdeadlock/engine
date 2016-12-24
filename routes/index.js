var config = require('../config.js');
var express = require('express');
var router = express.Router();
var path = require('path');


router.use(express.static(__dirname + '/..' + config.web.publicPath));
router.use('/', express.static(path.join(__dirname, '/..', config.web.publicPath + '/index')));
router.get('/', function (req, res) {
    //Entry point for Angular
    res.sendFile(config.web.entryPointFile, {
        //express.static middleware is separate from res.sendFile, so we still need to specify the root path here too
        root: path.join(__dirname, '/..', config.web.publicPath + '/index')
    });
});

module.exports = router;