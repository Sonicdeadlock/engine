/**
 * Created by alexthomas on 4/8/16.
 */
var config = require('./config.js');
/*global module:false*/

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        // Task configuration.
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                esnext:true,
                globals: {
                    jQuery: true,
                    it:true,
                    before:true,
                    require:true,
                    describe:true
                }
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'nodeunit']
            }
        },
        mongoimport:{
            options:{
                db:config.db.name,
                host:config.db.host,
                collections:[
                    {
                        name:"permissiongroups",
                        type:"json",
                        file:"defaultGroups.json",
                        jsonArray:true,
                        drop:true
                    },
                    {
                        name:"users",
                        type:"json",
                        file:"defaultUsers.json",
                        jsonArray:true,
                        drop:true
                    },
                    {
                        name:"character_replacements",
                        type:'json',
                        file:"character_replcements.json",
                        jsonArray:true,
                        drop:true
                    },
                    {
                        name:"forum_topics",
                        type:'json',
                        file:"defaultTopics.json",
                        jsonArray:true,
                        drop:true
                    }
                ]
            }
        },
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: true,
                ui: 'bdd',
                reporter: 'spec',
                harmony:true
            },
            all: { src: ['test/*.js'] }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mongoimport');

    // Default task.
    grunt.registerTask('default', ['jshint', 'nodeunit']);

    grunt.registerTask('setupDB',['mongoimport']);

    grunt.registerTask('mocha-test', ['jshint','mongoimport', 'simplemocha']);


};