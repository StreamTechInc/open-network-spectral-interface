import { IHardwareType } from "../../interfaces/IHardwareType";
import { SoftCameraDevice } from "./SoftCameraDevice";
import { Logger } from "../../common/logger";
import { Helpers } from "../../common/helpers";

export class SoftCameraHardware implements IHardwareType {

	private _specsFilePath: string = "../express/src/modules/SoftCamera/cameras/";
	private _devices: Array<SoftCameraDevice> = new Array<SoftCameraDevice>();

	public GetDevices(): Promise<Array<SoftCameraDevice>> {
		Logger.Instance.WriteDebug("Start SoftCameraHardware.GetDevices");

		return new Promise<Array<SoftCameraDevice>>((resolve, reject) => {
			try {
				const response = Helpers.Instance.ReadFilesInDirectory(this._specsFilePath);
				
				if (response && response.success) {
					response.data.forEach((device: SoftCameraDevice) => {
						if (!this.CheckIfDeviceExists(device.serial)) {
							const tempDevice: SoftCameraDevice = new SoftCameraDevice();
							tempDevice.modelName = device.modelName;
							tempDevice.serial = device.serial;
							this._devices.push(tempDevice);
						}
					});
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
		Logger.Instance.WriteDebug("Start SoftCameraHardware.GetDeviceById: " + id);
		
		let foundDevice: SoftCameraDevice = undefined;

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
		this._devices = new Array<SoftCameraDevice>();
		return true;
	}

	private CheckIfDeviceExists(serial: string): boolean {
		let exists = false;

		this._devices.forEach((element) => {
			if (element.serial === serial) {
				exists = true;
			}
		});

		return exists;
	}

}