import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import { Logger } from "../../common/logger";
import { Helpers } from "../../common/helpers";
import { SpectroScanCaptureData } from "./models/spectroscan-capture-data";

export class SpectroScanAPI {
	/**
	 * 
	 * Singleton
	 * 
	 */
	private static instance: SpectroScanAPI;

	static get Instance() {
		if (this.instance === null || this.instance === undefined) {
			this.instance = new SpectroScanAPI();
		}

		return this.instance;
	}

	/**
	 * 
	 * Public Variables
	 * 
	 */
	public maxWavelength: number = 2451;
	public minWavelength: number = 950;
	public wavelengthRange: number = this.maxWavelength - this.minWavelength;

	/**
	 * 
	 * Private variables
	 * 
	 */
	private handle: number = 0;

	private readonly libPath = "/server/modules/SpectroScan/SpectroScanDLL_V6.a.dll";

	private functions = new ffi.Library(this.libPath, {
		"FTIR_UartConversion": [ref.types.void, [refArray(ref.types.byte), ref.types.short, refArray(ref.types.int), ref.types.int, ref.types.int]],
		"FTIR_InterferogramToSpectrum": [ref.types.void, [refArray(ref.types.int), ref.types.double, ref.types.int, ref.types.int, ref.types.int, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		"FTIR_Spectrum_Interpo": [ref.types.void, [refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.double, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		"FTIR_UpdateAlignment": [ref.types.void, [ref.types.uint64, ref.types.double, ref.types.double]]
	});

	private readonly ftdiPath = "/server/modules/SpectroScan/ftd2xx64.dll";

	private ftdi_functions = new ffi.Library(this.ftdiPath, {
		"FT_Open": [ref.types.ulong, [ref.types.int, ref.refType(ref.types.uint64)]],
		"FT_Close": [ref.types.ulong, [ref.types.uint64]],
		"FT_SetBaudRate": [ref.types.ulong, [ref.types.uint64, ref.types.ulong]],
		"FT_Write": [ref.types.ulong, [ref.types.uint64, refArray(ref.types.byte), ref.types.ulong, ref.refType(ref.types.ulong)]],
		"FT_Read": [ref.types.ulong, [ref.types.uint64, ref.refType(refArray(ref.types.byte)), ref.types.ulong, ref.refType(ref.types.ulong)]],
		"FT_GetStatus": [ref.types.ulong, [ref.types.uint64, ref.refType(ref.types.ulong), ref.refType(ref.types.ulong), ref.refType(ref.types.ulong)]],
		"FT_SetTimeouts": [ref.types.ulong, [ref.types.uint64, ref.types.ulong, ref.types.ulong]],
		"FT_GetQueueStatus": [ref.types.ulong, [ref.types.uint64, ref.refType(ref.types.ulong)]],
		"FT_GetDeviceInfoDetail": [ref.types.ulong, [ref.types.ulong, ref.refType(ref.types.ulong), ref.refType(ref.types.ulong), ref.refType(ref.types.ulong), ref.refType(ref.types.ulong), ref.refType(ref.types.char), ref.refType(ref.types.ulong)]],
		"FT_ListDevices": [ref.types.ulong, [ref.refType(ref.types.void), ref.refType(ref.types.void), ref.types.ulong]],
		"FT_SetDataCharacteristics": [ref.types.ulong, [ref.types.uint64, ref.types.uchar, ref.types.uchar, ref.types.uchar]]
	});

	/**
	 * 
	 * Public Functions
	 * 
	 */
	public SetupDevice(): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			try {
				let status = SpectroScanAPI.Instance.FTDI_Open();

				if (status === 0) {

					setTimeout(() => {
						status = SpectroScanAPI.Instance.FTDI_SetBaudRate(this.handle, 2000000);

						if (status === 0) {
							setTimeout(() => {
								status = SpectroScanAPI.Instance.FTDI_SetDataCharacteristics(this.handle, 8, 0, 0);

								if (status === 0) {
									resolve(this.handle);
								}
								else {
									reject("FTDI_SetDataCharacteristics failed with status: " + status);
								}
							}, 10);
						}
						else {
							reject("FTDI_SetBaudRate failed with status: " + status);
						}
					}, 10);
				}
				else if (status === 2) { // Status == 2 is FT_DEVICE_NOT_FOUND. So no device to attempt to open.
					resolve(undefined);
				}
				else {
					reject("Device failed to open");
				}
			}
			catch (error) {
				reject(error);
			}
		});
	}

	public GetSpectrum(handle: number): Promise<Array<SpectroScanCaptureData>> {
		/**
		 * To get the spectrum there is a handful of actions to be taken with a wait between each step.
		 * 1. Write the command to indicate it begins scanning
		 * 2. Read with and expected return size of 1. Shows that the write worked and is processing
		 * 3. GetQueueStatus will return with the amount of bytes waiting in the buffer to be read
		 * 4. Read again this time it will be the raw measured data from the spectrometer
		 * 5. UArt Conversion will convert that raw data into Interferogram data
		 * 6. InterferogramToSpectrum will convert interferogram data into spectrum data
		 * 7. Spectrum_Interpo will interpolate the spectrum data to its final values and wavelengths
		 */

		return new Promise<Array<SpectroScanCaptureData>>((resolve, reject) => {
			let status = this.FTDI_Write(handle, [0xAD, 0x00, 0x00]);

			if (status === 0) {
				// Need at least a 10 ms wait between each action
				setTimeout(() => {
					const buffer = ref.alloc(refArray(ref.types.uint8));
					let bytesReturned = ref.alloc(ref.types.uint);

					// Here buffer doesn't matter. rxBytes should be a 1 and bytesReturned should be a 1
					status = this.ftdi_functions.FT_Read(handle, buffer, 1, bytesReturned);
					let rxBytes = ref.deref(bytesReturned);

					if (status === 0 && rxBytes === 1) {
						// Need a 500ms wait to ensure all data requested will be there
						setTimeout(() => {
							// Retrieve the amount of bytes waiting to be read
							bytesReturned = ref.alloc(ref.types.ulong);
							status = this.ftdi_functions.FT_GetQueueStatus(handle, bytesReturned);
							rxBytes = ref.deref(bytesReturned);

							if (status === 0 && rxBytes > 0) {
								const buffer2 = ref.alloc(refArray(ref.types.uint64, rxBytes));
								bytesReturned = ref.alloc(ref.types.uint);

								status = this.ftdi_functions.FT_Read(handle, buffer2, rxBytes, bytesReturned);
								rxBytes = ref.deref(bytesReturned);

								if (status === 0 && rxBytes > 0) {
									setTimeout(() => {
										const intf = ref.alloc(refArray(ref.types.int32, rxBytes / 2));

										this.functions.FTIR_UartConversion(buffer2, 1, intf, rxBytes, rxBytes);

										setTimeout(() => {
											rxBytes = rxBytes / 2;

											const zeroPadding: number = 4096;
											const boardband: number = 0;
											const mertz: number = 1000;
											const peak: number = 0;
											const calibrationFactor: number = 0.05;
											const SpectrumMag = ref.alloc(refArray(ref.types.double, rxBytes));
											const Wavenumber = ref.alloc(refArray(ref.types.double, rxBytes));
											const Intf_AC = ref.alloc(refArray(ref.types.double, rxBytes));

											this.functions.FTIR_InterferogramToSpectrum(intf, zeroPadding, boardband, mertz, peak, calibrationFactor, SpectrumMag, Wavenumber, Intf_AC, rxBytes, rxBytes, rxBytes);

											const scan: number = 2;
											const au: number = 0;
											const minwave: number = 900;
											const maxwave: number = 2600;
											const waverange: number = maxwave - minwave;
											const Absorption = ref.alloc(refArray(ref.types.double, waverange));
											const Raw = ref.alloc(refArray(ref.types.double, waverange));
											const Wavelength = ref.alloc(refArray(ref.types.double, waverange));

											this.functions.FTIR_Spectrum_Interpo(SpectrumMag, Wavenumber, SpectrumMag, Wavenumber, scan, au, minwave, maxwave, Absorption, Raw, Wavelength, waverange, waverange, waverange);

											const specData = ref.deref(Raw);
											const waveData = ref.deref(Wavelength);

											const dataArray: SpectroScanCaptureData[] = [];
											for (let index = 0; index < waveData.length; index++) {

												if (waveData[index] >= this.minWavelength && waveData[index] < this.maxWavelength) {
													const captureData = new SpectroScanCaptureData();
													captureData.wavelength = waveData[index];

													if (specData[index] < 0) {
														captureData.measuredValue = 0;
													}
													else {
														captureData.measuredValue = specData[index];
													}

													dataArray.push(captureData);
												}
											}

											resolve(dataArray);
										}, 10);
									}, 500);
								}
								else {
									reject("Read 2 failed with status: " + status);
								}
							}
							else {
								reject("GetQueueStatus failed with status: " + status);
							}
						}, 500);
					}
					else {
						reject("Read 1 failed with status: " + status);
					}
				}, 10);
			}
			else {
				reject("Write failed with status: " + status);
			}
		});
	}

	public Calibrate(handle: number): Promise<boolean> {
		/**
		 * To complete the auto alignment there is a handful of actions to be taken with a wait between each step
		 * 1. Write the command to indicate auto-alignment should start
		 */
		return new Promise<boolean>((resolve, reject) => {
			const status = this.FTDI_Write(handle, [0xAE, 0x00, 0x00]);

			if (status === 0) {
				// Wait 15s before returning
				setTimeout(() => {
					resolve(true);
				}, 15000);
			}
			else {
				reject("Write failed with status: " + status);
			}
		});
	}

	public CloseDevice(handle: number): boolean {
		return this.FTDI_Close(handle) === 0;
	}

	public TestDevice(handle: number): boolean {
		let status: number = -1;

		try {
			// Just a simple call to check if the handle stored is still valid
			const bytesReturned = ref.alloc(ref.types.ulong);
			status = this.ftdi_functions.FT_GetQueueStatus(handle, bytesReturned);
		} catch (error) {
			Logger.Instance.WriteError(error);
			status = -1;
		}

		return status === 0;
	}

	public GetDeviceDetails(handle: number): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let status = this.FTDI_Write(handle, [0xAA, 0x00, 0x00]);
			
			if (status === 0) {
				setTimeout(() => {
					const buffer = ref.alloc(refArray(ref.types.byte, 34));
					const bytesReturned = ref.alloc(ref.types.uint);

					status = this.ftdi_functions.FT_Read(handle, buffer, 34, bytesReturned);
					const rxBytes = ref.deref(bytesReturned);

					if (status === 0 && rxBytes > 0) {
						const details = Helpers.Instance.ConvertByteArrayToString(buffer);
						resolve(details);
					}
					else {
						reject("FTDI_Read failed with a status of: " + status + " and rxBytes: " + rxBytes);
					}
				}, 10);
			}
			else {
				reject("FTDI_Write failed with a status of: " + status);
			}
		});
	}

	/**
	 * 
	 * Private Functions
	 * 
	 */

	private UpdateAlignment(handle: number, x: number, y: number) {
		try {
			this.functions.FTIR_UpdateAlignment(handle, x, y);
		}
		catch (error) {
			Logger.Instance.WriteError(error);
		}
	}

	private FTDI_Open(): number {
		let status: number = 0;

		try {
			const handlePtr = ref.alloc(ref.types.uint64);
			status = this.ftdi_functions.FT_Open(0, handlePtr);

			if (status === 0) {
				this.handle = ref.deref(handlePtr);
			}
			else {
				Logger.Instance.WriteError(new Error("FTDI_Open failed with status: " + status));
			}
		}
		catch (error) {
			Logger.Instance.WriteError(error);
		}

		return status;
	}

	private FTDI_Close(handle: number): number {
		let status = -1;

		try {
			status = this.ftdi_functions.FT_Close(handle);
		}
		catch (error) {
			Logger.Instance.WriteError(error);
		}

		return status;
	}

	private FTDI_SetBaudRate(handle: number, baudRate: number): number {
		let status = -1;

		try {
			status = this.ftdi_functions.FT_SetBaudRate(handle, baudRate);
		}
		catch (error) {
			Logger.Instance.WriteError(error);
		}

		return status;
	}

	private FTDI_Write(handle: number, data: number[]): number {
		let status = -1;

		try {
			const bytesWritten = ref.alloc(ref.types.ulong);

			status = this.ftdi_functions.FT_Write(handle, data, 3, bytesWritten);
		}
		catch (error) {
			Logger.Instance.WriteError(error);
		}

		return status;
	}

	private FTDI_SetDataCharacteristics(handle: number, arg1: number, arg2: number, arg3: number) {
		let status = -1;

		try {
			status = this.ftdi_functions.FT_SetDataCharacteristics(handle, arg1, arg2, arg3);
		}
		catch (error) {
			Logger.Instance.WriteError(error);
		}

		return status;
	}
}
