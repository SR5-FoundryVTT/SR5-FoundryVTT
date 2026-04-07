const gulp = require('gulp');

const tasks = require('./gulp.tasks');

gulp.task('assets', tasks.assets);
gulp.task('build', tasks.buildProd);
gulp.task('build:prod', tasks.buildProd);
gulp.task('build:dev', tasks.buildDev);
gulp.task('rebuild', tasks.rebuild);
gulp.task('watch', tasks.watchDev);
gulp.task('watch:prod', tasks.watchProd);
gulp.task('watch:dev', tasks.watchDev);
gulp.task('clean', tasks.clean);
gulp.task('sass', tasks.sass);
