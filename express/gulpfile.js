var gulp = require('gulp');
var clean = require('gulp-clean');

var filesToMove = [
	'./src/views/**/*.*',
	'./src/modules/**/*.dll'
]

gulp.task('move', function () {
	gulp.src(filesToMove, { base: 'src' }).pipe(gulp.dest('../electron/express/dist'));
	gulp.src(['index.html'], { base: '.' }).pipe(gulp.dest('../electron/express/dist'));
	gulp.src(['package.json']).pipe(gulp.dest('../electron/express'));
});

gulp.task('clean', function () {
	return gulp.src(['../electron/express/dist/*'], { read: false })
		.pipe(clean());
});

