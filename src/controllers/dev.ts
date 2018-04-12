/*
*   In here we can keep any endpoints that may be useful during developement
*/

import { Request, Response } from "express";

/**
 * GET /
 * Server Status
 */
export let status = (req: Request, res: Response) => {
	res.send("TODO: Return server status here!");
};


/**
 * GET /
 * API Version
 */
export let version = (req: Request, res: Response) => {
	res.send("0.0.1");
};