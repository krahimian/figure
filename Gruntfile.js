/* global module, require */

var modRewrite = require('connect-modrewrite');

module.exports = function(grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	clean: {
	    options: {
		force: true
	    },
	    index: {
		src: ['tmp/**/*']
	    }
	},

	/********************* STYLE *********************/
	stylus: {
	    options: {
		compress: true,
		'include css': true
	    },
	    compile: {
		files: {
		    'tmp/app.css': 'src/css/*.styl'
		}
	    }
	},
	cssmin: {
	    compress: {
		files: {
		    'tmp/app.css': 'tmp/app.css'
		}
	    }
	},
	staticinline: {
	    main: {
		files: {
		    'tmp/index.html': 'tmp/index.html'
		}
	    }
	},

	/********************* JAVASCRIPT *********************/
	concat: {
	    vendor: {
		files: {
		    'tmp/vendor.js': [
			'bower_components/d3/d3.js',
			'bower_components/async/dist/async.js',
			'bower_components/metrics-graphics/dist/metricsgraphics.js',
			'bower_components/localforage/dist/localforage.min.js',
			'src/element.js'
		    ]
		}
	    },
	    js: {
		files: {
		    'tmp/app.js' : [
			'src/js/**/*.js',
			'src/index.js'
		    ]
		}
	    }
	},
	uglify: {
	    options: {
		beautify: {
		    ascii_only: true,
		    inline_script: true
		}
	    },
	    vendor: {
		files: {
		    'tmp/vendor.js': ['tmp/vendor.js']
		}
	    },
	    js: {
		files: {
		    'tmp/app.js': ['tmp/app.js']
		}
	    }
	},
	
	inline: {
	    index: {
		src: [ 'tmp/index.html' ]
	    }
	},
	jade: {
	    index: {
		files: [{
		    'tmp/index.html': ['src/html/index.jade']
		}]
	    },
	    partials: {
		files: [{
		    expand: true,
		    src: ['**/*.jade'],
		    dest: 'tmp/',
		    cwd: 'src/html/partials/',
		    ext: '.html'
		}]
	    }
	},
	inline_angular_templates: {
	    index: {
		options: {
		    base: 'tmp',
		    prefix: '/',
		    selector: 'body',
		    method: 'prepend'
		},
		files: {
		    'tmp/index.html': ['tmp/**/*.html', '!tmp/index.html']
		}
	    }
	},	
	htmlmin: {
	    index: {
		options: {
		    collapseWhitespace: true,
		    removeComments: true
		},
		files: {
		    'tmp/index.html': 'tmp/index.html'
		}
	    }
	},
	copy: {
	    index: {
		files: [{
		    expand: true,
		    flatten: true,
		    src: 'tmp/index.html',
		    dest: 'www/'
		}]
	    }
	},

	watch: {
	    index: {
		files: ['gruntfile.js', 'config/**/*.js', 'src/html/**/*.jade', 'src/**/*.js', 'bower_components/**/*', 'src/css/**/*'],
		tasks: ['default']
	    }
	},

	jshint: {
	    options: {
		curly: false,
		undef: true,
		unused: true,
		bitwise: true,
		freeze: true,
		smarttabs: true,
		immed: true,
		latedef: true,
		newcap: true,
		noempty: true,
		nonew: true,
		laxbreak: true,
		trailing: true,
		forin: true,
		eqeqeq: true,
		eqnull: true,
		force: true,
		quotmark: 'single',
		expr: true
	    },
	    main: [
		'src/**/*.js'
	    ]
	},

	/************************ BUILD ***********************/
	connect: {
	    server: {
		options: {
		    keepalive: true,
		    debug: true,
		    port: 8080,
		    base: 'www',
		    open: {
			target: 'http://localhost:9000',
			appName: 'Google Chrome'
		    },
		    middleware: function (connect, options) {
			var middlewares = [];

			middlewares.push(modRewrite([
			    '!\\.ico|\\.jpg|\\.css|\\.js|\\.png|\\woff|\\ttf|\\.swf$ /index.html'
			]));

			if (!Array.isArray(options.base)) {
			    options.base = [options.base];
			}

			var directory = options.directory || options.base[options.base.length - 1];
			options.base.forEach(function (base) {
			    middlewares.push(connect.static(base));
			});

			middlewares.push(connect.directory(directory));

			return middlewares;
		    }
		}
	    }
	}	
    });

    grunt.registerTask('base', [
	'clean',
	'stylus',
	'cssmin',
	'concat:vendor',
	'concat:js'
    ]);

    grunt.registerTask('after', [
	'jade:partials',
	'inline_angular_templates',
	'staticinline',
	'inline',
	'htmlmin'
    ]);

    grunt.registerTask('default', [
	'base',

	'jade:index',

	'after',

	'copy:index'
    ]);

    grunt.loadNpmTasks('grunt-contrib-clean');    
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-static-inline');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-connect');

};	
