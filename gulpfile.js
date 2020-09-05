const gulp = require('gulp');

const tasks = require('./gulp.tasks');

gulp.task('assets', tasks.assets);
gulp.task('build', tasks.build);
gulp.task('rebuild', tasks.rebuild);
gulp.task('watch', tasks.watch);
gulp.task('clean', tasks.clean);
gulp.task('sass', tasks.sass);
gulp.task('link', tasks.link)