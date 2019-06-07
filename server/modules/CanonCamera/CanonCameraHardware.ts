import { IHardwareType } from "../../interfaces/IHardwareType";
import { CanonCameraDevice } from "./CanonCameraDevice";
import { CanonCameraAPI } from "./CanonCameraAPI";
import { Logger } from "../../common/logger";

export class CanonCameraHardware implements IHardwareType {

	private _devices: Array<CanonCameraDevice> = new Array<CanonCameraDevice>();

	public async GetDevices(): Promise<Array<CanonCameraDevice>> {
		Logger.Instance.WriteDebug("Start CanonCameraHardware.GetDevices");

		return new Promise<Array<CanonCameraDevice>>(async (resolve, reject) => {
				try {
					if (this._devices.length === 0) {
						const result = await CanonCameraAPI.Instance.GetDeviceInfo();
						if (result) {
							const device: CanonCameraDevice = new CanonCameraDevice();
							device.modelName = result.modelName;
							device.serial = result.serial;
							this._devices.push(device);
						}
					}
				} catch (error) {
					Logger.Instance.WriteError(error);
					this._devices = [];
					reject(error);
				}

			resolve(this._devices);
		});
	}

	public GetDeviceById(id: string) {
		Logger.Instance.WriteDebug("Start CanonCameraHardware.GetDeviceById: " + id);
		let foundDevice: CanonCameraDevice = undefined;

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
		this._devices = new Array<CanonCameraDevice>();
		return true;
	}
}