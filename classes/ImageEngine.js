/**
 * Created by Sonicdeadlock on 6/14/2016.
 */

var _ = require('lodash');
var config = require('../config');
var spawn = require("child_process").spawn;

function renderImage(file_dir, tolerance, charset) {
    var args = ["-Djava.awt.headless=true",'-jar', config.imageEngine.classPath, file_dir, tolerance];
    if (charset && !_.isEmpty(charset))
        args.push(charset);

    return new Promise(function (resolve, reject) {
        var renderer = spawn('java', args);
        renderer.stdout.on('data', function (data) {
            console.log(data);
        });
        renderer.stderr.on("data", function (data) {
            console.error(data.toString());
        });
        renderer.on("close", function (code) {
            if (code === 0) {
                var new_dir = config.imageEngine.dir + _.last(file_dir.split(new RegExp('[\\\\\\/]'))).split('.')[0] + "_Ascii.png";
                resolve(new_dir)
            } else {
                reject()
            }
        })
    })

}

module.exports.renderImage = renderImage;
