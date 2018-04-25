/*
*   Module Dependencies
*/
import * as express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import * as errorHandler from "errorhandler";
import { Logger } from "./common/logger";
import * as fs from "fs";
import * as cors from "cors";

/**
 *  Load environment variables from .env here
 */
dotenv.config({ path: ".env" });

/**
 * Controllers
 */
import * as hardwareController from "./controllers/hardware";

/**
 * Create Server
 */
const app = express();

/**
 * Server Configuration
 */
app.set("port", process.env.PORT || 3200);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
	Logger.Instance.WriteInfo(req.url);
	next();
});
app.use(cors());
app.use(function (err: any, req: any, res: any, next: any) {
	Logger.Instance.WriteInfo("Error: " + JSON.stringify(err) + " || Request: " + req.url);
	next(err);
});


/**
 * App Routes
 */

// hardwareController
app.get("/hardware", hardwareController.getAttachedHardware);
app.get("/hardware/:id/setting", hardwareController.getAllPropertiesForDevice);
app.get("/hardware/:id/setting/:settingId", hardwareController.getProperty);
app.post("/hardware/:id/setting/:settingId", hardwareController.postProperty);
app.get("/hardware/:id/capture", hardwareController.getCapture);
app.get("/hardware/:id/status", hardwareController.getStatus);
app.get("/hardware/:id/frame-acquisition", hardwareController.getFrameAcquisition);
app.post("/hardware/:id/frame-acquisition", hardwareController.postFrameAcquisition);
app.delete("/hardware/:id/frame-acquisition", hardwareController.deleteFrameAcquisition);
app.get("/hardware/:id/stream", hardwareController.getStream);
app.post("/hardware/:id/stream", hardwareController.postStream);
app.get("/hardware/shutdown", hardwareController.shutdown);

/**
 * Error Handler - Provides full stack - REMOVE FOR PRODUCTION
 */
if (process.env.APP_ENV == "local") {
	app.use(errorHandler());
}

/**
 * Start Server
 */
const server = app.listen(app.get("port"), () => {
	console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
	console.log("  Press CTRL-C to stop\n");
});

process.on("uncaughtException", err => {
	Logger.Instance.WriteError(err);
});

const gracefulShutdown = () => {
	console.log("attemping graceful shutdown");

	server.close(() => {
		console.log("HTTP: Closed out remaining connections.");
	});
};

// listen for TERM signal .e.g. kill 
process.on("SIGTERM", gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on("SIGINT", gracefulShutdown);


module.exports = app;