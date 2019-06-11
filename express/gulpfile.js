var gulp = require('gulp');
var clean = require('gulp-clean');

var filesToMove = [
	'./src/views/**/*.*',
	'./src/modules/**/*.dll'
]

gulp.task('move', function () {
	gulp.src(filesToMove, { base: 'src' }).pipe(gulp.dest('../electron/express/dist'));
	gulp.src(['index.html'], { base: '.' }).pipe(gulp.dest('../electron/express/dist'));
});

gulp.task('clean', function () {
	return gulp.src(['../electron/express/dist/*'], { read: false })
		.pipe(clean());
});

// Files needed to be moved so packaged with installer
gulp.task('move-dlls-windows', function () {
	gulp.src(['./src/modules/SeaBreeze/SeaBreezeSTI.dll']).pipe(gulp.dest('builds/open-network-spectral-interface-win32-x64'));
	gulp.src(['./src/modules/SpectroScan/SpectroScanDLL_V6.a.dll']).pipe(gulp.dest('builds/open-network-spectral-interface-win32-x64'))
	gulp.src(['./src/modules/SpectroScan/ftd2xx64.dll']).pipe(gulp.dest('builds/open-network-spectral-interface-win32-x64'))
});