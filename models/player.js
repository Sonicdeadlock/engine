/**
 * Created by alexthomas on 4/11/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var _ = require('lodash');

var playerSchema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'user',
        field: '_id'
    },
    stats: {
        level: {default: 0, type: Number},
        strength: {default: 0, type: Number},
        intelligence: {default: 0, type: Number},
        constitution: {default: 0, type: Number},
        wisdom: {default: 0, type: Number},
        dexterity: {default: 0, type: Number},
        agility: {default: 0, type: Number},
        BEN: {default: 0, type: Number}
    },
    money: {default: 10, type: Number},
    tokens: {default: 0, type: Number}
});

playerSchema.virtual('stats.minAttack').get(function () {
    return 0;
});
playerSchema.virtual('stats.maxAttack').get(function () {
    return 0;
});
playerSchema.virtual('stats.mAtk').get(function () {
    return 0;
});
playerSchema.virtual('stats.critical').get(function () {
    return _.floor(this.stats.BEN + (this.stats.dexterity / 10));
});
playerSchema.virtual('stats.HP').get(function () {
    return _.floor((this.stats.level * 100) * (Math.pow(1.05, this.stats.constitution)));
});
playerSchema.virtual('stats.SP').get(function () {
    return _.floor((this.stats.level * 100) * (Math.pow(1.05, this.stats.intelligence)));
});
playerSchema.virtual('stats.HDef').get(function () {
    return 0;
});
playerSchema.virtual('stats.SDef').get(function () {
    return 0;
});
playerSchema.virtual('stats.hit').get(function () {
    return _.floor(180 + this.stats.dexterity + this.stats.level);
});
playerSchema.virtual('stats.flee').get(function () {
    return _.floor(100 + this.stats.dexterity / 3 + this.stats.BEN + this.stats.agility);
});

module.exports = mongoose.model('player', playerSchema);