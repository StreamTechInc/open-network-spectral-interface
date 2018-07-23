import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { Logger } from "../../common/logger";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { ICaptureData } from "../../interfaces/ICaptureData";
import { SpectroScanAPI } from "./SpectroScanAPI";
import { SpectroScanCaptureData } from "./models/spectroscan-capture-data";
import { resolve } from "url";

export class SpectroScanDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string = "nanoFTIR";
	public serial: string = "NO3";
	public type: string = "SpectroScan Spectrometer";
	public handle: number;

	/**
	 * Private Variables
	 */
	private _status: boolean;
	private _scanAverage: number = 1;
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

	public Capture(): Promise<Array<SpectroScanCaptureData>> {
		return new Promise<Array<SpectroScanCaptureData>>((resolve, reject) => {
			try {
				// SpectroScanAPI.Instance.GetSpectrum(this.handle).then((data) => {
				// 	resolve(data);
				// }, (spectrumError) => {
				// 	Logger.Instance.WriteError(spectrumError);
				// 	reject(spectrumError);
				// });
				// this.ProcessCapture([[]], 1).then((data) => {
				// 	console.log("Back with data: " + data.length);

				// 	resolve(data[0]);
				// });
				this.Process().then((data) => {
					resolve(data);
				});

			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}
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
	private GetScanAverageProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = "scan_average";
		property.userReadableName = "Scan Averaging";
		property.dataType = "int";
		property.order = 1;
		property.increment = 1;
		property.minValue = 1;
		property.maxValue = 1000;

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

	// private ProcessCapture(spectrum: Array<Array<SpectroScanCaptureData>>, index: number): Array<SpectroScanCaptureData> {
	// 	const processedSpectrum = spectrum;

	// 	// Add the promises in a loop and call all with promise.all


	// 	if (this._scanAverage > 1) {
	// 		for (let i = 1; i < this._scanAverage; i++) {
	// 			const tempSpectrum = SpectroScanAPI.Instance.GetSpectrum(this.handle);

	// 			for (let j = 0; j < SpectroScanAPI.Instance.wavelengthRange; j++) {
	// 				processedSpectrum[j].measuredValue += tempSpectrum[j].measuredValue;
	// 			}
	// 		}

	// 		for (let i = 0; i < SeaBreezeAPI.Instance.pixels; i++) {
	// 			processedSpectrum[i].measuredValue = processedSpectrum[i].measuredValue / this._scanAverage;
	// 		}
	// 	}

	// 	return processedSpectrum;
	// }

	private ProcessCapture(spectrumData: Array<Array<SpectroScanCaptureData>>, scanNumber: number = 1): Promise<Array<Array<SpectroScanCaptureData>>> {
		return new Promise<Array<Array<SpectroScanCaptureData>>>((resolve, reject) => {
			this.ProcessCapture(spectrumData, ++scanNumber).then((data) => {
				console.log("Processing scan " + scanNumber);

				if (spectrumData.length === this._scanAverage) {
					resolve(spectrumData);
				}
			});
		});
	}

	private async Process() {
		const data: Array<Array<SpectroScanCaptureData>> = [];
		let averagedData: Array<SpectroScanCaptureData> = [];
		let scanNumber: number = 1;

		do {
			const capturedData = await SpectroScanAPI.Instance.GetSpectrum(this.handle);
			scanNumber++;
			data.push(capturedData);

			console.log(capturedData[0]);
		} while (scanNumber <= this._scanAverage);

		averagedData = data[0];

		for (let i = 1; i < data.length; i++) {
			const tempSpectrum = data[i];

			for (let j = 0; j < SpectroScanAPI.Instance.wavelengthRange; j++) {
				averagedData[j].measuredValue += tempSpectrum[j].measuredValue;
			}
		}

		for (let i = 0; i < SpectroScanAPI.Instance.wavelengthRange; i++) {
			averagedData[i].measuredValue = averagedData[i].measuredValue / this._scanAverage;
		}

		return averagedData;
	}
}

