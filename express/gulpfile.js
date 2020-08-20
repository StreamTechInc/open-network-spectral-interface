var gulp = require('gulp');
var clean = require('gulp-clean');

var filesToMove = [
	'./src/views/**/*.*',
	'./src/modules/**/*.dll',
	'./src/modules/**/*.exe'
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

gulp.task('move-web', function () {
	gulp.src(filesToMove, { base: 'src' }).pipe(gulp.dest('./dist'));
	gulp.src(['index.html'], { base: '.' }).pipe(gulp.dest('./dist'));
});