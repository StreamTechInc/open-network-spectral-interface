import { IHardwareType } from "../../interfaces/IHardwareType";
import { SoftSpecDevice } from "./SoftSpecDevice";
import { Logger } from "../../common/logger";

export class SoftSpecHardware implements IHardwareType {

	private _numConnectdDevices: number = 1;
	private _devices: Array<SoftSpecDevice> = new Array<SoftSpecDevice>();

	public GetDevices(): Array<SoftSpecDevice> {
		Logger.Instance.WriteDebug("Start SeaBreezeHardware.GetDevices");

		try {
			const numDeviceToCreate = this._numConnectdDevices - this._devices.length;

			for (let index = 0; index < numDeviceToCreate; index++) {
				this._devices.push(new SoftSpecDevice());
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			this._devices = [];
			throw error;
		}

		return this._devices;
	}

	public GetDeviceById(id: string) {
		Logger.Instance.WriteDebug("Start SoftSpecHardware.GetDeviceById: " + id);
		
		let foundDevice: SoftSpecDevice = undefined;

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
		this._devices = new Array<SoftSpecDevice>();
		return true;
	}
}