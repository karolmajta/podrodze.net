module.exports = function(grunt) {

    var REQUIRED_ENVVARS = [
        'GOOGLE_API_KEY'
    ];

    var missingKeys = function (obj, keys) {
        var missingKeys = [];
        keys.forEach(function (k) {
            if (obj[k] === undefined) {
                missingKeys.push(k);
            }
        });
        return missingKeys;
    };

    var environmentValid = function () {
        var missing = missingKeys(process.env, REQUIRED_ENVVARS);
        return missing.length === 0;
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            source: {
                files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.html', 'src/**/*.less'],
                tasks: ['jshint:all', 'build']
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'src/js/*.js']
        },
        'http-server': {
            'dev': {
                root: "src/",
                port: 8282,
                host: "127.0.0.1",
                cache: 0,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",
                runInBackground: true
            }
        },
        render: {
            config: {
                options: {
                    data: {
                        pkg: grunt.file.readJSON('package.json'),
                        keys: {
                            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
                        }
                    }
                },
                files: {
                    'src/index.html': ['src/index.ejs.html'],
                    'src/js/config.js': ['src/js/config.ejs.js']
                }
            }
        },
        html2js: {
            options: {
                module: 'podrodze.views'
            },
            main: {
                src: ['src/views/**/*.html'],
                dest: 'src/js/views.js'
            }
        },
        copy: {
            jslibs: {
                files: [
                    {expand: true,
                     cwd: 'bower_components',
                     src: [
                         'underscore/**',
                         'jquery/**',
                         'angular/**',
                         'angular-route/**',
                         'angular-resource/**',
                         'angular-google-maps/**'
                     ],
                     dest: 'src/libs/'}
                ]
            },
            bootstrap: {
                files: [
                    {expand: true,
                     cwd: 'bower_components/bootstrap',
                     src: ['fonts/**', 'js/**', 'less/**'],
                     dest: 'src/libs/bootstrap/'}
                ]
            },
            'bootstrap-variables': {
                src: 'src/less/bootstrap-variables.less',
                dest: 'src/libs/bootstrap/less/variables.less'
            }
        },
        less: {
            bootstrap: {
                files: {
                    "src/libs/bootstrap/css/bootstrap.css": "src/libs/bootstrap/less/bootstrap.less",
                    "src/libs/bootstrap/css/bootstrap-theme.css": "src/libs/bootstrap/less/theme.less"
                }
            },
            source: {
                files: {
                    "src/css/podrodze.css": "src/less/podrodze.less"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-fail');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-ejs-render');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');

    var buildTasks = [
        'render',
        'html2js',
        'copy:jslibs', 'copy:bootstrap', 'copy:bootstrap-variables',
        'less:bootstrap', 'less:source'
    ];

    if (!environmentValid()) {
        var errmsg = "Missing envvars [" + missingKeys(process.env, REQUIRED_ENVVARS) + "].";
        var failmsg = "fail:" + errmsg + ":7";
        buildTasks.unshift(failmsg);
    }

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', ['http-server:dev', 'watch:source']);
};
