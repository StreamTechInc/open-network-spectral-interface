/*
*   Here are handlers for the WIFI set up from the UI
*/

import { Request, Response } from "express";
const wifi = require("node-wifi");
// tslint:disable-next-line:no-null-keyword
wifi.init({ iface: null });

/**
 * GET /
 * List of networks available
 */
export let scan = (req: Request, res: Response) => {
	let returnMessage = "";

	wifi.scan(function (err: any, networks: any) {
		if (err) {
			returnMessage = err;
		}
		else {
			returnMessage = networks;
		}

		res.send(JSON.stringify(returnMessage));
	});
};

export let currentConnection = (req: Request, res: Response) => {
	let returnMessage = "";

	wifi.getCurrentConnections(function (err: any, currentConnections: any) {
		if (err) {
			returnMessage = err;
		}
		else {
			returnMessage = currentConnections;
		}
	});
};

export let disconnect = (req: Request, res: Response) => {
	let returnMessage = "";

	wifi.disconnect(function (err: any) {
		if (err) {
			returnMessage = err;
		}
		else {
			returnMessage = "Disconnected";
		}
	});
};

export let connect = (req: Request, res: Response) => {
	const ssid = req.params.ssid;
	const pass = req.params.password;

	let returnMessage = "";

	wifi.connect({ ssid : ssid, password : pass}, function(err: any) {
		if (err) {
			returnMessage = err;
		}
		else {
			returnMessage = "Connected";
		}
	});
};