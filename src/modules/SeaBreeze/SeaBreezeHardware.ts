import { IHardwareType } from "../../interfaces/IHardwareType";
import { Logger } from "../../common/logger";
import { SeaBreezeAPI } from "./SeaBreezeAPI";
import { SeaBreezeDevice } from "./SeaBreezeDevice";

export class SeaBreezeHardware implements IHardwareType {

	/**
	 * Class members
	 */
	private _devices: Array<SeaBreezeDevice> = new Array<SeaBreezeDevice>();

	/**
	 * Public Functions
	 */
	public GetDevices(): Array<SeaBreezeDevice> {
		Logger.Instance.WriteDebug("Start SeaBreezeHardware.GetDevices");

		try {
			const probedDeviceCount = SeaBreezeAPI.Instance.ProbeDevices();

			if (probedDeviceCount > 0) {
				const deviceIds = SeaBreezeAPI.Instance.GetDeviceIds();

				for (let index = 0; index < deviceIds.length; index++) {
					const seaBreezeDevice = new SeaBreezeDevice();
					seaBreezeDevice.apiID = deviceIds[index];

					if (!this.CheckIfDeviceExists(seaBreezeDevice)) {
						if (SeaBreezeAPI.Instance.OpenDevice(seaBreezeDevice.apiID)) {
							seaBreezeDevice.serial = SeaBreezeAPI.Instance.GetSerialNumber(seaBreezeDevice.apiID);
							seaBreezeDevice.modelName = SeaBreezeAPI.Instance.GetModelNumber(seaBreezeDevice.apiID);

							this._devices.push(seaBreezeDevice);
						}
					}
				}
			}
			else {
				// If the probed device count is 0 that mean no devices are connected
				// so we can clear out our existing array
				this._devices = new Array<SeaBreezeDevice>();
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			this._devices = [];
			throw error;
		}

		return this._devices;
	}

	public GetDeviceById(id: string): SeaBreezeDevice {
		Logger.Instance.WriteDebug("Start SeaBreezeHardware.GetDeviceById: " + id);
		
		let foundDevice: SeaBreezeDevice = undefined;

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
		return false;
	}

	/**
	 * Private Functions
	 */
	private CheckIfDeviceExists(device: SeaBreezeDevice): boolean {
		let doesExist = false;

		this._devices.forEach(element => {
			if (device.apiID === element.apiID) {
				doesExist = true;
			}
		});

		return doesExist;
	}
}