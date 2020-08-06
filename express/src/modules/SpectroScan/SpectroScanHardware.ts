import { IHardwareType } from '../../interfaces/IHardwareType';
import { SpectroScanDevice } from './SpectroScanDevice';
import { Logger } from '../../common/logger';
import { SpectroScanAPI } from './SpectroScanAPI';

export class SpectroScanHardware implements IHardwareType {
	private _devices: Array<SpectroScanDevice> = new Array<SpectroScanDevice>();

	public GetDevices(): Promise<Array<SpectroScanDevice>> {
		Logger.Instance.WriteDebug('Start SpectroScanHardware.GetDevices');

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
								SpectroScanAPI.Instance.GetDeviceDetails(handle).then((details: string[]) => {
									if (details.length > 2 && details[1] && details[2] && details[3]) {
										device.serial = details[1];
										device.modelName = details[2];
										device.majorVersion = +details[3];

										// If this uses the console app to read the spectrum we must close this connection
										// or the console app won't be able to connect
										if (device.majorVersion === 4) {
											SpectroScanAPI.Instance.CloseDevice(device.handle);
										}
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

						if (this._devices[0].majorVersion === 3) {
							const testResult: boolean = SpectroScanAPI.Instance.TestDevice(this._devices[0].handle);

							if (!testResult) {
								this._devices = [];
							}
						}						

						resolve(this._devices);
					}
				} catch (error) {
					console.error(error);
					reject(error);
				}
			}, 4000);
		});
	}

	public GetDeviceById(id: string) {
		Logger.Instance.WriteDebug('Start SpectroScanHardware.GetDeviceById: ' + id);

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