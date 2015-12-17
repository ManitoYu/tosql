var gulp = require('gulp');
var coffee = require('gulp-coffee');

gulp.task('build', function () {
  gulp.src('src/**/*.coffee')
    .pipe(coffee({ bare: true }).on('error', console.log))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.coffee', ['build']);
});

gulp.task('default', ['watch']);
