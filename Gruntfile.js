module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg:     grunt.file.readJSON('package.json'),
		src:     'src/',
		srcMain: '<%= src %>main/',
		srcTest: '<%= src %>test/',
		out:     'out/',

		clean: {
			out: {
				src: ['<%= out %>']
			}
		},

		copy: {
			dev: {
				cwd:    'src/main/',
				src:    '**',
				dest:   '<%= out %>dev',
				expand: true
			}
		},

		yuidoc: {
			compile: {
				name:        '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version:     '<%= pkg.version %>',
				url:         '<%= pkg.homepage %>',
				options:     {
					paths:  'src/main/',
					outdir: 'doc/'
				}
			}
		},

		mochaTest: {
			all: {
				options: {
					reporter: 'spec'
				},
				src:     ['<%= srcTest %>*.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('test', [ 'mochaTest' ]);

	grunt.registerTask('dev', [ 'copy:dev', 'test' ]);

	grunt.registerTask('default', [ 'dev' ]);
};