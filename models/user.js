var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');
var permissionGroupModel = require('./permissionGroup');
var permissionGroup = db.model('permissionGroup');

var userSchema = new schema({
    firstName:String,
    lastName:String,
    joinDate:Date,
    username:{type:String,index:true},
    password:String,
    salt:String,
    email:String,
    group:{
        type: schema.Types.ObjectId,
        ref:"permissionGroup",
        field:'_id',
        required:true
    },
    chat:{
        nameColor:String,
        nameBackgroundColor:String,
        nameFont:String,
        textColor:String,
        textBackgroundColor:String,
        textFont:String
    },
    strikes:{
        chat:{default:0,type:Number},
        bans:{default:0,type:Number}
    },
    forum:{
        agree:{default:0,type:Number},
        informative:{default:0,type:Number},
        funny:{default:0,type:Number},
        thumbsUp:{default:0,type:Number}
    }
});

userSchema
    .pre('findOne', populateGroup)
    .pre('find', populateGroup);

function populateGroup(next){
    this.populate('group','name');
    next();
}



userSchema.methods.hasPermission = function(perm){
    if(!this.group) return false;
    if(this.group.permissions.indexOf('god')!=-1 || this.group.permissions.indexOf('sudo')!=-1) return true;
    if(this.group.permissions.indexOf(perm)!=-1) return true;
    return false;
};

userSchema.statics.hasPermission = function(user,perm){
    if(!user.group) return false;
    if(user.group.permissions.indexOf('god')!=-1 || user.group.permissions.indexOf('sudo')!=-1) return true;
    if(user.group.permissions.indexOf(perm)!=-1) return true;
    return false;
};



module.exports = mongoose.model('user',userSchema);
