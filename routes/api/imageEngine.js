/**
 * Created by Sonicdeadlock on 6/14/2016.
 */
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var ImageEngine = require('../../classes/ImageEngine');
var multipartyMiddleware = require('connect-multiparty')();
var fs = require('fs');
var path = require('path');
var config = require('../../config');
var uid = require('uid');

router.route('/ITAI')
    .post(multipartyMiddleware, function (req, res) {

        if (!req.files || !req.files.file) {
            res.status(400).send()
        } else {
            var file = req.files.file;
            if (!req.body.tolerance) {
                res.status(400).send()
            } else {
                var dir = path.join(__dirname, '/../..', config.web.publicPath, config.imageEngine.dir, file.name);
                var dirParts = dir.split('.');
                dir = dirParts[0] + uid(5) + '.' + dirParts[1];
                fs.rename(file.path, dir, function (err) {
                    console.error(err);
                    ImageEngine.renderImage(dir, req.body.tolerance, req.body.charset).then(function (new_dir) {
                        res.status(200).send(new_dir);
                    }, function (error) {
                        console.error("failed to render image");
                        res.status(500).send("Internal server error occurred when rendering image");
                    });
                });

            }
        }

    });

module.exports = router;