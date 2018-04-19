/*
*   Handle any route for communicating with hardware
*/

import { Request, Response } from "express";
import { Logger } from "../common/logger";
import { IHardware } from "../interfaces/IHardware";
import { HardwareTypes } from "../modules/HardwareTypes";
import { HardwareResponse } from "../models/hardware-response";
import { IProperty } from "../interfaces/IProperty";
import { Helpers } from "../common/helpers";

/**
 * GET /
 * Return unique device ids, serial and model numbers of all hardware attached
 */
export let getAttachedHardware = (req: Request, res: Response) => {
	Logger.Instance.WriteDebug("Start getAttachedHardware");

	const hardwareResponse: HardwareResponse = new HardwareResponse();
	hardwareResponse.success = true;

	try {
		const hardware = new Array<IHardware>();

		HardwareTypes.Instance.AvailableHardwareTypes.forEach((element) => {
			const tempArray = element.GetDevices();

			tempArray.forEach((iHardware) => {
				hardware.push(iHardware);
			});
		});

		if (hardware.length == 0) {
			hardwareResponse.data = "No devices found.";
		}
		else {
			hardwareResponse.data = hardware;
		}
	} catch (error) {
		hardwareResponse.data = error;
		hardwareResponse.success = false;
		res.status(400);
	}

	res.send(JSON.stringify(hardwareResponse));
};

/**
 * GET / id
 * Return all settings for the specified device id
 */
export let getAllSettingsForDevice = (req: Request, res: Response) => {
	// Get ID from route parameters
	const id = req.params.id;

	Logger.Instance.WriteDebug("Start getAllSettingsForDevice/" + id);

	const hardwareResponse: HardwareResponse = new HardwareResponse();
	hardwareResponse.success = true;

	try {
		let device: IHardware;

		for (let index = 0; index < HardwareTypes.Instance.AvailableHardwareTypes.length; index++) {
			const element = HardwareTypes.Instance.AvailableHardwareTypes[index];

			const tempDevice = element.GetDeviceById(id);

			if (tempDevice) {
				device = tempDevice;
				break;
			}
		}

		if (device) {
			hardwareResponse.data = device.GetProperties();
		}
		else {
			hardwareResponse.data = "No device found with ID: " + id;
			hardwareResponse.success = false;
		}

	} catch (error) {
		hardwareResponse.data = error;
		hardwareResponse.success = false;
		res.status(400);
	}

	res.send(JSON.stringify(hardwareResponse));

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

	Logger.Instance.WriteDebug("Start getSetting/" + id + "/" + settingId);

	// Init a new response with success = false
	const hardwareResponse: HardwareResponse = new HardwareResponse();
	hardwareResponse.success = true;

	try {
		let device: IHardware;

		for (let index = 0; index < HardwareTypes.Instance.AvailableHardwareTypes.length; index++) {
			const element = HardwareTypes.Instance.AvailableHardwareTypes[index];

			const tempDevice = element.GetDeviceById(id);

			if (tempDevice) {
				device = tempDevice;
				break;
			}
		}

		if (device) {
			const tempProp = device.GetProperty(settingId);

			if (tempProp) {
				hardwareResponse.data = tempProp;
			}
			else {
				hardwareResponse.data = "Property " + settingId + " does not exist or an error has occurred";
				hardwareResponse.success = false;
			}
		}
		else {
			hardwareResponse.data = "No device found with ID: " + id;
			hardwareResponse.success = false;
		}

	} catch (error) {
		hardwareResponse.data = error;
		hardwareResponse.success = false;
		res.status(400);
	}

	res.send(JSON.stringify(hardwareResponse));

	Logger.Instance.WriteDebug("End getSetting/" + id + "/" + settingId);
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
	let hardwareResponse: HardwareResponse = new HardwareResponse();
	hardwareResponse.success = true;

	try {
		// Get the JSON data from body
		const body: IProperty = req.body;

		if (body) {
			let device: IHardware;

			for (let index = 0; index < HardwareTypes.Instance.AvailableHardwareTypes.length; index++) {
				const element = HardwareTypes.Instance.AvailableHardwareTypes[index];

				const tempDevice = element.GetDeviceById(id);

				if (tempDevice) {
					device = tempDevice;
					break;
				}
			}

			if (device) {
				const comparerProperty = device.GetProperty(settingId);
				const validationResult = Helpers.Instance.ValidateProperty(comparerProperty, body);

				if (validationResult.success) {
					const setResponse = device.SetProperty(body);

					if (setResponse instanceof Error) {
						hardwareResponse.data = setResponse.message;
						hardwareResponse.success = false;
					}
					else {
						hardwareResponse.data = setResponse;
					}
				}
				else {
					hardwareResponse = validationResult;
				}
			}
			else {
				hardwareResponse.data = "No device found with ID: " + id;
				hardwareResponse.success = false;
			}
		}
		else {
			hardwareResponse.data = "Unable to read data as HardwareSettingModel";
			hardwareResponse.success = false;
		}
	} catch (error) {
		hardwareResponse.data = error;
		hardwareResponse.success = false;
		res.status(400);
	}

	// Send out JSON'd data
	res.send(JSON.stringify(hardwareResponse));

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
	const hardwareResponse: HardwareResponse = new HardwareResponse();
	hardwareResponse.success = true;

	try {
		let device: IHardware;

		for (let index = 0; index < HardwareTypes.Instance.AvailableHardwareTypes.length; index++) {
			const element = HardwareTypes.Instance.AvailableHardwareTypes[index];

			const tempDevice = element.GetDeviceById(id);

			if (tempDevice) {
				device = tempDevice;
				break;
			}
		}

		if (device) {
			const captureResponse = device.Capture();

			if (captureResponse instanceof Error) {
				hardwareResponse.success = false;
				hardwareResponse.data = captureResponse.message;
			}
			else {
				hardwareResponse.data = captureResponse;
			}
		}
		else {
			hardwareResponse.data = "No device found with ID: " + id;
			hardwareResponse.success = false;
		}

	} catch (error) {
		hardwareResponse.data = error;
		hardwareResponse.success = false;
		res.status(400);
	}

	// Send out JSON'd data
	res.send(JSON.stringify(hardwareResponse));

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
	// if (hardware && hardware.length > 0) {
	// 	hardware.forEach((element: IHardware) => {
	// 		element.closeDevice();
	// 	});
	// }

	res.send(true);
};