var gulp = require('gulp');

gulp.task('copy-express-files', function() {
	gulp.src(['../express/package.json']).pipe(gulp.dest('../electron/express'));
});