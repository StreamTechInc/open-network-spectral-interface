/*
*   Handle any route for communicating with hardware
*/

import { Request, Response } from "express";
import { SeaBreeze } from "../hardware/SeaBreeze/SeaBreeze";
import { HardwareModel } from "../models/hardwareModel";
import { IHardware } from "../hardware/IHardware";
import { HardwareFactory } from "../hardware/IHardware";
import { SeaBreezeInitializer } from "../hardware/SeaBreeze/SeaBreezeInitializer";
import * as Common from "../common/common";
import { Logger } from "../common/logger";
import { HardwareSettingModel } from "../models/hardwareSettingModel";
import { HardwareResponse } from "../hardware/hardwareResponse";

let hardware: Array<IHardware>;

/**
 * GET /
 * Return unique device ids of all hardware attached
 */
export let getAttachedHardware = (req: Request, res: Response) => {
	Logger.Instance.WriteDebug("Start getAttachedHardware");
	let message: string = "";

	try {
		if (hardware === undefined) {
			hardware = new Array<IHardware>();
		}
	
		// Remove any uninitialized devices from array
		hardware = Common.RemoveUninitialized(hardware);
	
		// Use the SeaBreezeInitializer to find and init all seabreeze devices
		const seaBreezeInitializer = new SeaBreezeInitializer();
		const sbDevices = seaBreezeInitializer.getAllDevices(hardware);
	
		sbDevices.forEach(device => {
			hardware.push(device);
		});
	
		/**
		 * Add Other Initializers here
		 */	
		
		if (hardware.length == 0) {
			message = JSON.stringify("No devices found.");
		}
		else {
			message = JSON.stringify(hardware);
		}
		Logger.Instance.WriteDebug(message);
		res.send(message);
	} catch (error) {
		console.error("/hardware error:" + JSON.stringify(error.message));
		message = JSON.stringify({ error: error });
		res.send(message);
	}

	Logger.Instance.WriteDebug("End getAttachedHardware");
};

/**
 * GET / id
 * Return all settings for the specified device id
 */
export let getAllSettingsForDevice = (req: Request, res: Response) => {
	// Get ID from route parameters
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start getAllSettingsForDevice/" + id);

	// Init a new response with success = false
	let response: HardwareResponse = new HardwareResponse();

	// Check to make sure we have devices attached, set message accordingly if not
	if (hardware != undefined && hardware.length > 0) {
		// Try and find the device, check and log accordingly
		const device = Common.findDeviceById(hardware, id);

		if (device) {
			// Get settings if device found, set response to this one
			response = device.getSettings();
		}
		else {
			response.data = "Unable to find device";
		}
	}
	else {
		response.data = "No devices connected";
	}

	// If unsuccessful set status to 400
	if (!response.success) {
		res.status(400);
	}

	// Send out JSON'd data
	res.send(JSON.stringify(response));

	Logger.Instance.WriteDebug("End getAllSettingsForDevice/" + id);
};

/**
 * GET / id, settingId
 * Return value for specific setting
 */
export let getSetting = (req: Request, res: Response) => {
	// Get ID and SettingID from route parameters
	const id = req.params.id;
	const settingId = req.params.settingId;

	Logger.Instance.WriteDebug("Start getAllSetting/" + id + "/" + settingId);

	// Init a new response with success = false
	let response: HardwareResponse = new HardwareResponse();

	// Check to make sure we have devices attached, set message accordingly if not
	if (hardware != undefined && hardware.length > 0) {
		// Try and find the device, check and log accordingly
		const device = Common.findDeviceById(hardware, id);

		if (device) {
			// Get desired setting if device found, set response to this one
			response = device.getSettingValue(settingId);
		}
		else {
			response.data = "Unable to find device";
		}
	}
	else {
		response.data = "No devices connected";
	}

	// If unsuccessful set status to 400
	if (!response.success) {
		res.status(400);
	}

	// Send out JSON'd data
	res.send(JSON.stringify(response));

	Logger.Instance.WriteDebug("End getAllSetting/" + id + "/" + settingId);
};

/**
 * POST / id, settingId
 * Set a value for specific setting
 */
export let postSetting = (req: Request, res: Response) => {
	// Get ID and SettingID from route parameters
	const id = req.params.id;
	const settingId = req.params.settingId;

	Logger.Instance.WriteDebug("Start postSetting/" + id + "/" + settingId);

	// Init a new response with success = false
	let response: HardwareResponse = new HardwareResponse();

	try {
		// Get the JSON data from body
		const body: HardwareSettingModel = req.body;

		if (body) {
			// Check to make sure we have devices attached, set message accordingly if not
			if (hardware != undefined && hardware.length > 0) {
				// Try and find the device, check and log accordingly
				const device = Common.findDeviceById(hardware, id);

				if (device) {
					// Try to set desired setting if device found, set response to this one
					response = device.setSettingValue(settingId, body.value);
				}
				else {
					response.data = "Unable to find device";
				}
			}
			else {
				response.data = "No devices connected";
			}
		}
		else {
			response.data = "Unable to read data as HardwareSettingModel";
		}
	} catch (error) {
		Logger.Instance.WriteError(error);
		response.data = "Error occurred while trying to set value";
	}

	// If unsuccessful set status to 400
	if (!response.success) {
		res.status(400);
	}

	// Send out JSON'd data
	res.send(JSON.stringify(response));

	Logger.Instance.WriteDebug("End postSetting/" + id + "/" + settingId);
};

/**
 * GET / id
 * Triggers an exposure with current settings
 */
export let getCapture = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start getCapture/" + id);

	// Init a new response with success = false
	let response: HardwareResponse = new HardwareResponse();

	// Check to make sure we have devices attached, set message accordingly if not
	if (hardware != undefined && hardware.length > 0) {
		// Try and find the device, check and log accordingly
		const device = Common.findDeviceById(hardware, id);

		if (device) {
			// Try to set desired setting if device found, set response to this one
			response = device.capture();
		}
		else {
			response.data = "Unable to find device";
		}
	}
	else {
		response.data = "No devices connected";
	}

	// If unsuccessful set status to 400
	if (!response.success) {
		res.status(400);
	}

	// Send out JSON'd data
	res.send(JSON.stringify(response));

	Logger.Instance.WriteDebug("End getCapture/" + id);
};

/**
 * GET / id
 * Return status for device id
 */
export let getStatus = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start getStatus/" + id);

	const response: HardwareResponse = new HardwareResponse();	
	response.success = false;
	response.data = "Not implemented";

	// TODO: fill out the rest

	Logger.Instance.WriteDebug("End getStatus/" + id);

	if (!response.success) {
		res.status(500);
	}

	res.send(JSON.stringify(response));
};

/**
 * GET / id
 * Return list of frame acquisitions subsciptions for device id
 */
export let getFrameAcquisition = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start getFrameAcquisition/" + id);

	const response: HardwareResponse = new HardwareResponse();	
	response.success = false;
	response.data = "Not implemented";

	// TODO: fill out the rest

	Logger.Instance.WriteDebug("End getFrameAcquisition/" + id);
	
	if (!response.success) {
		res.status(500);
	}

	res.send(JSON.stringify(response));
};

/**
 * POST / id
 * Add a subscription to a frame acquisition for a device id
 */
export let postFrameAcquisition = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start postFrameAcquisition/" + id);

	const response: HardwareResponse = new HardwareResponse();	
	response.success = false;
	response.data = "Not implemented";

	// TODO: fill out the rest

	Logger.Instance.WriteDebug("End postFrameAcquisition/" + id);

	if (!response.success) {
		res.status(500);
	}

	res.send(JSON.stringify(response));
};

/**
 * DELETE / id
 * Delete a subscription to a frame acquistion for a device id
 */
export let deleteFrameAcquisition = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start deleteFrameAcquisition/" + id);

	const response: HardwareResponse = new HardwareResponse();	
	response.success = false;
	response.data = "Not implemented";

	// TODO: fill out the rest

	Logger.Instance.WriteDebug("End deleteFrameAcquisition/" + id);

	if (!response.success) {
		res.status(500);
	}

	res.send(JSON.stringify(response));
};

/**
 * GET / id
 * Return URI of a stream manifest file
 */
export let getStream = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start getStream/" + id);

	const response: HardwareResponse = new HardwareResponse();	
	response.success = false;
	response.data = "Not implemented";

	// TODO: fill out the rest

	Logger.Instance.WriteDebug("End getStream/" + id);

	if (!response.success) {
		res.status(500);
	}

	res.send(JSON.stringify(response));
};

/**
 * POST / id
 * Start or stop a stream for a device id
 */
export let postStream = (req: Request, res: Response) => {
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start postStream/" + id);

	const response: HardwareResponse = new HardwareResponse();	
	response.success = false;
	response.data = "Not implemented";

	// TODO: fill out the rest
	Logger.Instance.WriteDebug("End postStream/" + id);

	if (!response.success) {
		res.status(500);
	}

	res.send(JSON.stringify(response));
};

/**
 * GET / id
 * Shutdown the device
 */
export let shutdown = (req: Request, res: Response) => {
	if (hardware && hardware.length > 0) {
		hardware.forEach((element: IHardware) => {
			element.closeDevice();
		});
	}

	res.send(true);
};