/**
 * This class is the SeaBreeze wrapper class.
 * Any functionalities for the Ocean Optics spectrometers will be handled here.
 */

import fs = require("fs");
import { HardwareModel } from "../../models/hardwareModel";
import { HardwareSettingModel } from "../../models/hardwareSettingModel";
import { IHardware } from "../IHardware";
import { SeaBreezeAPI } from "./SeaBreezeAPI";
import { Logger } from "../../common/logger";
import * as Common from "../../common/common";
import { HardwareResponse } from "../hardwareResponse";
import { SpectrumDataModel } from "../../models/SpectrumDataModel";


export class SeaBreeze implements IHardware {
	/**
	 * Variables and Properties
	 */
	public model: HardwareModel = undefined;
	public id: number;
	public serial: string;
	public message: string;

	private _boxcar: number = 0;
	private _scanAverage: number = 0;
	private _integrationTime: number = 0;

	/** 
	 * Public Functions
	 */
	public init(): boolean {
		let isInitialized = false;
		this.message = "SUCCESS";

		try {
			Logger.Instance.WriteDebug("Begin initializing SeaBreeze device id: " + this.id);

			if (SeaBreezeAPI.Instance.OpenDevice(this.id)) {
				this.serial = SeaBreezeAPI.Instance.GetSerialNumber(this.id);
				Logger.Instance.WriteDebug("Got serial number device id: " + this.id);

				if (this.serial != "NONE") {
					const modelNumber = SeaBreezeAPI.Instance.GetModelNumber(this.id);
					Logger.Instance.WriteDebug("Got model number device id: " + this.id);

					if (modelNumber != undefined && modelNumber != "NONE") {
						this.model = new HardwareModel();
						this.model.hardwareType = "seabreeze_spectrometer";
						this.model.model = modelNumber;

						isInitialized = true;
					}
					else {
						this.message = "failed to get model number: " + SeaBreezeAPI.Instance.LastErrorString;
						Logger.Instance.WriteInfo(this.message);
					}
				}
				else {
					this.message = "failed to get device serial number: " + SeaBreezeAPI.Instance.LastErrorString;
					Logger.Instance.WriteInfo(this.message);
				}
			}
			else {
				this.message = "failed to open device: " + SeaBreezeAPI.Instance.LastErrorString;
				Logger.Instance.WriteInfo(this.message);
			}

			Logger.Instance.WriteDebug("end initializing SeaBreeze device id: " + this.id);
		} catch (error) {
			Logger.Instance.WriteError(error);
			this.message = error.message;
			console.log(error.message);
		}


		return isInitialized;
	}

	public getSettings(): HardwareResponse {
		const response: HardwareResponse = new HardwareResponse();

		// Build settings object
		const settings = Array<HardwareSettingModel>();

		// Integration Time
		const intTimeSetting = new HardwareSettingModel();
		intTimeSetting.id = "integration_time";
		intTimeSetting.value = this._integrationTime.toString();
		settings.push(intTimeSetting);

		// Boxcar Time
		const boxcarSetting = new HardwareSettingModel();
		boxcarSetting.id = "boxcar";
		boxcarSetting.value = this._boxcar.toString();
		settings.push(boxcarSetting);

		// Scan Average
		const scanAverageSetting = new HardwareSettingModel();
		scanAverageSetting.id = "scan_average";
		scanAverageSetting.value = this._scanAverage.toString();
		settings.push(scanAverageSetting);

		response.success = true;
		response.data = settings;

		return response;
	}

	public getSettingValue(key: string): HardwareResponse {
		const response: HardwareResponse = new HardwareResponse();

		if (this.model == undefined || this.model.settings == undefined) {
			response.success = false;
			response.data = "Model info not set for device ID " + this.serial;
		}
		else {
			const foundSetting = Common.findSettingByKey(this.model.settings, key);

			if (foundSetting) {
				response.success = true;
				response.data = foundSetting;
			}
			else {
				response.success = false;
				response.data = "Unable to find setting " + key;
			}
		}

		return response;
	}

	public setSettingValue(key: string, value: string): HardwareResponse {
		const response: HardwareResponse = new HardwareResponse();

		let wasSet: boolean = false;

		if (key === "integration_time") {
		
			if (+value) {
				const success = SeaBreezeAPI.Instance.SetIntegrationTime(this.id, +value);

				if (success) {
					this._integrationTime = +value;
					wasSet = true;
				}
				else {
					response.data = SeaBreezeAPI.Instance.LastErrorString;
					wasSet = false;
				}
			}
			else {
				response.data = "Integration time cannot be set to " + value;
			}
		}
		else if (key === "boxcar") {
			this._boxcar = +value;
			wasSet = true;
		}
		else if (key === "scan_average") {
			this._scanAverage = +value;
			wasSet = true;
		}
		else {
			wasSet = false;
			response.data =  "Unable to find setting " + key;
		}

		response.success = wasSet;
		return response;
	}

	public capture(): HardwareResponse {
		const response: HardwareResponse = new HardwareResponse();

		let spectrum = SeaBreezeAPI.Instance.GetSpectrum(this.id);

		if (spectrum.length > 0) {

			spectrum = this.processCapture(spectrum);

			response.success = true;
			response.data = spectrum;
		}
		else {
			response.success = false;
			response.data = SeaBreezeAPI.Instance.LastErrorString;
		}

		return response;
	}

	public closeDevice(): HardwareResponse {
		const response: HardwareResponse = new HardwareResponse();

		// Since we don't get a response from this, assume success
		SeaBreezeAPI.Instance.Shutdown();

		response.success = true;
		response.data = "Devices shutdown";

		return response;
	}

	/** 
	 * Private Functions
	 */
	private processCapture(spectrum: SpectrumDataModel[]): SpectrumDataModel[] {
		const processedSpectrum = spectrum;

		if (this._scanAverage > 1) {
			for (let i = 1; i < this._scanAverage; i++) {
				const tempSpectrum = SeaBreezeAPI.Instance.GetSpectrum(this.id);

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
}
