const createWindowsInstaller = require("electron-winstaller").createWindowsInstaller;
const path = require("path");

getInstallerConfig()
	.then(createWindowsInstaller)
	.catch((error) => {
		console.error(error.message || error)
		process.exit(1)
	})

function getInstallerConfig() {
	console.log('creating windows installer')
	const rootPath = path.join('./')
	const outPath = path.join(rootPath, 'builds')

	return Promise.resolve({
		appDirectory: path.join(outPath, 'open-network-spectral-interface-win32-x64/'),
		authors: 'Stream Technologies Inc.',
		noMsi: true,
		outputDirectory: path.join(outPath, 'windows-installer'),
		exe: 'open-network-spectral-interface.exe',
		setupExe: 'OpenNetworkSpectralInterface.exe'
	})
}