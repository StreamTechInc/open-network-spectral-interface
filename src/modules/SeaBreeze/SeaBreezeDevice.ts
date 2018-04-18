import { IHardware } from "../../interfaces/IHardware";
import { ICaptureData } from "../../interfaces/ICaptureData";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { Guid } from "guid-typescript";
import { Logger } from "../../common/logger";
import { HardwareProperty } from "../../models/hardware-property";
import { SeaBreezeAPI } from "./SeaBreezeAPI";
import { Helpers } from "../../common/helpers";

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
		let property: HardwareProperty = undefined;

		try {
			switch (key) {
				case "integration_time":
					property = this.getIntegrationTimeProperty();
					break;
				case "boxcar":
					property = this.getBoxcarProperty();
					break;
				case "scan_average":
					property = this.getScanAverageProperty();
					break;
				default:
					property = undefined;
					break;
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}

	public SetProperty(setting: HardwareProperty): HardwareProperty | Error {
		let property: HardwareProperty | Error = undefined;

		try {
			switch (setting.id) {
				case "integration_time":
					property = this.setIntegrationTimeProperty(setting.value);
					break;
				case "boxcar":
					property = this.setBoxcarProperty(setting.value);
					break;
				case "scan_average":
					property = this.setScanAverageProperty(setting.value);
					break;
				default:
					property = undefined;
					break;
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
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
			property.dataType = "number";
			property.order = 1;
			property.increment = 0.1;

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

	private setIntegrationTimeProperty(newValue: string): HardwareProperty | Error {
		let property: HardwareProperty | Error = undefined;

		try {
			// Get property for comparison
			const compareProp = this.getIntegrationTimeProperty();

			Logger.Instance.WriteDebug("Testing data type");
			// Test data type: must be a number
			if (+newValue) {
				const numberValue = +newValue;

				Logger.Instance.WriteDebug("Testing min/max");
				// Test min/max
				if (Helpers.Instance.TestMinMax(numberValue, compareProp.minValue, compareProp.maxValue)) {

					Logger.Instance.WriteDebug("Testing increment");
					// Test increment
					if (Helpers.Instance.TestIncrement(numberValue, compareProp.increment)) {
						if (SeaBreezeAPI.Instance.SetIntegrationTime(this.apiID, numberValue)) {
							Logger.Instance.WriteDebug("Prop set");
							this._integrationTime = numberValue;
							compareProp.value = numberValue.toString();
							property = compareProp;
						}
						else {
							property = new Error("Integration failed to set. Error: " + SeaBreezeAPI.Instance.LastErrorString);
						}
					}
					else {
						property = new Error("Value not incremented by set value.");
					}
				}
				else {
					property = new Error("Value outside of bounds.");
				}
			}
			else {
				property = new Error("Incorrect data format. Expected a number.");
			}
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
			property.increment = 1;
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

	private setBoxcarProperty(newValue: string): HardwareProperty {
		return undefined;
	}

	private getScanAverageProperty(): HardwareProperty {
		let property: HardwareProperty = new HardwareProperty();

		try {
			// Fill out some known values
			property.id = "scan_average";
			property.userReadableName = "Scan Averaging";
			property.dataType = "int";
			property.order = 3;
			property.increment = 1;
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

	private setScanAverageProperty(newValue: string): HardwareProperty {
		return undefined;
	}
	//#endregion


}