import * as express from "express";
import { createServer, Server } from "http";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";

import { HardwareController } from "./controllers/hardware.controller";
import { Logger } from "./common/logger";
import * as path from "path";

export class WebServer {
	private app: express.Application;
	private server: Server;

	constructor() {
		this.CreateApp();
		this.SetUpRoutes();
		this.CreateServer();
		this.Listen();
	}

	public GetApp(): express.Application {
		return this.app;
	}

	private CreateApp(): void {
		dotenv.config({ path: ".env" });

		this.app = express();

		this.app.set("port", process.env.PORT || 3200);
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));

		this.app.use(function (req, res, next) {
			Logger.Instance.WriteInfo(req.url);
			next();
		});

		this.app.use(function (err: any, req: any, res: any, next: any) {
			Logger.Instance.WriteInfo("Error: " + JSON.stringify(err) + " || Request: " + req.url);
			next(err);
		});
	}

	private SetUpRoutes(): void {
		// Hardware Controller
		this.app.get("/hardware", HardwareController.GetAttachedHardware);
		this.app.get("/hardware/:id/setting", HardwareController.GetAllPropertiesForDevice);
		this.app.get("/hardware/:id/setting/:settingId", HardwareController.GetProperty);
		this.app.post("/hardware/:id/setting/:settingId", HardwareController.SetProperty);
		this.app.get("/hardware/:id/capture", HardwareController.Capture);

		// All others
		this.app.all("/", (req, res) => {
			res.sendFile("main.html", { root: path.join(__dirname, "/views") });
		});

		this.app.all("/img", (req, res) => {
			res.sendFile("logo_white.png", { root: path.join(__dirname, "/views/assets/img") });
		});

		this.app.all("/css", (req, res) => {
			res.sendFile("main.css", { root: path.join(__dirname, "/views/assets/css") });
		});
	}

	private CreateServer(): void {
		this.server = createServer(this.app);
	}

	private Listen() {
		this.server.listen(process.env.PORT || 3000, () => {
			console.log(("  App is running at http://localhost:%d in %s mode"), this.app.get("port"), this.app.get("env"));
			console.log("  Press CTRL-C to stop\n");
		});
	}
}