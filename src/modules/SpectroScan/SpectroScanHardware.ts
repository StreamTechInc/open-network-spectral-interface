import { IHardwareType } from "../../interfaces/IHardwareType";
import { SpectroScanDevice } from "./SpectroScanDevice";
import { Logger } from "../../common/logger";
import { SpectroScanAPI } from "./SpectroScanAPI";

export class SpectroScanHardware implements IHardwareType {
	private _devices: Array<SpectroScanDevice> = new Array<SpectroScanDevice>();

	public GetDevices(): Array<SpectroScanDevice> {
		Logger.Instance.WriteDebug("Start SoftSpecHardware.GetDevices");

		try {
			/**
			 * Frow now just only allow one SpectroScan device at a time
			 */
			if (this._devices.length == 0) {
				const deviceHandle = SpectroScanAPI.Instance.DeviceConnect();

				const device = new SpectroScanDevice();
				device.handle = deviceHandle;

				// Using values sent in sample app
				SpectroScanAPI.Instance.UpdateAlignment(device.handle, 30, 30);

				this._devices.push(device);
			}

			/**
			 * Leave this for now. Will need it later
			 */
			// if (!this.CheckIfDeviceExists(device)) {
			// 	// Get model number
			// 	// Get serial number

			// 	this._devices.push(device);
			// }


		} catch (error) {
			Logger.Instance.WriteError(error);
			this._devices = [];
			throw error;
		}

		return this._devices;
	}

	public GetDeviceById(id: string) {
		Logger.Instance.WriteDebug("Start SoftSpecHardware.GetDeviceById: " + id);
		
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