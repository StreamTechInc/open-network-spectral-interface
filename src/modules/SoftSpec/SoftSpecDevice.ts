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
	}

	/**
	 * Public Functions
	 */
	public GetProperties(): Promise<Array<HardwareProperty>> {
		return new Promise<Array<HardwareProperty>>((resolve, reject) => {
			const properties: Array<HardwareProperty> = Array<HardwareProperty>();

			try {
				properties.push(this.GetScanFilenameProperty());
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(properties);
		});
	}

	public GetProperty(key: string): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
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
				reject(error);
			}

			resolve(property);
		});
	}

	public SetProperty(setting: HardwareProperty): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			let property: HardwareProperty = undefined;

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
				reject(error);
			}

			resolve(property);
		});
	}

	public Capture(): Promise<Array<SoftSpecCaptureData>> {
		return new Promise<Array<SoftSpecCaptureData>>((resolve, reject) => {
			let capturedData: Array<SoftSpecCaptureData> = new Array<SoftSpecCaptureData>();

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
						reject(new Error(fileReturn.data));
					}
				}
				else {
					reject(new Error("No filename set for scan data"));
				}

			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(capturedData);
		});
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
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = "scan_filename";
		property.userReadableName = "Scan Filename";
		property.dataType = "string";
		property.order = 4;
		property.maxLength = 100;

		// Get Current Value
		property.value = this._scanFileName.toString();

		return property;
	}

	private SetScanFilenameProperty(newValue: string): HardwareProperty {
		const property: HardwareProperty = this.GetScanFilenameProperty();

		this._scanFileName = newValue;
		property.value = newValue.toString();

		return property;
	}
	//#endregion
}