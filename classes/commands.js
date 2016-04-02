/**
 * Created by Sonicdeadlock on 4/2/2016.
 */
var _ = require('lodash');

var commands = {
    '!test':function(text,emitCallback){
        emitCallback('This is a test');
    }
};
function isCommand(text){
    var cmds = _.keys(commands);
    return (cmds.indexOf(text.split(' ')[0])!=-1);
}

function execute(text,emitCallback,user){
    if(isCommand(text)){
        commands[text.split(' ')[0]](text,emitCallback,user);
    }
}

module.exports = {
    isCommand:isCommand,
    execute:execute
};