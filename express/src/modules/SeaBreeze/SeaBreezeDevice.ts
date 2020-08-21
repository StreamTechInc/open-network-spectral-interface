import { IHardware } from '../../interfaces/IHardware';
import { IStatus } from '../../interfaces/IStatus';
import { ISubscription } from '../../interfaces/ISubscription';
import { Guid } from 'guid-typescript';
import { Logger } from '../../common/logger';
import { HardwareProperty } from '../../models/hardware-property';
import { SeaBreezeAPI } from './SeaBreezeAPI';
import { Helpers } from '../../common/helpers';
import { SeaBreezeCaptureData } from './models/seabreeze-capture-data';

export class SeaBreezeDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = 'Seabreeze Spectrometer';
	public apiID: number;

	/**
	 * Private Member Variables
	 */
	private _boxcar: number = 1;
	private _scanAverage: number = 1;
	private _integrationTime: number = 0;

	/**
	 * Properties
	 */
	get timeout(): number {
		let _timeout: number = 0;

		// set timeout to double the time it should take to do all scans
		// integration time is in microseconds so it's converted to milliseconds
		_timeout = this._scanAverage * (this._integrationTime / 1000) * 2;

		if (_timeout === 0) {
			// if no timeout, default to 2 minutes in milliseconds
			_timeout = 2 * 60 * 1000;
		}

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
				properties.push(this.GetIntegrationTimeProperty());
				properties.push(this.GetBoxcarProperty());
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
					case 'integration_time':
						property = this.GetIntegrationTimeProperty();
						break;
					case 'boxcar':
						property = this.GetBoxcarProperty();
						break;
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
					case 'integration_time':
						property = this.SetIntegrationTimeProperty(+setting.value);
						break;
					case 'boxcar':
						property = this.SetBoxcarProperty(+setting.value);
						break;
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

	public Capture(): Promise<Array<SeaBreezeCaptureData>> {
		return new Promise<Array<SeaBreezeCaptureData>>((resolve, reject) => {
			let capturedData: Array<SeaBreezeCaptureData> = new Array<SeaBreezeCaptureData>();

			try {
				capturedData = SeaBreezeAPI.Instance.GetFormattedSpectrum(this.apiID);

				if (capturedData && capturedData.length > 0) {
					capturedData = this.ProcessCapture(capturedData);
				}
				else {
					reject(new Error(SeaBreezeAPI.Instance.LastErrorString));
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
	private GetIntegrationTimeProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = 'integration_time';
		property.userReadableName = 'Integration Time';
		property.dataType = 'double';
		property.order = 1;
		property.increment = 0.1;

		// Get Max Value
		property.maxValue = SeaBreezeAPI.Instance.GetMaxIntegrationTimeMicro(this.apiID);

		// Get Min Value
		property.minValue = SeaBreezeAPI.Instance.GetMinIntegrationTimeMicro(this.apiID);

		// Get Current Value
		if (this._integrationTime === 0) {
			this._integrationTime = property.minValue;
		}

		property.value = this._integrationTime.toString();

		return property;
	}

	private SetIntegrationTimeProperty(newValue: number): HardwareProperty {
		const property: HardwareProperty = this.GetIntegrationTimeProperty();

		if (SeaBreezeAPI.Instance.SetIntegrationTimeMicro(this.apiID, newValue)) {
			Logger.Instance.WriteDebug('Prop set');
			this._integrationTime = newValue;
			property.value = this._integrationTime.toString();
		}
		else {
			throw new Error('Integration failed to set. Error: ' + SeaBreezeAPI.Instance.LastErrorString);
		}

		return property;
	}

	private GetBoxcarProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = 'boxcar';
		property.userReadableName = 'Boxcar';
		property.dataType = 'int';
		property.order = 2;
		property.increment = 1;
		property.minValue = 1;
		property.maxValue = 10;

		// Get Current Value
		property.value = this._boxcar.toString();

		return property;
	}

	private SetBoxcarProperty(newValue: number): HardwareProperty {
		const property: HardwareProperty = this.GetBoxcarProperty();

		this._boxcar = newValue;
		property.value = newValue.toString();

		return property;
	}

	private GetScanAverageProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = 'scan_average';
		property.userReadableName = 'Scan Averaging';
		property.dataType = 'int';
		property.order = 3;
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

	//#region Capture Helpers
	private ProcessCapture(spectrum: Array<SeaBreezeCaptureData>): Array<SeaBreezeCaptureData> {
		const processedSpectrum = spectrum;

		if (this._scanAverage > 1) {
			for (let i = 1; i < this._scanAverage; i++) {
				const tempSpectrum = SeaBreezeAPI.Instance.GetFormattedSpectrum(this.apiID);

				for (let j = 0; j < processedSpectrum.length; j++) {
					processedSpectrum[j].measuredValue += tempSpectrum[j].measuredValue;
				}
			}

			for (let i = 0; i < processedSpectrum.length; i++) {
				processedSpectrum[i].measuredValue = processedSpectrum[i].measuredValue / this._scanAverage;
			}
		}

		if (this._boxcar > 0) {
			// Refer to seabreeze sample app for how this process was determined
			const smoothed: Array<number> = new Array<number>(processedSpectrum.length);
			const boxcarLimit: number = processedSpectrum.length - this._boxcar - 1;
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