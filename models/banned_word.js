/**
 * Created by alexthomas on 4/5/16.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var db = require('../db');
var char_replaceModel = require('./char_replace');
var char_replace = db.model('character_replacements');
var _ = require('lodash');

var banned_wordsSchema = new schema({
    word:{type:String,required:true},
    regex:String,
    overwriteable:{
        type:String,
        default:true
    }
});

banned_wordsSchema.statics.update_regex = function(){
 //todo build regex for banned words from character replacements
};

banned_wordsSchema.pre('save',function(next){
    var self = this;
   if(this.regex)
        next();
    else{
       char_replace.find({}).then(function(replacements){
           replacements = _.map(replacements,function(replacement){
               return {character:replacement.character, replacements:_.map(replacement.replacements,function(characterSet){
                   characterSet = characterSet.replace(new RegExp('\\\\','g'),'\\\\');
                   characterSet = characterSet.replace(new RegExp('\\*','g'),'\\*');
                   characterSet = characterSet.replace(new RegExp('\\(','g'),'\\(');
                   characterSet = characterSet.replace(new RegExp('\\)','g'),'\\)');
                   characterSet = characterSet.replace(new RegExp('\\[','g'),'\\[');
                   characterSet = characterSet.replace(new RegExp('\\]','g'),'\\]');
                   characterSet = characterSet.replace(new RegExp('\\-','g'),'\\-');
                   characterSet = characterSet.replace(new RegExp('\\+','g'),'\\+');
                   characterSet = characterSet.replace(new RegExp('\\?','g'),'\\?');
                   characterSet = characterSet.replace(new RegExp('\\|','g'),'\\|');
                   characterSet = characterSet.replace(new RegExp('\\{','g'),'\\{');
                   characterSet = characterSet.replace(new RegExp('\\}','g'),'\\}');
                   characterSet = characterSet.replace(new RegExp('\\$','g'),'\\$');
                   characterSet = characterSet.replace(new RegExp('\\/','g'),'\\/');
                   return "("+characterSet+")";
               })}
           });
           self.regex = _.map(self.word,function(letter){
               var replacement = _.find(replacements,{character:letter});
               if(!replacement){
                   return letter;
               }
               else{
                   return '('+replacement.replacements.join('|')+')';
               }
           }).join('');
           next();
       });
   }
});

module.exports = mongoose.model('banned_word',banned_wordsSchema);