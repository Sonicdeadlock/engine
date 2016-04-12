/**
 * Created by alexthomas on 4/11/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var playerSchema = new schema({
    user:{
        type:schema.Types.ObjectId,
        ref:'user',
        field:'_id'
    },
    stats:{
        level:{default:0,type:Number},
        strength:{default:0,type:Number},
        intelligence:{default:0,type:Number},
        constitution:{default:0,type:Number},
        wisdom:{default:0,type:Number},
        dexterity:{default:0,type:Number},
        agility:{default:0,type:Number},
        BEN:{default:0,type:Number}
    }
});

module.exports = mongoose.model('player',playerSchema);