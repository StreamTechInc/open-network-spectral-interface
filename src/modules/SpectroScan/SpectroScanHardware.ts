import { IHardwareType } from "../../interfaces/IHardwareType";
import { SpectroScanDevice } from "./SpectroScanDevice";
import { Logger } from "../../common/logger";
import { SpectroScanAPI } from "./SpectroScanAPI";

export class SpectroScanHardware implements IHardwareType {
	private _devices: Array<SpectroScanDevice> = new Array<SpectroScanDevice>();

	public GetDevices(): Promise<Array<SpectroScanDevice>> {
		Logger.Instance.WriteDebug("Start SoftSpecHardware.GetDevices");

		return new Promise<Array<SpectroScanDevice>>((resolve, reject) => {
			// Added 4 second delay to prevent error.
			// When refreshing devices through CC software we would get an error if attempting to refresh too soon after
			// disconnecting and reconnecting device.
			setTimeout(() => {
				try {
					if (this._devices.length === 0) {
						SpectroScanAPI.Instance.SetupDevice().then((handle: number) => {
							if (handle && handle > 0) {
								const device = new SpectroScanDevice();
								device.handle = handle;
								SpectroScanAPI.Instance.GetDeviceDetails(handle).then((details: string) => {
									const splitDetails = details.split("-");

									if (splitDetails.length > 2 && splitDetails[1] && splitDetails[2]) {
										device.serial = splitDetails[1];
										device.modelName = splitDetails[2];
									}

									this._devices.push(device);
									resolve(this._devices);
								}, (detailsError) => {
									reject(detailsError);
								});
							}
							else {
								this._devices = [];
								resolve(this._devices);
							}
						}, (setupError) => {
							reject(setupError);
						});
					}
					else {
						const testResult: boolean = SpectroScanAPI.Instance.TestDevice(this._devices[0].handle);

						if (!testResult) {
							this._devices = [];
						}

						resolve(this._devices);
					}
				} catch (error) {
					reject(error);
				}
			}, 4000);
		});
	}

	public GetDeviceById(id: string) {
		Logger.Instance.WriteDebug("Start SpectroScanHardware.GetDeviceById: " + id);

		let foundDevice: SpectroScanDevice = undefined;

		try {
			this._devices.forEach((device) => {
				if (device.id.toString() === id) {
					foundDevice = device;
				}
			});
		} catch (error) {
			Logger.Instance.WriteError(error);
			throw error;
		}

		return foundDevice;
	}

	public CloseDevices(): boolean {
		let status = true;

		this._devices.forEach(device => {
			if (!SpectroScanAPI.Instance.CloseDevice(device.handle)) {
				status = false;
			}
		});

		return status;
	}

	private CheckIfDeviceExists(device: SpectroScanDevice): boolean {
		let doesExist = false;

		this._devices.forEach(element => {
			if (device.handle === element.handle) {
				doesExist = true;
			}
		});

		return doesExist;
	}
}