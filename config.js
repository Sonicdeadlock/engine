var path = require('path');
module.exports = {
    web: {
        entryPointFile: 'index.html',
        publicPath: '/public',
        port: process.env.port || 8080
    },
    db:(function(){
        if(process.env.db==='local'){
            return {
                host: 'localhost',
                name: 'sonicengine'
            }
        }
        else if(process.env.db==='test'){
            return {
                host: 'localhost',
                name: 'sonicengineTest'
            }
        }
        else{
            return {
                host: 'awsEngine:73RD5GtWD)H93bPQw}~SE$!n@ds015700.mlab.com:15700',
                name: 'sonicengine'
            }
        }
    }()),
    "hash":{
        "length":256,
        "salt":128,
        "itterations":10000
    },
    session:{
        secret:'I know what you did last summer',
        cookie:{
            maxAge:60000,
            expires:false
        }
    },
    chat:{
        hookTimeout:1000
    },
    imageEngine:{
        classPath:path.join(__dirname,'/bin/','ImageEngineInterpreter.jar'),
        enabled:true,
        dir:'/images/'
    }
};