import { IHardwareType } from '../../interfaces/IHardwareType';
import { SoftSpecDevice } from './SoftSpecDevice';
import { Logger } from '../../common/logger';
import { Helpers } from '../../common/helpers';

export class SoftSpecHardware implements IHardwareType {

	private _specsFilePath: string = '../express/src/modules/SoftSpec/spectrometers/';
	private _devices: Array<SoftSpecDevice> = new Array<SoftSpecDevice>();

	public GetDevices(): Promise<Array<SoftSpecDevice>> {
		Logger.Instance.WriteDebug('Start SoftSpecHardware.GetDevices');

		return new Promise<Array<SoftSpecDevice>>((resolve, reject) => {
			try {
				const response = Helpers.Instance.ReadFilesInDirectory(this._specsFilePath);
				
				if (response && response.success) {
					response.data.forEach((device: SoftSpecDevice) => {
						if (!this.CheckIfDeviceExists(device.serial)) {
							const tempDevice: SoftSpecDevice = new SoftSpecDevice();
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
		Logger.Instance.WriteDebug('Start SoftSpecHardware.GetDeviceById: ' + id);
		
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