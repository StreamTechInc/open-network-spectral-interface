const { app, BrowserWindow, Tray, Menu } = require("electron");
import * as path from "path";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: any;

function createWindow() {

	// Instantiate Express App
	app.server = require(path.join(__dirname, "/server/index.js"))();

	// Create the browser window.
	win = new BrowserWindow({
		width: 500,
		height: 500,
		autoHideMenuBar: true,
		useContentSize: true,
		icon: path.join(__dirname, "/server/views/assets/img/favicon.ico"),
		backgroundColor: "#137ce5"
	});
	// win.maximize();

	// and load the index.html of the app.
	// win.loadURL("http://localhost:3200");
	win.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	// win.webContents.openDevTools();

	win.focus();

	win.once("ready-to-show", () => {
		win.show();
	});

	win.on("close", () => {
		win.webContents.send("stop-server");
	});

	// Emitted when the window is closed.
	win.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	const appIcon = new Tray(path.join(__dirname, "/server/views/assets/img/favicon.ico"));

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Show App", click: function () {
				win.show();
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

	win.on("minimize", function (event: any) {
		event.preventDefault();
		win.hide();
	});

	win.on("show", function () {
		appIcon.setHighlightMode("always");
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

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
	if (win === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
