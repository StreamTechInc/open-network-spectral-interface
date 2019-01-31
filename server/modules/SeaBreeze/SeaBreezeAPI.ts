/**
 * This is a class for accessing SeaBreeze compatiable devices
 */

import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import * as path from "path";
import { Logger } from "../../common/logger";
import { Helpers } from "../../common/helpers";
import { SeaBreezeCaptureData } from "./models/seabreeze-capture-data";

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
	 * Private variables
	 * 
	 */
	private seabreezeFunctions = new ffi.Library("SeaBreezeSTI.dll", {
		"seabreeze_open_spectrometer": [ref.types.int, [ref.types.int, ref.refType("int")]],
		"seabreeze_get_serial_number": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("byte"), ref.types.int]],
		"seabreeze_get_model": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("byte"), ref.types.int]],
		"seabreeze_get_formatted_spectrum": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("double"), ref.types.int]],
		"seabreeze_get_formatted_spectrum_length": [ref.types.int, [ref.types.int, ref.refType("int")]],
		"seabreeze_get_error_string": [ref.types.int, [ref.types.int, ref.refType("byte"), ref.types.int]],
		"seabreeze_get_min_integration_time_microsec": [ref.types.long, [ref.types.int, ref.refType("int")]],
		"seabreeze_get_max_integration_time_microsec": [ref.types.long, [ref.types.int, ref.refType("int")]],
		"seabreeze_get_wavelengths": [ref.types.int, [ref.types.int, ref.refType("int"), ref.refType("double"), ref.types.int]],
		"seabreeze_set_integration_time_microsec": [ref.types.void, [ref.types.int, ref.refType("int"), ref.types.long]]
	});

	private lastErrorString = "SUCCESS";

	/**
	 * 
	 * Properties
	 * 
	 */
	public get LastErrorString() {
		return this.lastErrorString;
	}

	/**
	 * 
	 * Public functions
	 * 
	 */

	/**
	 * 
	 * @param id device id 
	 * @returns if device was opened or not
	 */
	public OpenDevice(id: number): boolean {
		const error = ref.alloc(ref.types.int);
		this.seabreezeFunctions.seabreeze_open_spectrometer(id, error);

		return this.CheckError("seabreeze_open_spectrometer", error.readInt8(0));
	}

	/**
	 * 
	 * @param id device id
	 * @returns device serial number
	 */
	public GetSerialNumber(id: number): string {
		let serial = "NONE";
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.byte, 15));

		this.seabreezeFunctions.seabreeze_get_serial_number(id, error, buffer, 15);

		if (this.CheckError("seabreeze_get_serial_number", ref.deref(error))) {
			serial = Helpers.Instance.ConvertByteArrayToString(buffer);
		}

		return serial;
	}

	/**
	 * 
	 * @param id device id
	 * @returns device model number
	 */
	public GetModelNumber(id: number): string {
		let model = "NONE";
		const error = ref.alloc(ref.types.int);
		const buffer = ref.alloc(refArray(ref.types.byte, 15));

		this.seabreezeFunctions.seabreeze_get_model(id, error, buffer, 15);

		if (this.CheckError("seabreeze_get_model", ref.deref(error))) {
			model = Helpers.Instance.ConvertByteArrayToString(buffer);
		}

		return model;
	}

	/**
	 * 
	 * @param id device id
	 * @returns length of spectrum to be captured
	 */
	public GetFormattedSpectrumLength(id: number): number {
		let spectrumLength: number = 0;
		const error = ref.alloc(ref.types.int);
		const output = this.seabreezeFunctions.seabreeze_get_formatted_spectrum_length(id, error);

		if (this.CheckError("seabreeze_get_formatted_spectrum_length", error.readInt8(0))) {
			spectrumLength = output;
		}

		return spectrumLength;
	}

	/**
	 * 
	 * @param id device id
	 * @returns an array of captured data
	 */
	public GetFormattedSpectrum(id: number): Array<SeaBreezeCaptureData> {
		const spectrumData: Array<SeaBreezeCaptureData> = new Array<SeaBreezeCaptureData>();
		const spectrumLength: number = this.GetFormattedSpectrumLength(id);

		if (spectrumLength > 0) {
			const wavelengths = this.GetWavelengths(id);

			const error = ref.alloc(ref.types.int);
			const buffer = ref.alloc(refArray(ref.types.double, spectrumLength));

			const output = this.seabreezeFunctions.seabreeze_get_formatted_spectrum(id, error, buffer, spectrumLength);

			if (this.CheckError("seabreeze_get_formatted_spectrum", error.readInt8(0))) {
				const incrementer = buffer.length / output;
				let wavelengthIndex = 0;

				for (let index = 0; index < buffer.length; index += incrementer) {
					const spectrumDataModel: SeaBreezeCaptureData = new SeaBreezeCaptureData();
					spectrumDataModel.wavelength = wavelengths[wavelengthIndex];
					spectrumDataModel.measuredValue = buffer.readDoubleLE(index);

					spectrumData.push(spectrumDataModel);

					wavelengthIndex++;
				}

				ref.deref(buffer);
			}
		}

		return spectrumData;
	}

	/**
	 * 
	 * @param id device id
	 * @returns an array of wavelengths measured by device
	 */
	public GetWavelengths(id: number): number[] {
		const wavelengths: number[] = [];
		const spectrumLength = this.GetFormattedSpectrumLength(id);

		if (spectrumLength > 0) {
			const error = ref.alloc(ref.types.int);
			const buffer = ref.alloc(refArray(ref.types.double, spectrumLength));

			const output = this.seabreezeFunctions.seabreeze_get_wavelengths(id, error, buffer, spectrumLength);

			if (this.CheckError("seabreeze_get_wavelengths", error.readInt8(0))) {
				const incrementer = buffer.length / output;

				for (let index = 0; index < buffer.length; index += incrementer) {
					wavelengths.push(buffer.readDoubleLE(index));
				}
			}
		}

		return wavelengths;
	}

	/**
	 * 
	 * @param id device id
	 * @returns minimum possible integration time
	 */
	public GetMinIntegrationTimeMicro(id: number): number {
		let integrationTime: number = 0;
		const error = ref.alloc(ref.types.int);
		const output = this.seabreezeFunctions.seabreeze_get_min_integration_time_microsec(id, error);

		if (this.CheckError("seabreeze_get_min_integration_time_microsec", error.readInt8(0))) {
			integrationTime = output;
		}

		return integrationTime;
	}

	/**
	 * 
	 * @param id device id
	 * @returns maximum possible integration time
	 */
	public GetMaxIntegrationTimeMicro(id: number): number {
		let integrationTime: number = 0;
		const error = ref.alloc(ref.types.int);
		const output = this.seabreezeFunctions.seabreeze_get_max_integration_time_microsec(id, error);

		if (this.CheckError("seabreeze_get_max_integration_time_microsec", error.readInt8(0))) {
			integrationTime = output;
		}

		return integrationTime;
	}

	/**
	 * 
	 * @param id device id
	 * @param time new integration time
	 * @returns success flag if set
	 */
	public SetIntegrationTimeMicro(id: number, time: number): boolean {
		const error = ref.alloc(ref.types.int);
		this.seabreezeFunctions.seabreeze_set_integration_time_microsec(id, error, time);

		return this.CheckError("seabreeze_set_integration_time_microsec", error.readInt8(0));
	}


	/**
	 * 
	 * Private functions
	 * 
	 */
	private CheckError(operation: string, error: number): boolean {
		if (error > 0) {
			const buffer = ref.alloc(refArray(ref.types.byte, 64));
			const output = this.seabreezeFunctions.seabreeze_get_error_string(error, buffer, 64);

			const msg = Helpers.Instance.ConvertByteArrayToString(buffer);
			this.lastErrorString = "[SeaBreeze] error: " + msg + " || operation: " + operation;

			Logger.Instance.WriteError(new Error(this.lastErrorString));
		}

		return error == 0;
	}
}
