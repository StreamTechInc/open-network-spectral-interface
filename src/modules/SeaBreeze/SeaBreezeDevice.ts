import { IHardware } from "../../interfaces/IHardware";
import { ICaptureData } from "../../interfaces/ICaptureData";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { Guid } from "guid-typescript";
import { Logger } from "../../common/logger";
import { HardwareProperty } from "../../models/hardware-property";
import { SeaBreezeAPI } from "./SeaBreezeAPI";

export class SeaBreezeDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = "Seabreeze Spectrometer";
	public apiID: number;

	/**
	 * Private Member Variables
	 */
	private _boxcar: number = 1;
	private _scanAverage: number = 1;
	private _integrationTime: number = 0;

	/**
	 * Constructor
	 */
	constructor() {
		this.id = Guid.create();
	}

	/**
	 * Public Functions
	 */
	public GetProperties(): Array<HardwareProperty> {
		let properties: Array<HardwareProperty> = Array<HardwareProperty>();
		try {
			properties.push(this.getIntegrationTimeProperty());
			properties.push(this.getBoxcarProperty());
			properties.push(this.getScanAverageProperty());

		} catch (error) {
			Logger.Instance.WriteError(error);
			properties = undefined;
		}

		return properties;
	}

	public GetProperty(key: string): HardwareProperty {
		return undefined;
	}

	public SetProperty(setting: HardwareProperty): HardwareProperty {
		return undefined;
	}

	public Capture(): Array<ICaptureData> {
		return undefined;
	}

	public GetStatus(): IStatus {
		return undefined;
	}

	public GetSubscriptions(): Array<ISubscription> {
		return undefined;
	}

	public AddSubscription(subscription: ISubscription): ISubscription {
		return undefined;
	}

	public DeleteSubscription(subscription: ISubscription): boolean {
		return false;
	}

	public GetStreamUri(): string {
		return undefined;
	}

	public ToggleStream(): boolean {
		return false;
	}

	/**
	 * Private Functions
	 */
	//#region Property Helpers
	private getIntegrationTimeProperty(): HardwareProperty {
		let property: HardwareProperty = new HardwareProperty();

		try {
			// Fill out some known values
			property.id = "integration_time";
			property.userReadableName = "Integration Time";
			property.dataType = "double";
			property.order = 1;
			property.increment = "0.1";

			// Get Max Value
			property.maxValue = SeaBreezeAPI.Instance.getMaxIntegrationTime(this.apiID);

			// Get Min Value
			property.minValue = SeaBreezeAPI.Instance.getMinIntegrationTime(this.apiID);

			// Get Current Value
			if (this._integrationTime === 0) {
				this._integrationTime = property.minValue;
			}

			property.value = this._integrationTime.toString();

		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}

	private getBoxcarProperty(): HardwareProperty {
		let property: HardwareProperty = new HardwareProperty();

		try {
			// Fill out some known values
			property.id = "boxcar";
			property.userReadableName = "Boxcar";
			property.dataType = "int";
			property.order = 2;
			property.increment = "1";
			property.minValue = 1;
			property.maxValue = 10;

			// Get Current Value
			property.value = this._boxcar.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}

	private getScanAverageProperty(): HardwareProperty {
		let property: HardwareProperty = new HardwareProperty();

		try {
			// Fill out some known values
			property.id = "scan_average";
			property.userReadableName = "Scan Averaging";
			property.dataType = "int";
			property.order = 3;
			property.increment = "1";
			property.minValue = 1;
			property.maxValue = 10;

			// Get Current Value
			property.value = this._scanAverage.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}
	//#endregion

	
}