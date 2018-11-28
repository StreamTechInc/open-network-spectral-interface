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

// Files needed to be moved so packaged with installer
gulp.task('move-dlls-windows', function () {
	gulp.src(['./server/modules/SeaBreeze/SeaBreezeSTI.dll']).pipe(gulp.dest('builds/open-network-spectral-interface-win32-x64'));
	gulp.src(['./server/modules/SpectroScan/SpectroScanDLL_V6.a.dll']).pipe(gulp.dest('builds/open-network-spectral-interface-win32-x64'))
	gulp.src(['./server/modules/SpectroScan/ftd2xx64.dll']).pipe(gulp.dest('builds/open-network-spectral-interface-win32-x64'))
});