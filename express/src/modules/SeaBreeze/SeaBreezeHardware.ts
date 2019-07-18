import { IHardwareType } from "../../interfaces/IHardwareType";
import { Logger } from "../../common/logger";
import { SeaBreezeAPI } from "./SeaBreezeAPI";
import { SeaBreezeDevice } from "./SeaBreezeDevice";
import { resolve } from "dns";

export class SeaBreezeHardware implements IHardwareType {

	/**
	 * Class members
	 */
	private _devices: Array<SeaBreezeDevice> = new Array<SeaBreezeDevice>();

	/**
	 * Public Functions
	 */
	public GetDevices(): Promise<Array<SeaBreezeDevice>> {
		Logger.Instance.WriteDebug("Start SeaBreezeHardware.GetDevices");

		return new Promise<Array<SeaBreezeDevice>>((resolve, reject) => {
			try {

				let keepOpening: boolean = true;
				let deviceIndex: number = 0;

				while (keepOpening) {
					const seaBreezeDevice = new SeaBreezeDevice();
					seaBreezeDevice.apiID = deviceIndex;

					if (!this.CheckIfDeviceExists(seaBreezeDevice)) {
						if (SeaBreezeAPI.Instance.OpenDevice(deviceIndex)) {
							seaBreezeDevice.serial = SeaBreezeAPI.Instance.GetSerialNumber(seaBreezeDevice.apiID);
							seaBreezeDevice.modelName = SeaBreezeAPI.Instance.GetModelNumber(seaBreezeDevice.apiID);

							this._devices.push(seaBreezeDevice);
						}
						else {
							keepOpening = false;
						}
					}
					else {
						if (SeaBreezeAPI.Instance.GetFormattedSpectrumLength(seaBreezeDevice.apiID) <= 0) {
							this._devices.splice(deviceIndex, 1);
						}
					}

					deviceIndex++;
				}
			} 
			catch (error) {
				Logger.Instance.WriteError(error);
				this._devices = [];
				reject(error);
			}

			resolve(this._devices);
		});
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