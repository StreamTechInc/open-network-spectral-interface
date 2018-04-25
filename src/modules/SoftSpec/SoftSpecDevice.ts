import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { Logger } from "../../common/logger";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { SoftSpecCaptureData } from "./models/softspec-capture-data";
import { Helpers } from "../../common/helpers";

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
	private _scanFileName: string = "0_percent.json";

	/**
	 * Constructor
	 */
	constructor() {
		this.id = Guid.create();
		// this.modelName = "SoftSpec";

		// Generate a serial number based of seconds and milliseconds
		// const date = new Date();
		// this.serial = "SS-" + date.getSeconds() + "-" + date.getMilliseconds(); 
	}

	/**
	 * Public Functions
	 */
	public GetProperties(): Array<HardwareProperty> {
		let properties: Array<HardwareProperty> = Array<HardwareProperty>();
		try {
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
			const filename = this.GetScanFilenameProperty();

			if (filename && filename.value) {
				const fileReturn = Helpers.Instance.ReadFile("./src/modules/SoftSpec/scan files/" + filename.value);

				if (fileReturn.success) {
					const randomCaptureData: Array<SoftSpecCaptureData> = new Array<SoftSpecCaptureData>();

					fileReturn.data.forEach((element: SoftSpecCaptureData) => {
						// Make a new random measured value that is +/- 0.5% of the sample data
						const min: number = element.measuredValue - (element.measuredValue * 0.005);
						const max: number = element.measuredValue + (element.measuredValue * 0.005);

						const newValue: SoftSpecCaptureData = new SoftSpecCaptureData();
						newValue.wavelength = element.wavelength;
						newValue.measuredValue = Helpers.Instance.Random(min, max);

						randomCaptureData.push(newValue);
					});

					capturedData = fileReturn.data;
				}
				else {
					capturedData = new Error(fileReturn.data);
				}
			}
			else {
				capturedData = new Error("No filename set for scan data");
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
			property.value = this._scanFileName.toString();
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