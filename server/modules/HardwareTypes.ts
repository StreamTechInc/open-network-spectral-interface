import { IHardwareType } from "../interfaces/IHardwareType";

/* Start Module Imports */

import { SeaBreezeHardware } from "./SeaBreeze/SeaBreezeHardware";
import { SoftSpecHardware } from "./SoftSpec/SoftSpecHardware";
import { SpectroScanHardware } from "./SpectroScan/SpectroScanHardware";
import { CanonCameraHardware } from "./CanonCamera/CanonCameraHardware";

/* End Module Imports */

export class HardwareTypes {
	/**
	 * Singleton
	 */
	private static _instance: HardwareTypes;

	static get Instance() {
		if (this._instance === null || this._instance === undefined) {
			this._instance = new HardwareTypes();
		}

		return this._instance;
	}


	public AvailableHardwareTypes: Array<IHardwareType>;

	constructor() {
		this.AvailableHardwareTypes = new Array<IHardwareType>();

		/* Start IHardwareType Initialization */

		// this.AvailableHardwareTypes.push(new SeaBreezeHardware());
		// this.AvailableHardwareTypes.push(new SoftSpecHardware());
		// this.AvailableHardwareTypes.push(new SpectroScanHardware());
		this.AvailableHardwareTypes.push(new CanonCameraHardware());

		/* End IHardwareType Initialization */
	}

}