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
			// if (this._devices.length == 0) {
			// const deviceHandle = SpectroScanAPI.Instance.DeviceConnect();

			// 	const device = new SpectroScanDevice();
			// 	device.handle = deviceHandle;

			// 	// Using values sent in sample app
			// 	SpectroScanAPI.Instance.UpdateAlignment(device.handle, 30, 30);

			// 	this._devices.push(device);
			// }

			// SpectroScanAPI.Instance.FTDI_ListDevices();

			const handle = SpectroScanAPI.Instance.FTDI_Open();


			setTimeout(() => {
				SpectroScanAPI.Instance.FTDI_SetBaudRate(handle, 2000000);

				setTimeout(() => {
					SpectroScanAPI.Instance.FTDI_SetDataCharacteristics(handle, 8, 0, 0);

					setTimeout(() => {
						SpectroScanAPI.Instance.UpdateAlignment(handle, 29.7, 24.6);

						setTimeout(() => {
							SpectroScanAPI.Instance.FTDI_Write(handle, [0xAD, 0x00, 0x00]);

							setTimeout(() => {
								SpectroScanAPI.Instance.GetSpectrum(handle);

								setTimeout(() => {
									// SpectroScanAPI.Instance.FTDI_Close(handle);
								}, 500);
							}, 10);
						}, 10);
					}, 10);
				}, 10);
			}, 10);
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