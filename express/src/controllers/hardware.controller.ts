import { Request, Response } from 'express';
import { Logger } from '../common/logger';
import { HardwareResponse } from '../models/hardware-response';
import { IHardware } from '../interfaces/IHardware';
import { HardwareTypes } from '../modules/HardwareTypes';
import { IProperty } from '../interfaces/IProperty';
import { Helpers } from '../common/helpers';

export class HardwareController {
	/**
	 * GET /
	 * Return unique device ids, serial and model numbers of all hardware attached
	 */
	public static GetAttachedHardware(request: Request, response: Response) {
		Logger.Instance.WriteDebug('Start getAttachedHardware');

		const hardwareResponse: HardwareResponse = new HardwareResponse();
		hardwareResponse.success = true;

		try {
			const hardware = new Array<IHardware>();
			const promiseArray = new Array<Promise<Array<IHardware>>>();

			HardwareTypes.Instance.AvailableHardwareTypes.forEach((element) => {
				promiseArray.push(element.GetDevices());
			});

			Promise.all(promiseArray).then((devices: any) => {
				devices.forEach((hardwareType: any) => {
					hardwareType.forEach((device: any) => {
						hardware.push(device);
					});
				});

				if (hardware.length == 0) {
					hardwareResponse.data = 'No devices found.';
				}
				else {
					hardwareResponse.data = hardware;
				}

				response.send(JSON.stringify(hardwareResponse));
			}, (promiseError: Error) => {
				hardwareResponse.data = promiseError;
				hardwareResponse.success = false;
				response.status(400);
				response.send(JSON.stringify(hardwareResponse));
			}).catch((catchError: Error) => {
				hardwareResponse.data = catchError;
				hardwareResponse.success = false;
				response.status(400);
				response.send(JSON.stringify(hardwareResponse));
			});
		} catch (error) {
			hardwareResponse.data = error;
			hardwareResponse.success = false;
			response.status(400);
			response.send(JSON.stringify(hardwareResponse));
		}
	}

	/**
	 * GET / id
	 * Return all settings for the specified device id
	 */
	public static GetAllPropertiesForDevice(request: Request, response: Response) {
		const id = request.params.id;

		Logger.Instance.WriteDebug('Start getAllSettingsForDevice/' + id);

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
				device.GetProperties().then((properties) => {
					hardwareResponse.data = properties;
					response.send(JSON.stringify(hardwareResponse));
				}, (getPropsError) => {
					hardwareResponse.data = getPropsError;
					hardwareResponse.success = false;
					response.status(400);
					response.send(JSON.stringify(hardwareResponse));
				});
			}
			else {
				hardwareResponse.data = 'No device found with ID: ' + id;
				hardwareResponse.success = false;
				response.send(JSON.stringify(hardwareResponse));
			}

		} catch (error) {
			hardwareResponse.data = error;
			hardwareResponse.success = false;
			response.status(400);
			response.send(JSON.stringify(hardwareResponse));
		}

		Logger.Instance.WriteDebug('End getAllSettingsForDevice/' + id);
	}

	/**
	 * GET / id, settingId
	 * Return value for specific setting
	 */
	public static GetProperty(request: Request, response: Response) {
		const id = request.params.id;
		const settingId = request.params.settingId;

		Logger.Instance.WriteDebug('Start getSetting/' + id + '/' + settingId);

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
				device.GetProperty(settingId).then((property) => {
					if (property) {
						hardwareResponse.data = property;
					}
					else {
						hardwareResponse.data = 'Property ' + settingId + ' does not exist or an error has occurred';
						hardwareResponse.success = false;
					}

					response.send(JSON.stringify(hardwareResponse));
				});
			}
			else {
				hardwareResponse.data = 'No device found with ID: ' + id;
				hardwareResponse.success = false;
				response.send(JSON.stringify(hardwareResponse));
			}

		} catch (error) {
			hardwareResponse.data = error;
			hardwareResponse.success = false;
			response.status(400);
			response.send(JSON.stringify(hardwareResponse));
		}

		Logger.Instance.WriteDebug('End getSetting/' + id + '/' + settingId);
	}

	/**
	 * POST / id, settingId
	 * Set a value for specific setting
	 */
	public static SetProperty(request: Request, response: Response) {
		const id = request.params.id;
		const settingId = request.params.settingId;

		Logger.Instance.WriteDebug('Start postSetting/' + id + '/' + settingId);

		// Init a new response with success = false
		let hardwareResponse: HardwareResponse = new HardwareResponse();
		hardwareResponse.success = true;

		try {
			// Get the JSON data from body
			const body: IProperty = request.body;

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
					device.GetProperty(settingId).then((comparerProperty) => {
						const validationResult = Helpers.Instance.ValidateProperty(comparerProperty, body);

						if (validationResult.success) {
							const setResponse = device.SetProperty(body).then((property) => {
								hardwareResponse.data = setResponse;
								response.send(JSON.stringify(hardwareResponse));
							}, (setError) => {
								hardwareResponse.data = setError;
								hardwareResponse.success = false;
								response.send(JSON.stringify(hardwareResponse));
							});
						}
						else {
							hardwareResponse = validationResult;
							response.send(JSON.stringify(hardwareResponse));
						}
					});
				}
				else {
					hardwareResponse.data = 'No device found with ID: ' + id;
					hardwareResponse.success = false;
					response.send(JSON.stringify(hardwareResponse));
				}
			}
			else {
				hardwareResponse.data = 'Unable to read data as HardwareSettingModel';
				hardwareResponse.success = false;
				response.send(JSON.stringify(hardwareResponse));
			}
		} catch (error) {
			hardwareResponse.data = error;
			hardwareResponse.success = false;
			response.status(400);
			response.send(JSON.stringify(hardwareResponse));
		}

		Logger.Instance.WriteDebug('End postSetting/' + id + '/' + settingId);
	}

	/**
	 * GET / id
	 * Triggers an exposure with current settings
	 */
	public static Capture(request: Request, response: Response) {
		const id = request.params.id;

		Logger.Instance.WriteDebug('Start getCapture/' + id);

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
				let isTimedOut: boolean = false;

				response.setTimeout(device.timeout, () => {
					isTimedOut = true;
					response.status(408);
					response.send('Capture timed out');
				});

				device.Capture().then((data) => {
					if (!isTimedOut) {
						hardwareResponse.data = data;
						response.send(JSON.stringify(hardwareResponse));
						Logger.Instance.WriteDebug('End getCapture/' + id);
					}
				}, (captureError) => {
					if (!isTimedOut) {
						console.log('capture error', captureError);
						hardwareResponse.success = false;
						hardwareResponse.data = captureError;
						response.status(400);
						response.send(JSON.stringify(hardwareResponse));
						Logger.Instance.WriteDebug('End getCapture/' + id);
					}
				});
			}
			else {
				hardwareResponse.data = 'No device found with ID: ' + id;
				hardwareResponse.success = false;
			}

		} catch (error) {
			hardwareResponse.data = error;
			hardwareResponse.success = false;
			response.status(400);
			response.send(JSON.stringify(hardwareResponse));
		}
	}
}