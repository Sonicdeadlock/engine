module.exports = {
    web: {
        entryPointFile: 'index.html',
        publicPath: '/public',
        port: process.env.port || 8080
    },
    db : {
        host: 'mongodb://localhost/',
        name: 'engine'
    },
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
    }
};