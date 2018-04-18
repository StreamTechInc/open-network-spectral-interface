import { IHardware } from "../../interfaces/IHardware";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { Guid } from "guid-typescript";
import { Logger } from "../../common/logger";
import { HardwareProperty } from "../../models/hardware-property";
import { SeaBreezeAPI } from "./SeaBreezeAPI";
import { Helpers } from "../../common/helpers";
import { CaptureData } from "../../models/capture-data";

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
			properties.push(this.GetIntegrationTimeProperty());
			properties.push(this.GetBoxcarProperty());
			properties.push(this.GetScanAverageProperty());

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

	public Capture(): Array<CaptureData> | Error {
		let capturedData: Array<CaptureData> | Error = new Array<CaptureData>();

		try {
			capturedData = SeaBreezeAPI.Instance.GetSpectrum(this.apiID);

			if (capturedData && capturedData.length > 0) {
				capturedData = this.ProcessCapture(capturedData);
			}
			else {
				capturedData = new Error(SeaBreezeAPI.Instance.LastErrorString);
			}
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
			property.dataType = "double";
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

	private SetIntegrationTimeProperty(newValue: number): HardwareProperty | Error {
		let property: HardwareProperty | Error = this.GetIntegrationTimeProperty();

		try {
			if (SeaBreezeAPI.Instance.SetIntegrationTime(this.apiID, newValue)) {
				Logger.Instance.WriteDebug("Prop set");
				this._integrationTime = newValue;
				property.value = this._integrationTime.toString();
			}
			else {
				property = new Error("Integration failed to set. Error: " + SeaBreezeAPI.Instance.LastErrorString);
			}

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
	//#endregion

	//#region Capture Helpers
	private ProcessCapture(spectrum: Array<CaptureData>): Array<CaptureData> {
		const processedSpectrum = spectrum;

		if (this._scanAverage > 1) {
			for (let i = 1; i < this._scanAverage; i++) {
				const tempSpectrum = SeaBreezeAPI.Instance.GetSpectrum(+this.id);

				for (let j = 0; j < SeaBreezeAPI.Instance.pixels; j++) {
					processedSpectrum[j].measuredValue += tempSpectrum[j].measuredValue;
				}
			}

			for (let i = 0; i < SeaBreezeAPI.Instance.pixels; i++) {
				processedSpectrum[i].measuredValue = processedSpectrum[i].measuredValue / this._scanAverage;
			}
		}

		if (this._boxcar > 0) {
			// Refer to seabreeze sample app for how this process was determined
			const smoothed: Array<number> = new Array<number>(SeaBreezeAPI.Instance.pixels);
			const boxcarLimit: number = SeaBreezeAPI.Instance.pixels - this._boxcar - 1;
			const boxcarRange: number = 2 * this._boxcar + 1;

			let sum: number;

			for (let i = this._boxcar; i <= boxcarLimit; i++) {
				sum = processedSpectrum[i].measuredValue;

				for (let j = 1; j <= this._boxcar; j++) {
					sum += processedSpectrum[i - j].measuredValue + processedSpectrum[i + j].measuredValue;
				}

				smoothed[i] = sum / boxcarRange;
			}

			for (let i = this._boxcar; i <= boxcarLimit; i++) {
				processedSpectrum[i].measuredValue = smoothed[i];
			}
		}

		return processedSpectrum;
	}


	//#endregion
}