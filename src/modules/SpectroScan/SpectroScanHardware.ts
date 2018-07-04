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
						if (handle > 0) {
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
					resolve(this._devices);
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
		this._devices = new Array<SpectroScanDevice>();
		return true;
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