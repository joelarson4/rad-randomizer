'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var jshint = require('gulp-jshint');
var del = require('del');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var browserify = require('browserify');
var transform = require('vinyl-transform');

//utils
var browserifyIt = function(bopts, ropts, ignore) {
    return transform(function(filename) {
        var br = browserify(filename, bopts)
            .external('rad-reveal')
            .require(filename, ropts);
        if(ignore) {
            br.ignore(ignore);
        }
        return br.bundle();
    });
};



function test() {
    return gulp.src('demo.html')
        .pipe(mochaPhantomJS());
}

//tasks
gulp.task('default', function() {
  gulp.watch('src/*.js', ['build']);
  gulp.watch('demo.html', ['build']);
});

gulp.task('release', ['build'], test);

gulp.task('build', function() {
    var builddir = 'build/';
    return gulp.src('src/randomizer.js')
        .pipe(browserifyIt({ ignoreMissing: true }))
        .pipe(gulp.dest(builddir))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(builddir))
});


gulp.task('test', test);
