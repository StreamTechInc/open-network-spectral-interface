/**
 * This class is used to find and initialize all SeaBreeze enabled devices
 */

import { SeaBreeze } from "./SeaBreeze";
import { SeaBreezeAPI } from "./SeaBreezeAPI";
import { IHardware } from "../IHardware";
import { Logger } from "../../common/logger";

export class SeaBreezeInitializer {
	constructor() { }

	/**
	 * Public Functions
	 */
	public getAllDevices(existingDevices: Array<IHardware>): Array<SeaBreeze> {
		Logger.Instance.WriteDebug("Start SeaBreezeAPI.getAllDevices");
		const seabreezeArray = new Array<SeaBreeze>();

		const probedDeviceCount = SeaBreezeAPI.Instance.ProbeDevices();

		if (probedDeviceCount > 0) {
			const deviceIds = SeaBreezeAPI.Instance.GetDeviceIds();

			for (let index = 0; index < deviceIds.length; index++) {
				const seaBreezeDevice = new SeaBreeze();
				seaBreezeDevice.id = deviceIds[index];

				if (!this.CheckIfDeviceExists(seaBreezeDevice, existingDevices)) {
					if (!seaBreezeDevice.init()) {
						// If it failed to initialize log and clear out some values so it isn't usable
						Logger.Instance.WriteDebug("SeaBreeze device id " + seaBreezeDevice.id + " failed to initialize");

						seaBreezeDevice.id = undefined;
						seaBreezeDevice.model = undefined;
					}
					seabreezeArray.push(seaBreezeDevice);
				}
			}
		}

		Logger.Instance.WriteDebug("End SeaBreezeAPI.getAllDevices");
		return seabreezeArray;
	}

	/**
	 * Checks to see if SeaBreezeDevice already exists in the hardware array
	 */
	private CheckIfDeviceExists(device: SeaBreeze, existingDevices: Array<IHardware>): boolean {
		let doesExist = false;

		existingDevices.forEach(element => {
			if (element.model != undefined && element.model.hardwareType == "seabreeze_spectrometer") {
				if (device.id == element.id) {
					doesExist = true;
				}
			}
		});

		return doesExist;
	}
}