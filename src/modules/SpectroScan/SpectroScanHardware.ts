import { IHardwareType } from "../../interfaces/IHardwareType";
import { SpectroScanDevice } from "./SpectroScanDevice";
import { Logger } from "../../common/logger";
import { SpectroScanAPI } from "./SpectroScanAPI";

export class SpectroScanHardware implements IHardwareType {
	private _devices: Array<SpectroScanDevice> = new Array<SpectroScanDevice>();

	public GetDevices(): Promise<Array<SpectroScanDevice>> {
		Logger.Instance.WriteDebug("Start SoftSpecHardware.GetDevices");

		return new Promise<Array<SpectroScanDevice>>((resolve, reject) => {
			try {
				if (this._devices.length === 0) {
					SpectroScanAPI.Instance.SetupDevice().then((handle: number) => {
						if (handle && handle > 0) {
							const device = new SpectroScanDevice();
							device.handle = handle;

							this._devices.push(device);
						}

						resolve(this._devices);
					}, (setupError) => {
						reject(setupError);
					});
				}
				else {
					SpectroScanAPI.Instance.SetupDevice().then((handle: number) => {
						if (handle && handle > 0) {
							this._devices[0].handle = handle;
						}
						else {
							this._devices = [];
						}

						resolve(this._devices);
					}, (setupError) => {
						this._devices = [];
						reject(setupError);
					});
				}
			} catch (error) {
				reject(error);
			}
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