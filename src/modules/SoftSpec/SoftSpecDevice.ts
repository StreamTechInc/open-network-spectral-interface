import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { Logger } from "../../common/logger";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { SoftSpecCaptureData } from "./models/softspec-capture-data";

export class SoftSpecDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = "SoftSpec Spectrometer";

	/**
	 * Private Member Variables
	 */
	private _boxcar: number = 1;
	private _scanAverage: number = 1;
	private _integrationTime: number = 0;
	private _scanFileName: string = "";

	/**
	 * Constructor
	 */
	constructor() {
		this.id = Guid.create();
		this.modelName = "SoftSpec";
		
		// Generate a serial number based of seconds and milliseconds
		const date = new Date();
		this.serial = "SS-" + date.getSeconds() + "-" + date.getMilliseconds(); 
	}

	/**
	 * Public Functions
	 */
	public GetProperties(): Array<HardwareProperty> {
		let properties: Array<HardwareProperty> = Array<HardwareProperty>();
		try {
			properties.push(this.GetIntegrationTimeProperty());
			properties.push(this.GetBoxcarProperty());
			properties.push(this.GetScanAverageProperty());
			properties.push(this.GetScanFilenameProperty());
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
					property = this.GetIntegrationTimeProperty();
					break;
				case "boxcar":
					property = this.GetBoxcarProperty();
					break;
				case "scan_average":
					property = this.GetScanAverageProperty();
					break;
				case "scan_filename":
					property = this.GetScanFilenameProperty();
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
					property = this.SetIntegrationTimeProperty(+setting.value);
					break;
				case "boxcar":
					property = this.SetBoxcarProperty(+setting.value);
					break;
				case "scan_average":
					property = this.SetScanAverageProperty(+setting.value);
					break;
				case "scan_filename":
					property = this.SetScanFilenameProperty(setting.value);
					break;
				default:
					property = undefined;
					break;
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = error;
		}

		return property;
	}

	public Capture(): Array<SoftSpecCaptureData> | Error {
		let capturedData: Array<SoftSpecCaptureData> | Error = new Array<SoftSpecCaptureData>();

		try {

		} catch (error) {
			Logger.Instance.WriteError(error);
			capturedData = error;
		}

		return capturedData;
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
	private GetIntegrationTimeProperty(): HardwareProperty {
		let property: HardwareProperty = new HardwareProperty();

		try {
			// Fill out some known values
			property.id = "integration_time";
			property.userReadableName = "Integration Time";
			property.dataType = "int";
			property.order = 1;
			property.increment = 1;
			property.minValue = 250;
			property.maxValue = 200000;

			// Get Current Value
			property.value = this._integrationTime.toString();

		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}

	private SetIntegrationTimeProperty(newValue: number): HardwareProperty | Error {
		let property: HardwareProperty | Error = this.GetIntegrationTimeProperty();

		try {
			this._integrationTime = newValue;
			property.value = newValue.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = error;
		}

		return property;
	}

	private GetBoxcarProperty(): HardwareProperty {
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

	private SetBoxcarProperty(newValue: number): HardwareProperty | Error {
		let property: HardwareProperty | Error = this.GetBoxcarProperty();

		try {
			this._boxcar = newValue;
			property.value = newValue.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = error;
		}

		return property;
	}

	private GetScanAverageProperty(): HardwareProperty {
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

	private SetScanAverageProperty(newValue: number): HardwareProperty | Error {
		let property: HardwareProperty | Error = this.GetScanAverageProperty();

		try {
			this._scanAverage = newValue;
			property.value = this._scanAverage.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = error;
		}

		return property;
	}

	private GetScanFilenameProperty(): HardwareProperty {
		let property: HardwareProperty = new HardwareProperty();

		try {
			// Fill out some known values
			property.id = "scan_filename";
			property.userReadableName = "Scan Filename";
			property.dataType = "string";
			property.order = 4;
			property.maxLength = 100;

			// Get Current Value
			property.value = this._boxcar.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}

	private SetScanFilenameProperty(newValue: string): HardwareProperty | Error {
		let property: HardwareProperty | Error = this.GetScanFilenameProperty();

		try {
			this._scanFileName = newValue;
			property.value = newValue.toString();
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = error;
		}

		return property;
	}
	//#endregion
}