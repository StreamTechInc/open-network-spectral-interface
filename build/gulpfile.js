var gulp = require('gulp');
var resourcePath = 'dist/open-network-spectral-interface-win32-x64/resources';

gulp.task('copy-express-files', function() {
	gulp.src(['../express/package.json']).pipe(gulp.dest('../electron/express'));
});

// Files needed to be moved so packaged with installer
gulp.task('move-dlls-windows', function () {
	gulp.src(['../express/src/modules/SeaBreeze/SeaBreezeSTI.dll']).pipe(gulp.dest(resourcePath));
	gulp.src(['../express/src/modules/SpectroScan/SpectroScanDLL_V6.a.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/ftd2xx64.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/nanoFTIR_V11a_x64.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/Newtonsoft.Json.dll']).pipe(gulp.dest(resourcePath))
	gulp.src(['../express/src/modules/SpectroScan/NanoFTIRCapture.exe']).pipe(gulp.dest(resourcePath))
});