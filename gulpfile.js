var gulp = require('gulp');

var babel = require('gulp-babel');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
  return gulp.src('TextQuoteAnchor.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write({sourceRoot: './'}))
    .pipe(gulp.dest('lib'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./', {sourceRoot: './'}))
    .pipe(gulp.dest('lib'))
});

gulp.task('umd', function () {
  return gulp.src('TextQuoteAnchor.js')
    .pipe(sourcemaps.init())
    .pipe(babel({modules: 'umd'}))
    .pipe(sourcemaps.write({sourceRoot: './'}))
    .pipe(gulp.dest('dist'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('./', {sourceRoot: './'}))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['build', 'umd']);
