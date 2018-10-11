/**
 * This is a class for accessing SeaBreeze compatiable devices
 */

import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import { Logger } from "../../common/logger";
import { Helpers } from "../../common/helpers";
import { SeaBreezeCaptureData } from "./models/seabreeze-capture-data";
import * as path from "path";

export class SeaBreezeAPI {
	/**
	 * 
	 * Singleton
	 * 
	 */
	private static instance: SeaBreezeAPI;

	static get Instance() {
		if (this.instance === null || this.instance === undefined) {
			this.instance = new SeaBreezeAPI();
		}

		return this.instance;
	}

	/**
	 * 
	 * Constructor
	 * 
	 */
	constructor() {
		if (!this.IsInitialized) {
			this.Initialize();
		}
	}

	/**
	 * 
	 * Private variables
	 * 
	 */
	private readonly libPath = path.join(__dirname, "/SeaBreezeSTI.dll");

	private functions = new ffi.Library(this.libPath, {
		"sbapi_initialize": [ref.types.void, []],
		"sbapi_shutdown": [ref.types.void, []],
		"sbapi_get_error_string": [ref.types.CString, [ref.types.int]],
		"sbapi_probe_devices": [ref.types.int, []],
		"sbapi_get_device_ids": [ref.types.int, [ref.refType("long"), ref.types.ulong]],
		"sbapi_get_number_of_device_ids": [ref.types.int, []],
		"sbapi_open_device": [ref.types.int, [ref.types.int, ref.refType("int")]],
		"sbapi_get_number_of_serial_number_features": [ref.types.int, [ref.types.int, ref.refType("int")]],
		"sbapi_get_serial_number_maximum_length": [ref.types.uchar, [ref.types.int, ref.types.int, ref.refType("int")]],
		"sbapi_get_serial_number_features": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("long"), ref.types.int]],
		"sbapi_get_serial_number": [ref.types.int, [ref.types.int, ref.types.int, ref.refType("int"), ref.refType("char"), ref.types.int]],
		"sbapi_get_device_type": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("char"), ref.types.uint]],
		"sbapi_get_number_of_spectrometer_features": [ref.types.int, [ref.types.int, ref.refType("int")]],
		"sbapi_get_spectrometer_features": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("long"), ref.types.int]],
		"sbapi_spectrometer_get_formatted_spectrum_length": [ref.types.int, [ref.types.int, ref.types.long, ref.refType("int")]],
		"sbapi_spectrometer_get_formatted_spectrum": [ref.types.int, [ref.types.int, ref.types.long, ref.refType("int"), ref.refType("double"), ref.types.int]],
		"sbapi_spectrometer_get_wavelengths": [ref.types.int, [ref.types.int, ref.types.int, ref.refType("int"), ref.refType("double"), ref.types.int]],
		"sbapi_spectrometer_set_integration_time_micros": [ref.types.void, [ref.types.long, ref.types.long, ref.refType("int"), ref.types.ulong]],
		"sbapi_spectrometer_get_maximum_integration_time_micros": [ref.types.long, [ref.types.long, ref.types.long, ref.refType("int")]],
		"sbapi_spectrometer_get_minimum_integration_time_micros": [ref.types.long, [ref.types.long, ref.types.long, ref.refType("int")]]
	});

	private isInitialized = false;
	private lastErrorString = "SUCCESS";
	public pixels = 0;
	private wavelengths: Array<number> = new Array<number>();

	/**
	 * 
	 * Properties
	 * 
	 */
	public get IsInitialized() {
		return this.isInitialized;
	}

	public get LastErrorString() {
		return this.lastErrorString;
	}

	/**
	 * 
	 * Public functions
	 * 
	 */

	/**
	 * Initialize the API
	 */
	public Initialize() {
		this.functions.sbapi_initialize();
		this.isInitialized = true;
	}

	/**
	 * Destroy the instance of the API
	 */
	public Shutdown() {
		this.functions.sbapi_shutdown();
		this.isInitialized = false;
	}

	/**
	 * 
	 * @returns number of devices autodetected
	 */
	public ProbeDevices(): number {
		let deviceCount: number = 0;

		try {
			deviceCount = this.functions.sbapi_probe_devices();
		} catch (error) {
			Logger.Instance.WriteError(error);
		}

		// Output will be all devices that were probed
		return deviceCount;
	}

	/**
	 * 
	 * @returns an array containing all detected device Ids
	 */
	public GetDeviceIds(): Array<number> {
		const numberOfDeviceIds = this.getNumberOfDeviceIds();
		const buffer = ref.alloc(refArray(ref.types.long, numberOfDeviceIds));

		const output = this.functions.sbapi_get_device_ids(buffer, numberOfDeviceIds);

		const ids = new Array<number>();
		for (let offset = 0; offset < buffer.length; offset += 4) {
			ids.push(buffer.readInt32LE(offset));
		}

		ref.deref(buffer);

		return ids;
	}

	/**
	 * 
	 * @param id device id 
	 * @returns if device was opened or not
	 */
	public OpenDevice(id: number): boolean {
		const error = ref.alloc(ref.types.int);
		this.functions.sbapi_open_device(id, error);

		return this.CheckError("sbapi_open_device", ref.deref(error));
	}

	/**
	 * 
	 * @param id device id 
	 * @returns serial number of desired device
	 */
	public GetSerialNumber(id: number): string {
		let serial = "NONE";

		const numberOfSerialNumberFeatures = this.getNumberOfSerialNumberFeatures(id);
		const serialNumberFeatures = this.getSerialNumberFeatures(id, numberOfSerialNumberFeatures);

		if (serialNumberFeatures != undefined && serialNumberFeatures.length > 0) {
			const maxLength = this.getSerialNumberMaxLength(id, serialNumberFeatures[0]);
			const error = ref.alloc(ref.types.int);
			const buffer = ref.alloc(refArray(ref.types.char, maxLength));
			const output = this.functions.sbapi_get_serial_number(id, serialNumberFeatures[0], error, buffer, maxLength);

			Logger.Instance.WriteDebug("Checking for error");
			if (this.CheckError("sbapi_get_serial_number", ref.deref(error))) {
				serial = Helpers.Instance.ConvertByteArrayToString(buffer);
			}
			else {
				serial = "NONE";
			}

			ref.deref(buffer);
		}

		return serial;
	}

	public GetWavelength(id: number): Array<number> {
		let wavelengths: Array<number> = new Array<number>();

		if (this.wavelengths !== undefined && this.wavelengths.length > 0) {
			wavelengths = this.wavelengths;
		}
		else {
			const numberOfSpectrometerFeatures = this.getNumberOfSpectrometerFeatures(id);
			const spectrometerFeatures = this.getSpectrometerFeatures(id, numberOfSpectrometerFeatures);

			if (spectrometerFeatures != undefined && spectrometerFeatures.length > 0) {
				if (this.pixels === 0) {
					this.pixels = this.getFormattedSpectrumLength(id, spectrometerFeatures[0]);
				}

				if (this.pixels > 0) {
					wavelengths = this.getWavelengths(id, spectrometerFeatures[0], this.pixels);
					this.wavelengths = wavelengths;
				}
			}
		}

		return wavelengths;
	}

	public GetSpectrum(id: number): Array<SeaBreezeCaptureData> {
		const spectrumData: Array<SeaBreezeCaptureData> = new Array<SeaBreezeCaptureData>();
		let spectrum: Array<number> = new Array<number>();
		const numberOfSpectrometerFeatures = this.getNumberOfSpectrometerFeatures(id);
		const spectrometerFeatures = this.getSpectrometerFeatures(id, numberOfSpectrometerFeatures);

		if (spectrometerFeatures != undefined && spectrometerFeatures.length > 0) {
			if (this.pixels === 0) {
				this.pixels = this.getFormattedSpectrumLength(id, spectrometerFeatures[0]);
			}

			if (this.pixels > 0) {
				spectrum = this.getFormattedSpectrum(id, spectrometerFeatures[0], this.pixels);
				const wavelengths = this.GetWavelength(id);

				for (let index = 0; index < spectrum.length; index++) {
					const spectrumDataModel: SeaBreezeCaptureData = new SeaBreezeCaptureData();
					spectrumDataModel.wavelength = wavelengths[index];
					spectrumDataModel.measuredValue = spectrum[index];

					spectrumData.push(spectrumDataModel);
				}
			}
		}

		return spectrumData;
	}

	/**
	 * 
	 * @param id device id
	 * @returns model number of device
	 */
	public GetModelNumber(id: number): string {
		let model = "NONE";
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.char));

		const output = this.functions.sbapi_get_device_type(id, error, buffer, 20);

		if (this.CheckError("sbapi_get_device_type", ref.deref(error))) {
			model = Helpers.Instance.ConvertByteArrayToString(buffer);
		}
		else {
			model = "NONE";
		}

		ref.deref(buffer);

		return model;
	}

	public SetIntegrationTime(id: number, integrationTime: number): boolean {
		let wasSet = false;

		const numberOfSpectrometerFeatures = this.getNumberOfSpectrometerFeatures(id);
		const spectrometerFeatures = this.getSpectrometerFeatures(id, numberOfSpectrometerFeatures);

		if (spectrometerFeatures !== undefined && spectrometerFeatures.length > 0) {
			wasSet = this.setIntegrationTime(id, spectrometerFeatures[0], integrationTime);

			if (!wasSet) {
				Logger.Instance.WriteDebug("Error setting integration time: " + this.lastErrorString);
			}
		}

		return wasSet;
	}

	/**
	 * 
	 * Private functions
	 * 
	 */
	private CheckError(operation: string, error: number): boolean {
		if (error > 0) {
			const output = this.functions.sbapi_get_error_string(error);

			const msg = output.toString();
			this.lastErrorString = "[SeaBreeze] error: " + msg + " || operation: " + operation;

			Logger.Instance.WriteError(new Error(this.lastErrorString));
		}

		return error == 0;
	}

	/**
	 * 
	 * @returns number of device Ids found
	 */
	private getNumberOfDeviceIds(): number {
		return this.functions.sbapi_get_number_of_device_ids();
	}

	/**
	 * 
	 * @param id device id 
	 * @returns number of serial number features
	 */
	private getNumberOfSerialNumberFeatures(id: number): number {
		const error = ref.alloc(ref.types.int);
		const output = this.functions.sbapi_get_number_of_serial_number_features(id, error);

		if (this.CheckError("sbapi_get_number_of_serial_number_features", ref.deref(error))) {
			return output;
		}
		else {
			return 0;
		}
	}

	/**
	 * 
	 * @param id device id
	 * @param numberOfFeatures number of features the device has
	 */
	private getSerialNumberFeatures(id: number, numberOfFeatures: number): Array<number> {
		let featureIds = new Array<number>();
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.long, numberOfFeatures));

		const output = this.functions.sbapi_get_serial_number_features(id, error, buffer, numberOfFeatures);

		if (this.CheckError("sbapi_get_serial_number_features", ref.deref(error))) {
			for (let offset = 0; offset < buffer.length; offset += 4) {
				featureIds.push(buffer.readInt32LE(offset));
			}
		}
		else {
			featureIds = undefined;
		}

		ref.deref(buffer);

		return featureIds;
	}

	/**
	 * 
	 * @param id device id
	 * @param featureId feature id to get value of
	 */
	private getSerialNumberMaxLength(id: number, featureId: number) {
		const error = ref.alloc(ref.types.int);
		const output = this.functions.sbapi_get_serial_number_maximum_length(id, featureId, error);

		if (this.CheckError("sbapi_get_serial_number_maximum_length", ref.deref(error))) {
			return output;
		}
		else {
			return 0;
		}
	}

	/**
	 * 
	 * @param id device id 
	 * @returns number of spectrometer features
	 */
	private getNumberOfSpectrometerFeatures(id: number): number {
		const error = ref.alloc(ref.types.int);
		const output = this.functions.sbapi_get_number_of_spectrometer_features(id, error);

		if (this.CheckError("sbapi_get_number_of_spectrometer_features", ref.deref(error))) {
			return output;
		}
		else {
			return 0;
		}
	}

	/**
	 * 
	 * @param id device id
	 * @param numberOfFeatures number of features the device has
	 */
	private getSpectrometerFeatures(id: number, numberOfFeatures: number): Array<number> {
		let featureIds = new Array<number>();
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.long, numberOfFeatures));

		const output = this.functions.sbapi_get_spectrometer_features(id, error, buffer, numberOfFeatures);

		if (this.CheckError("sbapi_get_spectrometer_features", ref.deref(error))) {
			for (let offset = 0; offset < buffer.length; offset += 4) {
				featureIds.push(buffer.readInt32LE(offset));
			}
		}
		else {
			featureIds = undefined;
		}

		ref.deref(buffer);

		return featureIds;
	}

	/**
	 * 
	 * @param id device id
	 * @param featureId device feature id
	 * @returns length of the formatted spectrum or 0 if error
	 */
	private getFormattedSpectrumLength(id: number, featureId: number): number {
		let length = 0;

		const error = ref.alloc(ref.types.int);
		const output = this.functions.sbapi_spectrometer_get_formatted_spectrum_length(id, featureId, error);

		if (this.CheckError("sbapi_spectrometer_get_formatted_spectrum_length", ref.deref(error))) {
			length = output;
		}

		return length;
	}

	/**
	 * 
	 * @param id device id
	 * @param featureId device feature id
	 * @param spectrumLength the length of expected spectrum
	 * @return array containing all values of incoming spectrum
	 */
	private getFormattedSpectrum(id: number, featureId: number, spectrumLength: number): Array<number> {
		const spectrum: Array<number> = new Array<number>();
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.double, spectrumLength));

		const output = this.functions.sbapi_spectrometer_get_formatted_spectrum(id, featureId, error, buffer, spectrumLength);

		if (this.CheckError("sbapi_spectrometer_get_formatted_spectrum", ref.deref(error))) {

			const incrementer = buffer.length / output;

			for (let index = 0; index < buffer.length; index += incrementer) {
				spectrum.push(buffer.readDoubleLE(index));
			}
		}

		ref.deref(buffer);

		return spectrum;
	}

	private getWavelengths(id: number, featureId: number, pixels: number): Array<number> {
		const wavelengths: Array<number> = new Array<number>();
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.double, pixels));

		const output = this.functions.sbapi_spectrometer_get_wavelengths(id, featureId, error, buffer, pixels);

		if (this.CheckError("sbapi_spectrometer_get_wavelengths", ref.deref(error))) {

			const incrementer = buffer.length / output;

			for (let index = 0; index < buffer.length; index += incrementer) {
				wavelengths.push(buffer.readDoubleLE(index));
			}
		}

		ref.deref(buffer);

		return wavelengths;
	}

	private setIntegrationTime(id: number, featureId: number, integrationTime: number): boolean {
		const error = ref.alloc(ref.types.int);

		this.functions.sbapi_spectrometer_set_integration_time_micros(id, featureId, error, integrationTime);

		if (this.CheckError("sbapi_spectrometer_set_integration_time_micros", ref.deref(error))) {
			return true;
		}

		return false;
	}

	//#region SETTINGS
	/**
	 * Integration Time
	 */
	public getMaxIntegrationTime(id: number): number {
		const numberOfSpectrometerFeatures = this.getNumberOfSpectrometerFeatures(id);
		const spectrometerFeatures = this.getSpectrometerFeatures(id, numberOfSpectrometerFeatures);

		if (spectrometerFeatures !== undefined && spectrometerFeatures.length > 0) {
			const error = ref.alloc(ref.types.int);

			const response = this.functions.sbapi_spectrometer_get_maximum_integration_time_micros(id, spectrometerFeatures[0], error);

			if (this.CheckError("sbapi_spectrometer_get_maximum_integration_time_micros", ref.deref(error))) {
				return response;
			}
		}
		return -1;
	}

	public getMinIntegrationTime(id: number): number {
		const numberOfSpectrometerFeatures = this.getNumberOfSpectrometerFeatures(id);
		const spectrometerFeatures = this.getSpectrometerFeatures(id, numberOfSpectrometerFeatures);

		if (spectrometerFeatures !== undefined && spectrometerFeatures.length > 0) {
			const error = ref.alloc(ref.types.int);

			const response = this.functions.sbapi_spectrometer_get_minimum_integration_time_micros(id, spectrometerFeatures[0], error);

			if (this.CheckError("sbapi_spectrometer_get_minimum_integration_time_micros", ref.deref(error))) {
				return response;
			}
		}
		return -1;
	}


	//#endregion
}
