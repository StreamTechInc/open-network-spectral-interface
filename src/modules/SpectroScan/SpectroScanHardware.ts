import { IHardwareType } from "../../interfaces/IHardwareType";
import { SpectroScanDevice } from "./SpectroScanDevice";
import { Logger } from "../../common/logger";
import { SpectroScanAPI } from "./SpectroScanAPI";

export class SpectroScanHardware implements IHardwareType {
	private _devices: Array<SpectroScanDevice> = new Array<SpectroScanDevice>();

	public GetDevices(): Array<SpectroScanDevice> {
		Logger.Instance.WriteDebug("Start SoftSpecHardware.GetDevices");

		try {
			console.log("trying something");
			const something = SpectroScanAPI.Instance.DeviceConnect();
			console.log("something happened", something);
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
}