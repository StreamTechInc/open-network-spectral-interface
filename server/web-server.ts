import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import { createServer, Server } from "http";

import { Logger } from "./common/logger";
import { HardwareController } from "./controllers/hardware.controller";
import { Config } from "./common/config";

export class WebServer {
	private application: express.Application;
	private server: Server;

	constructor() {
		this.CreateApplication();
		this.SetupRoutes();
		this.CreateServer();
		this.Listen();
	}

	public GetApplication(): express.Application {
		return this.application;
	}

	private CreateApplication() {
		this.application = express();

		this.application.set("env", process.env.NODE_ENV);
		this.application.set("port", Config.PortNumber);
		this.application.use(bodyParser.json());
		this.application.use(bodyParser.urlencoded({ extended: true }));

		this.application.use(function (req, res, next) {
			Logger.Instance.WriteInfo(req.url);
			next();
		});

		this.application.use(function (err: any, req: any, res: any, next: any) {
			Logger.Instance.WriteInfo("Error: " + JSON.stringify(err) + " || Request: " + req.url);
			next(err);
		});
	}

	private SetupRoutes() {
		// Hardware Controller
		this.application.get("/hardware", HardwareController.GetAttachedHardware);
		this.application.get("/hardware/:id/setting", HardwareController.GetAllPropertiesForDevice);
		this.application.get("/hardware/:id/setting/:settingId", HardwareController.GetProperty);
		this.application.post("/hardware/:id/setting/:settingId", HardwareController.SetProperty);
		this.application.get("/hardware/:id/capture", HardwareController.Capture);

		// All others
		this.application.all("*", (req, res) => {
			res.sendFile("index.html", { root: path.join(__dirname, "views") });
		});
	}

	private CreateServer(): void {
		this.server = createServer(this.application);
	}

	private Listen() {
		this.server.listen(Config.PortNumber, () => {
			console.log(("  App is running at http://localhost:%d in %s mode"), this.application.get("port"), this.application.get("env"));
			console.log("  Press CTRL-C to stop\n");
		});
	}
}