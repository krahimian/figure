
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
			'bower_components/q/q.js',
			'bower_components/localforage/dist/localforage.js',
			'bower_components/async/dist/async.js',
			'bower_components/moment/min/moment.min.js',
			'bower_components/d3/d3.min.js',
			'bower_components/metrics-graphics/dist/metricsgraphics.min.js'
		    ]
		}
	    },
	    js: {
		files: {
		    'tmp/app.js' : [
			'CONFIG.js',
			'src/js/request.js',
			'src/js/element.js',
			'src/js/mint.js',
			'src/js/account.js',
			'src/js/index.js',
			'src/js/alerts.js',
			'src/js/properties.js',
			'src/js/figure.js'
		    ]
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
	
	watch: {
	    index: {
		files: ['gruntfile.js', 'config/**/*.js', 'src/html/**/*.jade', 'src/**/*.js', 'bower_components/**/*', 'src/css/**/*'],
		tasks: ['default']
	    }
	},

	cordovacli: {
	    build: {
		options: {
		    id: 'io.figure',
		    name: 'figure',
		    path: './',
		    command: 'build',
		    platforms: [ 'ios' ]
		}
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
	//'concat:index',
	'staticinline',
	'inline',
	'htmlmin'
    ]);

    grunt.registerTask('default', [
	'base',

	'jade:index',

	'after',

	'copy:index',

	'cordovacli'
    ]);

    grunt.loadNpmTasks('grunt-contrib-clean');    
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-static-inline');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-cordovacli');    
    grunt.loadNpmTasks('grunt-contrib-watch');

};
