var path = require('path');
var gulp = require('gulp');
var resourcePath = 'dist/open-network-spectral-interface-win32-x64/resources';

gulp.task('copy-express-files', function() {
	gulp.src(['../express/package.json']).pipe(gulp.dest('../electron/express'));
});

// Files needed to be moved so packaged with installer
var filesToMove = [
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.dll',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.exe',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.h',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.aliases',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.ini',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.lib',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.idl',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.c',
	'../express/src/modules/SpectroScan/FTIRCapture/**/*.lvlib'
]


gulp.task('move-dlls-windows', function () {
	gulp.src(['../express/src/modules/SeaBreeze/SeaBreezeSTI.dll']).pipe(gulp.dest(resourcePath));
	gulp.src(['../express/src/modules/SpectroScan/SpectroScanDLL_V6.a.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/ftd2xx64.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/nanoFTIR_V11a_x64.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/Newtonsoft.Json.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(filesToMove).pipe(gulp.dest(path.join(resourcePath, 'FTIRCapture')))
});