import { IHardware } from '../../interfaces/IHardware';
import { Guid } from 'guid-typescript';
import { HardwareProperty } from '../../models/hardware-property';
import { Logger } from '../../common/logger';
import { IStatus } from '../../interfaces/IStatus';
import { ISubscription } from '../../interfaces/ISubscription';
import { SpectroScanAPI } from './SpectroScanAPI';
import { SpectroScanCaptureData } from './models/spectroscan-capture-data';
import { FileHandler } from '../../common/file-handler';
import * as childProcess from 'child_process';
import * as path from 'path';
import { NanoFTIRCaptureOutput } from './models/nanoFTIR-capture-output';
import { Config } from '../../common/config';

export class SpectroScanDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string = '';
	public serial: string = '';
	public type: string = 'SpectroScan Spectrometer';
	public handle: number;
	public majorVersion: number;
	public comPort: number = -1;

	/**
	 * Private Variables
	 */
	private _scanAverage: number = 1;

	/**
	 * Properties
	 */
	get timeout(): number {
		let _timeout: number = 0;

		// Set timeout to 2 minutes plus 500ms/scan. 
		_timeout = (2 * 60 * 1000) + (this._scanAverage * 500);

		return _timeout;
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
					case 'scan_average':
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
					case 'scan_average':
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
		return new Promise<Array<SpectroScanCaptureData>>(async (resolve, reject) => {
			try {
				if (this.majorVersion === 3) {
					this.ProcessCaptureV3().then((data) => {
						resolve(data);
					}, (processError) => {
						throw processError;
					});
				}
				else if (this.majorVersion === 4) {
					const data = await this.ProcessCaptureV4();
					resolve(data);
				}
				else {
					throw new Error('Incompatible version provided');
				}

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
		property.id = 'scan_average';
		property.userReadableName = 'Scan Averaging';
		property.dataType = 'int';
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

	private async ProcessCaptureV3() {
		const data: Array<Array<SpectroScanCaptureData>> = [];
		let averagedData: Array<SpectroScanCaptureData> = [];
		let scanNumber: number = 1;

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

	private async ProcessCaptureV4(): Promise<Array<SpectroScanCaptureData>> {
		return new Promise<Array<SpectroScanCaptureData>>(async (resolve, reject) => {
			let retryCount: number = 0;
			let success: boolean = false;
			let returnCode: number = 0;

			do {
				const basePath = path.join(Config.SpectroScanPath, 'FTIRCapture');
				returnCode = await this.NanoFTIRCapture(basePath);
				success = returnCode === 0;

				if (success) {
					const fileHandler: FileHandler = new FileHandler();
					const fileData: Array<SpectroScanCaptureData> = fileHandler.ReadFile(path.join(basePath, 'processed_spectrum.json'));

					if (fileData) {
						resolve(fileData);
					}
					else {
						reject(new Error('Failed to parse data from file'));
					}

					break;
				}
				else {
					retryCount++;
				}

			} while (retryCount < 5);

			if (retryCount === 5 && !success) {
				reject(new Error(`Failed ${retryCount} times to capture data`));
			}
		});
	}

	private async NanoFTIRCapture(basePath: string): Promise<number> {
		return new Promise<number>(async (resolve, reject) => {
			try {
				const scriptPath = path.join(basePath, 'NanoFTIRCaptureCPP.exe');
				const captureProcess = childProcess.spawn(scriptPath, [this._scanAverage.toString(), basePath]);

				captureProcess.on('error', (error) => {
					Logger.Instance.WriteError(error);
					captureProcess.kill();
					reject(error);
				});

				captureProcess.on('uncaughtException', (error) => {
					Logger.Instance.WriteError(error);
					captureProcess.kill();
					reject(error);
				});

				captureProcess.stderr.on('error', (error) => {
					Logger.Instance.WriteError(error);
					captureProcess.kill();
					reject(error);
				});

				captureProcess.on('exit', (code) => {
					Logger.Instance.WriteDebug('NanoFTIR capture app exit code: ' + code);
					captureProcess.kill();
					resolve(code);
				});
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}
		});
	}

	private GetErrorString(errorCode: number): string {
		let errorMessage: string = null;

		switch (errorCode) {
			case 9:
				// Detector Saturation
				break;
			case 11:
				// No Light

				break;
			case 13:
				// Failed to load DLL

				break;
			case 14:
				// Connection Failure
				errorMessage = 'Failed to connect to device. Please ensure it is connected to computer and try again.';
				break;
			default:
				// Error codes 1-8, 10, 12, 15-16 get default messaging
				errorMessage = 'Unknown error has occurred.';
				break;
		}

		return errorMessage;
	}
}

