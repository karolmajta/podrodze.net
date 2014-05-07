module.exports = function(grunt) {

    var REQUIRED_BUILD_ENVVARS = [
        'GOOGLE_API_KEY'
    ];

    var REQUIRED_DEPLOY_ENVVARS = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_S3_BUCKET',
        'AWS_S3_REGION'
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

    var buildEnvironmentValid = function () {
        var missing = missingKeys(process.env, REQUIRED_BUILD_ENVVARS);
        return missing.length === 0;
    };

    var deployEnvironmentValid = function () {
        var missing = missingKeys(process.env, REQUIRED_DEPLOY_ENVVARS);
        return missing.length === 0;
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            source: {
                files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.html', 'src/**/*.less'],
                tasks: ['jshint:all', 'clean', 'build']
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'src/js/*.js']
        },
        'http-server': {
            dev: {
                root: "src/",
                port: 8282,
                host: "127.0.0.1",
                cache: 0,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",
                runInBackground: true
            },
            prod: {
                root: "dist/",
                port: 8282,
                host: "127.0.0.1",
                cache: 0,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",
                runInBackground: false
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
            },
            index: {
                src: 'src/index.html',
                dest: 'dist/index.html'
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
        },
        useminPrepare: {
            html: 'src/index.html',
            options: {
                root: 'src',
                dest: 'dist'
            }
        },
        usemin: {
            html: 'dist/index.html'
        },
        s3: {
            options: {
                key: process.env.AWS_ACCESS_KEY_ID,
                secret: process.env.AWS_SECRET_ACCESS_KEY,
                bucket: process.env.AWS_S3_BUCKET,
                region: process.env.AWS_S3_REGION,
                access: 'public-read'
            },
            // upload
            index: {
                options: {
                    headers: {
                        // Never cache the index!
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": 0
                    }
                },
                upload: [
                    {
                        src: 'dist/index.html',
                        dest: 'index.html'
                    }
                ]
            },
            // upload the new version of app
            app: {
                options: {
                    headers: {
                        // Cache virtually forever (2 years)
                        "Cache-Control": "max-age=630720000, public",
                        "Expires": new Date(Date.now() + 63072000000).toUTCString()
                    }
                },
                upload: [
                    {
                        src: 'dist/<%= pkg.version %>/js/*',
                        dest: '<%= pkg.version %>/js/'
                    },
                    {
                        src: 'dist/<%= pkg.version %>/css/*',
                        dest: '<%= pkg.version %>/css/'
                    }
                ]
            }
        },
        clean: [
            '.tmp/',
            'dist/',
            'src/libs/',
            'src/css/',
            'src/js/config.js',
            'src/js/views.js'
        ]
    });

    grunt.loadNpmTasks('grunt-fail');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-ejs-render');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-contrib-clean');

    var errmsg, failmsg;

    var buildTasks = [
        'render',
        'html2js',
        'copy:jslibs', 'copy:bootstrap', 'copy:bootstrap-variables',
        'less:bootstrap', 'less:source'
    ];

    if (!buildEnvironmentValid()) {
        errmsg = "Missing envvars [" + missingKeys(process.env, REQUIRED_BUILD_ENVVARS) + "].";
        failmsg = "fail:" + errmsg + ":7";
        buildTasks.unshift(failmsg);
    }

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('dist', [
        'useminPrepare',
        'concat:generated', 'cssmin:generated', 'uglify:generated',
        'copy:index',
        'usemin']);

    var deployTasks = ['clean', 'build', 'dist', 's3:index', 's3:app'];
    if (!deployEnvironmentValid()) {
        errmsg = "Missing envvars [" + missingKeys(process.env, REQUIRED_DEPLOY_ENVVARS) + "].";
        failmsg = "fail:" + errmsg + ":7";
        deployTasks.unshift(failmsg);
    }

    grunt.registerTask('deploy', deployTasks);
    grunt.registerTask('default', ['http-server:dev', 'watch:source']);
};
