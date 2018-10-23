var gulp = require('gulp');
var clean = require('gulp-clean');

var filesToMove = [
	'./server/views/**/*.*',
	'./server/modules/**/*.dll'
]

gulp.task('move', function () {
	gulp.src(filesToMove, { base: 'server' }).pipe(gulp.dest('dist'));
	gulp.src(['index.html'], { base: '.' }).pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
	return gulp.src(['dist/*'], { read: false })
			   .pipe(clean());
});