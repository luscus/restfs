'use strict';

var gulp = require('gulpfile.basics');

var gutil = require('gulp-util');
var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
var concat = require('gulp-concat');

gulp.task('doc', function() {
  return gulp.src('lib/**/*.js')
    .pipe(concat('API.md'))
    .pipe(gulpJsdoc2md({}))
    .on('error', function(err){
      gutil.log('jsdoc2md failed:', err.message);
    })
    .pipe(gulp.dest('./'));
});
