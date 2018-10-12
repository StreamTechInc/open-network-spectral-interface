const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;
const path = require("path");

let mainWindow;

function createWindow() {
	app.server = require(path.join(__dirname, "/express-server/dist/index.js"))();

	mainWindow = new BrowserWindow({
		width: 500,
		height: 500,
		autoHideMenuBar: true,
		useContentSize: true,
		icon: path.join(__dirname, "/express-server/dist/views/assets/img/favicon.ico"),
		backgroundColor: "#137ce5"
	});

	mainWindow.loadURL(`file://${__dirname}/index.html`);

	mainWindow.webContents.openDevTools();

	mainWindow.once("ready-to-show", () => {
		win.show();
	});

	mainWindow.on("close", () => {
		mainWindow.webContents.send("stop-server");
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	const appIcon = new Tray(path.join(__dirname, "/express-server/dist/views/assets/img/favicon.ico"));

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

	mainWindow.on("minimize", function (event) {
		event.preventDefault();
		win.hide();
	});

	mainWindow.on("show", function () {
		appIcon.setHighlightMode("always");
	});
}

app.on("ready", createWindow);

app.on("browser-window-created", function (e, window) {
	window.setMenu(null);
});

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", function () {
	if (mainWindow === null) {
		createWindow();
	}
});