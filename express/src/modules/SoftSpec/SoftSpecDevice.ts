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
	private _datasetName: string = "calibration";
	private _datasetIndex: number = 0;
	private _scanAverage: number = 1;

	/**
	 * Properties
	 */
	get timeout(): number {
		// default to 2 minutes in milliseconds
		return 2 * 60 * 1000;
	}

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
				properties.push(this.GetDatasetNameProperty());
				properties.push(this.GetScanAverageProperty());
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
					case "dataset_name":
						property = this.GetDatasetNameProperty();
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
					case "dataset_name":
						property = this.SetDatasetNameProperty(setting.value);
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
				reject(error);
			}

			resolve(property);
		});
	}

	public Capture(): Promise<Array<SoftSpecCaptureData>> {
		return new Promise<Array<SoftSpecCaptureData>>((resolve, reject) => {
			const capturedData: Array<SoftSpecCaptureData> = new Array<SoftSpecCaptureData>();

			try {
				const datesetName = this.GetDatasetNameProperty();

				if (datesetName && datesetName.value) {
					const directoryReturn = Helpers.Instance.ReadFilesInDirectory(`../express/src/modules/SoftSpec/scan files/${datesetName.value}/`);

					if (directoryReturn && directoryReturn.success) {
						// Reset the dataset file index
						if (directoryReturn.data.length <= this._datasetIndex) {
							this._datasetIndex = 0;
						}

						console.log(directoryReturn.data.length, this._datasetIndex);

						const fileData: Array<SoftSpecCaptureData> = directoryReturn.data[this._datasetIndex];

						if (fileData) {
							const randomCaptureData: Array<SoftSpecCaptureData> = new Array<SoftSpecCaptureData>();
							
							fileData.forEach((element: SoftSpecCaptureData) => {
								const newValue: SoftSpecCaptureData = new SoftSpecCaptureData();
								newValue.wavelength = element.wavelength;
								newValue.measuredValue = 0;
	
								for (let index = 0; index < this._scanAverage; index++) {
									// Make a new random measured value that is +/- 0.5% of the sample data
									const min: number = element.measuredValue - (element.measuredValue * 0.005);
									const max: number = element.measuredValue + (element.measuredValue * 0.005);
	
									newValue.measuredValue += Helpers.Instance.Random(min, max);
								}
	
								randomCaptureData.push(newValue);
							});
	
							for (let index = 0; index < randomCaptureData.length; index++) {
								capturedData.push({ wavelength: randomCaptureData[index].wavelength, measuredValue: randomCaptureData[index].measuredValue / this._scanAverage });
							}

							this._datasetIndex++;
						}
					}
					else {
						reject(new Error(directoryReturn.data));
					}
				}
				else {
					reject(new Error("No dataset name set for scan data"));
				}

			} catch (error) {
				this._datasetIndex = 0;
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
	private GetDatasetNameProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = "dataset_name";
		property.userReadableName = "Dataset Name";
		property.dataType = "string";
		property.order = 1;
		property.maxLength = 100;

		// Get Current Value
		property.value = this._datasetName.toString();

		return property;
	}

	private SetDatasetNameProperty(newValue: string): HardwareProperty {
		const property: HardwareProperty = this.GetDatasetNameProperty();

		this._datasetIndex = 0;
		this._datasetName = newValue;
		property.value = newValue.toString();

		return property;
	}

	private GetScanAverageProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = "scan_average";
		property.userReadableName = "Scan Averaging";
		property.dataType = "int";
		property.order = 2;
		property.increment = 1;
		property.minValue = 1;
		property.maxValue = 10000;

		// Get Current Value
		property.value = this._scanAverage.toString();

		return property;
	}

	private SetScanAverageProperty(newValue: number): HardwareProperty {
		const property: HardwareProperty = this.GetScanAverageProperty();

		this._scanAverage = newValue;
		property.value = this._scanAverage.toString();

		return property;
	}
	//#endregion
}