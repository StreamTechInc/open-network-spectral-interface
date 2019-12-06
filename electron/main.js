//handle setupevents as quickly as possible
const setupEvents = require('./setup-events')
const fs = require("fs");
const dns = require("dns");

if (setupEvents.handleSquirrelEvent()) {
	// squirrel event handled and app will exit in 1000ms, so don't do anything else
	return;
}

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;
const path = require("path");

let mainWindow;

function createWindow() {
	app.server = require(path.join(__dirname, "./express/dist/index.js"))();

	mainWindow = new BrowserWindow({
		width: 300,
		height: 300,
		autoHideMenuBar: true,
		useContentSize: true,
		icon: path.join(__dirname, "/express/dist/views/assets/img/favicon.ico")
	});

	mainWindow.loadURL("http://localhost:3200");
	mainWindow.focus();
	//mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	const appIcon = new Tray(path.join(__dirname, "/express/dist/views/assets/img/favicon.ico"));

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Show App", click: function () {
				mainWindow.show();
			}
		},
		{
			label: "Quit", click: function () {
				app.isQuiting = true;
				app.quit();
			}
		}
	]);

	appIcon.setContextMenu(contextMenu);

	mainWindow.on("minimize", function (event) {
		event.preventDefault();
		mainWindow.hide();
	});

	mainWindow.on("show", function () {
		appIcon.setHighlightMode("always");
	});

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createWindow();

	//if (process.env.NODE_ENV !== "development") {
		startAutoUpdate();
	//}
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// Auto-Update
function startAutoUpdate() {
	// Check for internet before attempting to get updates
	dns.lookup("google.com", function (error) {
		if (!error) {
			if (fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe'))) {
				url = "https://streamdocsprod.blob.core.windows.net/onsi";
		
				electron.autoUpdater.setFeedURL(url);
		
				electron.autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName) => {
					electron.autoUpdater.quitAndInstall();
				});
		
				electron.autoUpdater.addListener("error", (error) => {
					electron.dialog.showMessageBox({ "message": "Auto updater error: " + error });
				});
		
				electron.autoUpdater.checkForUpdates();
			}
		}
		else {
			console.log('no internet');
		}
		// else we don't have internet so keep on keeping on
	});	
}