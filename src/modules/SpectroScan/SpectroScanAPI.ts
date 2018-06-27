import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import { Logger } from "../../common/logger";
import { errno } from "ffi";
import { Helpers } from "../../common/helpers";
import { EventData } from "applicationinsights/out/Declarations/Contracts";
import { SpectroScanCaptureData } from "./models/spectroscan-capture-data";
import { FileHandler } from "../../common/file-handler";

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
	 * Private variables
	 * 
	 */
	private readonly libPath = "./src/modules/SpectroScan/SpectroScanDLL_V6.a.dll";

	private functions = new ffi.Library(this.libPath, {
		"FTIR_UartConversion": [ref.types.void, [refArray(ref.types.byte), ref.types.short, refArray(ref.types.int), ref.types.int, ref.types.int]],
		"FTIR_InterferogramToSpectrum": [ref.types.void, [refArray(ref.types.int), ref.types.double, ref.types.int, ref.types.int, ref.types.int, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		"FTIR_Spectrum_Interpo": [ref.types.void, [refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.double, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		"FTIR_UpdateAlignment": [ref.types.void, [ref.types.uint64, ref.types.double, ref.types.double]]
	});

	private readonly ftdiPath = "C:\\Users\\BrendanBohay\\Downloads\\CDM v2.12.28 WHQL Certified\\amd64\\ftd2xx64.dll";

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
	public UpdateAlignment(handle: number, x: number, y: number) {
		try {
			console.log("Updating alignment");
			this.functions.FTIR_UpdateAlignment(handle, x, y);
		} catch (error) {
			console.error("Error", error);
		}
	}

	public FTDI_Open(): number {
		let handle: number = 0;

		try {
			const handlePtr = ref.alloc(ref.types.uint64);
			const status = this.ftdi_functions.FT_Open(0, handlePtr);
			console.log("Open Status", status);

			handle = ref.deref(handlePtr);
		} catch (error) {
			console.error("Error", error);
		}

		return handle;
	}

	public FTDI_Close(handle: number) {
		try {
			const status = this.ftdi_functions.FT_Close(handle);
			console.log("Close Status", status);
		} catch (error) {
			console.error("Error", error);
		}
	}

	public FTDI_SetBaudRate(handle: number, baudRate: number) {
		try {
			const status = this.ftdi_functions.FT_SetBaudRate(handle, baudRate);
			console.log("Baud Rate Set Status", status);
		} catch (error) {
			console.error("Error", error);
		}
	}

	public FTDI_Write(handle: number, data: number[]) {
		try {
			const bytesWritten = ref.alloc(ref.types.ulong);

			const value = this.ftdi_functions.FT_Write(handle, data, 3, bytesWritten);

			console.log("Write return", value);
			console.log("bytes written", ref.deref(bytesWritten));
		} catch (error) {
			console.error("Error", error);
		}
	}

	public FTDI_SetDataCharacteristics(handle: number, arg1: number, arg2: number, arg3: number) {
		try {
			const status = this.ftdi_functions.FT_SetDataCharacteristics(handle, arg1, arg2, arg3);
			console.log("Set Data Characteristics Status", status);
		} catch (error) {
			console.error("Error", error);
		}
	}

	public GetSpectrum(handle: number) {
		const buffer = ref.alloc(refArray(ref.types.uint8));
		let bytesReturned = ref.alloc(ref.types.uint);

		// Here buffer doesn't matter. rxBytes should be a 1 and bytesReturned should be a 1
		let status = this.ftdi_functions.FT_Read(handle, buffer, 1, bytesReturned);

		let rxBytes = ref.deref(bytesReturned);
		console.log("Read 1 Status", status, rxBytes);

		if (status === 0 && rxBytes === 1) {
			setTimeout(() => {
				bytesReturned = ref.alloc(ref.types.ulong);

				status = this.ftdi_functions.FT_GetQueueStatus(handle, bytesReturned);

				rxBytes = ref.deref(bytesReturned);
				console.log("Get Queue Status", status, rxBytes);

				if (status === 0 && rxBytes > 0) {
					const buffer2 = ref.alloc(refArray(ref.types.uint64, rxBytes));
					bytesReturned = ref.alloc(ref.types.uint);

					status = this.ftdi_functions.FT_Read(handle, buffer2, rxBytes, bytesReturned);

					rxBytes = ref.deref(bytesReturned);
					console.log("Read 2 Status", status, rxBytes);

					if (status === 0 && rxBytes > 0) {
						console.log("Ready for UArt Conversion");

						setTimeout(() => {
							// console.log("Writing buffer data to file");
							// const bufferData = ref.deref(buffer2);

							// const dataArray: any[] = [];
							// for (let index = 0; index < bufferData.length; index++) {
							// 	dataArray.push(bufferData[index]);
							// }

							// const fileHandler: FileHandler = new FileHandler();
							// fileHandler.WriteFile("C:\\Temp\\SpectroScan\\PreUArtConversion.json", dataArray);

							const intf = ref.alloc(refArray(ref.types.int32, rxBytes / 2));

							this.functions.FTIR_UartConversion(buffer2, 1, intf, rxBytes, rxBytes);

							// console.log("Writing intf data to file");
							// const intfData = ref.deref(intf);

							// const dataArray: any[] = [];
							// for (let index = 0; index < intfData.length; index++) {
							// 	dataArray.push(intfData[index]);
							// }

							// const fileHandler: FileHandler = new FileHandler();
							// fileHandler.WriteFile("C:\\Temp\\SpectroScan\\PostUArtConversion.json", dataArray);

							console.log("Ready for Interferogram to Spectrum");

							setTimeout(() => {
								rxBytes = rxBytes / 2;

								// TODO: Another set of numbers for hw profile?
								const zeroPadding: number = 16384;
								const boardband: number = 0;
								const mertz: number = 1000;
								const peak: number = 1;
								const calibrationFactor: number = 0.05;
								const SpectrumMag = ref.alloc(refArray(ref.types.double, rxBytes));
								const Wavenumber = ref.alloc(refArray(ref.types.double, rxBytes));
								const Intf_AC = ref.alloc(refArray(ref.types.double, rxBytes));

								this.functions.FTIR_InterferogramToSpectrum(intf, zeroPadding, boardband, mertz, peak, calibrationFactor, SpectrumMag, Wavenumber, Intf_AC, rxBytes, rxBytes, rxBytes);

								// console.log("Writing spectrum data to file");
								// const specData = ref.deref(SpectrumMag);
								// const waveData = ref.deref(Wavenumber);

								// const dataArray: any[] = [];
								// for (let index = 0; index < waveData.length; index++) {
								// 	const captureData = new SpectroScanCaptureData();
								// 	captureData.wavelength = waveData[index];
								// 	captureData.measuredValue = specData[index];

								// 	dataArray.push(captureData);
								// }

								// const fileHandler: FileHandler = new FileHandler();
								// fileHandler.WriteFile("C:\\Temp\\SpectroScan\\SpectrumData.json", dataArray);

								const scan: number = 2;
								const au: number = 0;
								const minwave: number = 900;
								const maxwave: number = 2600;
								const waverange: number = maxwave - minwave;
								const Absorption = ref.alloc(refArray(ref.types.double, waverange));
								const Raw = ref.alloc(refArray(ref.types.double, waverange));
								const Wavelength = ref.alloc(refArray(ref.types.double, waverange));

								this.functions.FTIR_Spectrum_Interpo(SpectrumMag, Wavenumber, SpectrumMag, Wavenumber, scan, au, minwave, maxwave, Absorption, Raw, Wavelength, waverange, waverange, waverange);

								console.log("Writing raw spectrum data to file");
								const specData = ref.deref(Raw);
								const waveData = ref.deref(Wavelength);

								const dataArray: any[] = [];
								for (let index = 0; index < waveData.length; index++) {
									const captureData = new SpectroScanCaptureData();
									captureData.wavelength = waveData[index];
									captureData.measuredValue = specData[index];

									dataArray.push(captureData);
								}

								const fileHandler: FileHandler = new FileHandler();
								const filename = "C:\\Temp\\SpectroScan\\RawSpectrumData_" + Date.now() + ".json";
								fileHandler.WriteFile(filename, dataArray);


							}, 10);


							// MAKE SURE TO CLOSE
							this.FTDI_Close(handle);
						}, 500);
					}
					else {
						console.log("Failed Read 2", status, rxBytes);
					}
				}
				else {
					console.log("Failed to get Queue Status", status, rxBytes);
				}
			}, 500);
		}
		else {
			console.log("Failed Read 1", status, rxBytes);
		}
	}
}
