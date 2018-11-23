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
import { FileHandler } from "../../common/file-handler";

export class SpectroScanDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string = "";
	public serial: string = "";
	public type: string = "SpectroScan Spectrometer";
	public handle: number;

	/**
	 * Private Variables
	 */
	private _status: boolean;
	private _scanAverage: number = 1;
	private _calibrate: boolean = false;

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
				properties.push(this.GetCalibrateProperty());
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
					case "calibrate":
						property = this.GetCalibrateProperty();
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
					case "calibrate":
						property = this.SetCalibrateProperty(setting.value === "true");
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
				this.ProcessCapture().then((data) => {
					resolve(data);
				}, (processError) => {
					throw processError;
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

	private GetCalibrateProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = "calibrate";
		property.userReadableName = "Calibrate";
		property.dataType = "bool";
		property.order = 2;
		property.increment = null;
		property.minValue = null;
		property.maxValue = null;

		// Get Current Value
		property.value = this._calibrate.toString();

		return property;
	}

	private SetCalibrateProperty(newValue: boolean): HardwareProperty {
		const property: HardwareProperty = this.GetCalibrateProperty();

		this._calibrate = newValue;
		property.value = this._calibrate.toString();

		return property;
	}

	private async ProcessCapture() {
		const data: Array<Array<SpectroScanCaptureData>> = [];
		let averagedData: Array<SpectroScanCaptureData> = [];
		let scanNumber: number = 1;

		if (this._calibrate) {
			const alignmentValues = await SpectroScanAPI.Instance.Calibrate(this.handle);
		}

		do {
			const capturedData = await SpectroScanAPI.Instance.GetSpectrum(this.handle);
			scanNumber++;
			data.push(capturedData);
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

		/**
		 * Leave this here in case we need to do more testing later
		 */

		// Make CSV
		// let headers: string = "wavelength";
		// let body: string = "";

		// for (let index = 1; index <= this._scanAverage; index++) {
		// 	headers += ",Scan " + index;
		// }

		// headers += "\n";

		// for (let index = 0; index < data[0].length; index++) {
		// 	const scan = data[0][index];

		// 	body += scan.wavelength;

		// 	data.forEach((element: SpectroScanCaptureData[]) => {
		// 		body += "," + element[index].measuredValue;
		// 	});

		// 	body += "\n";
		// }

		// const fileHandler: FileHandler = new FileHandler();
		// fileHandler.WriteFile("C:\\Temp\\SpectroScanData\\oct 18\\009_99_scan_mertz_1000.csv", headers + body);

		return averagedData;
	}
}

