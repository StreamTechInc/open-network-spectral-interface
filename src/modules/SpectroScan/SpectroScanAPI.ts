import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import { Logger } from "../../common/logger";
import { errno } from "ffi";
import { Helpers } from "../../common/helpers";
import { EventData } from "applicationinsights/out/Declarations/Contracts";
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
	 * Private variables
	 * 
	 */
	private readonly libPath = "./src/modules/SpectroScan/SpectroScanDLL_V6.a.dll";

	private functions = new ffi.Library(this.libPath, {
		"FTIR_DeviceConnect_64": [ref.types.uint32, [ref.types.uint32, ref.refType("uint64"), refArray(ref.types.char), ref.types.int32]],
		"FTIR_DeviceRead_64": [ref.types.uint32, [ref.types.uint64, ref.types.uint32, refArray(ref.types.uint8), ref.refType("uint32"), ref.types.int32]],
		"FTIR_UartConversion": [ref.types.void, [refArray(ref.types.byte), ref.types.short, refArray(ref.types.int), ref.types.int, ref.types.int]],
		"FTIR_InterferogramToSpectrum": [ref.types.void, [refArray(ref.types.int), ref.types.double, ref.types.int, ref.types.int, ref.types.int, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		// "FTIR_Spectrum_Interpo": [ref.types.void, [refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.double, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		"FTIR_UpdateAlignment": [ref.types.void, [ref.types.uint64, ref.types.double, ref.types.double]]
	});

	private readonly baudRate = 2000000;

	/**
	 * 
	 * Public Functions
	 * 
	 */
	public DeviceConnect(): number {		
		const handle = ref.alloc(ref.types.uint64);
		const device = refArray(ref.types.uint8, 15);
		let outHandle;
		try {
			const status1 = this.functions.FTIR_DeviceConnect_64(2000000, handle, device, 15);

			outHandle = ref.deref(handle);

			console.log("handle", outHandle);
			console.log("status1", status1);

			// const uartdata = refArray(ref.types.uint8, 8000);
			// const byteswaiting = ref.alloc(ref.types.uint32);

			// const time = ref.alloc(ref.types.uint32, 800);
			// const len = ref.alloc(ref.types.int32, 8000);
			// const handle2 = ref.deref(ref.alloc(ref.types.ulong, outHandle));

			// console.log("handle", outHandle);
			// console.log("handle2", handle2);

			// const val2 = this.functions.FTIR_DeviceRead_64(outHandle, time, uartdata, byteswaiting, len);
			
			// console.log("val2", val2);
			// console.log("bytes", ref.deref(byteswaiting));
			// console.log("uart", uartdata);

		} catch (error) {
			console.error("Error", error);
		}


		// console.log("handle", outHandle);
		// console.log("device", Helpers.Instance.ConvertByteArrayToString(device));

		return outHandle;
	}

	public UpdateAlignment(handle: number, x: number, y: number) {
		try {
			console.log("updating alignment");
			this.functions.FTIR_UpdateAlignment(handle, x, y);
		} catch (error) {
			console.error("Error", error);
		}
	}

	public Read(handle: number) {
		try {
			console.log("handle", handle);

			const uartdata = ref.alloc(refArray(ref.types.uint8, 8000));
			const byteswaiting = ref.alloc(ref.types.uint);

			const val = this.functions.FTIR_DeviceRead_64(handle, 800, uartdata, byteswaiting, 8000);
			console.log("val", val);
			console.log("bytes", ref.deref(byteswaiting));
			console.log("uart", ref.deref(uartdata));
			// const intf = refArray(ref.types.int, 4000);

			// this.functions.FTIR_UartConversion(ref.deref(uartdata), 1, intf, ref.deref(byteswaiting), ref.deref(byteswaiting));

		} catch (error) {
			console.error("Error", error);
		}
	}


	/**
	 * Temp FTDI testing functionsbes
	 */

	private readonly ftdiPath = "C:\\Users\\Admin\\Downloads\\CDM v2.12.28 WHQL Certified\\amd64\\ftd2xx64.dll";

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

	public FTDI_Open(): number {
		const handlePtr = ref.alloc(ref.types.uint64);
		const openReturn = this.ftdi_functions.FT_Open(0, handlePtr);

		console.log("openReturn", openReturn);
		return ref.deref(handlePtr);
	}

	public FTDI_Close(handle: number) {
		const closeReturn = this.ftdi_functions.FT_Close(handle);
		console.log("closeReturn", closeReturn);
	}

	public FTDI_SetBaudRate(handle: number, baudRate: number) {
		const value = this.ftdi_functions.FT_SetBaudRate(handle, baudRate);
		console.log("Set Baud Rate return", value);
	}

	public FTDI_Write(handle: number) {
		// For now just hardcode command
		const data = [0xAD, 0x00, 0x00];
		const bytesWritten = ref.alloc(ref.types.ulong);
		
		const value = this.ftdi_functions.FT_Write(handle, data, 3, bytesWritten);

		console.log("Write return", value);
		console.log("bytes written", ref.deref(bytesWritten));
	}

	public FTDI_ListDevices() {
		const arg1 = ref.alloc(ref.types.ulong);
		const arg2 = ref.alloc(ref.types.ulong);

		const listReturn = this.ftdi_functions.FT_ListDevices(arg1, undefined, 0x80000000);

		console.log("listReturn", listReturn);
		console.log("arg1", ref.deref(arg1));
	}

	public FTDI_SetDataCharacteristics(handle: number) {
		const arg1 = ref.alloc(ref.types.uchar, 1);
		const arg2 = ref.alloc(ref.types.uchar, 0);
		const arg3 = ref.alloc(ref.types.uchar, 0);

		const setDCReturn = this.ftdi_functions.FT_SetDataCharacteristics(handle, 8, 0, 0);

		console.log("setDCReturn", setDCReturn);
	}

	public FTDI_Read(handle: number) {
		console.log("Beginning read");
		const buffer = ref.alloc(refArray(ref.types.uint8));
		const rxBytes = ref.types.ulong;
		let bytesReturned = ref.alloc(ref.types.uint);

		// Here buffer doesn't matter. rxBytes should be a 1 and bytesReturned should be a 1
		const status = this.ftdi_functions.FT_Read(handle, buffer, 1, bytesReturned);

		console.log("status", status);
		// console.log("buffer", ref.deref(buffer));
		// console.log("rxBytes", rxBytes);
		// console.log("bytesReturned", ref.deref(bytesReturned));
		let bytes = ref.deref(bytesReturned);

		if (bytes === 1) {
			setTimeout(() => {
				const rxBytesQueue = ref.alloc(ref.types.ulong);
				const queueStatus = this.ftdi_functions.FT_GetQueueStatus(handle, rxBytesQueue);

				console.log("queueStatus", queueStatus);
				console.log("rxBytesQueue", ref.deref(rxBytesQueue));

				const bytesToRead = ref.deref(rxBytesQueue);

				if (bytesToRead > 0) {
					const buf2 = ref.alloc(refArray(ref.types.uint64));
					bytesReturned = ref.alloc(ref.types.uint);

					const read2Return = this.ftdi_functions.FT_Read(handle, buf2, bytesToRead, bytesReturned);

					console.log("read2Return", read2Return);
					// console.log("buf2", buf2);

					bytes = ref.deref(bytesReturned);
					console.log("bytesReturned", bytes);

					// Uartconversion
					setTimeout(() => {
						
						const intf = ref.alloc(refArray(ref.types.int32, bytes / 2));
						console.log("Allocated intf");

						try {
							this.functions.FTIR_UartConversion(buf2, 1, intf, bytes, bytes);

							bytes = bytes / 2;
							// const dIntf = ref.deref(intf);
							// console.log("intf", dIntf);

							const zeroPadding: number = 16384;
							const boardband: number = 0;
							const mertz: number = 1000;
							const peak: number = 1;
							const calibrationFactor: number = 0.05;
							const SpectrumMag = ref.alloc(refArray(ref.types.double, 5000));
							const Wavenumber = ref.alloc(refArray(ref.types.double, 5000));
							const Intf_AC = ref.alloc(refArray(ref.types.double, 5000));

							this.functions.FTIR_InterferogramToSpectrum(intf, zeroPadding, boardband, mertz, peak, calibrationFactor, SpectrumMag, Wavenumber, Intf_AC, bytes, bytes, bytes);

							// console.log("SpectrumMag", ref.deref(SpectrumMag));
							 console.log("wavenumber", ref.deref(Wavenumber));
							// const spectrum = ref.deref(SpectrumMag);
							// const wavelengths = ref.deref(Wavenumber);

							for (let index = 0; index < Wavenumber.length; index++) {
								const captureData = new SpectroScanCaptureData();
								captureData.wavelength = Wavenumber[index];
								//captureData.measuredValue = spectrum[index];
								

								console.log(JSON.stringify(captureData));
							}

							
						} catch (error) {
							console.error(error);
						}
						finally {
							this.FTDI_Close(handle);
						}
						
					}, 10);
				}
			}, 500);
		}

		// Set timeout
		// const timeoutRet = this.ftdi_functions.FT_SetTimeouts(handle, 10, 0);
		// console.log("timeoutRet", timeoutRet);

		// setTimeout(() => {
			

		// 	// If both above are 1 then wait 500ms, get queue status for number of bytes to read the second time
		// 	// and then do a second. This buffer will matter.
		// 	setTimeout(() => {
				
		// 	}, 500);
		// }, 10);

		// const eventDWord = ref.alloc(ref.types.ulong);
		// const rxBytes = ref.alloc(ref.types.ulong);
		// const txBytes = ref.alloc(ref.types.ulong);

		// const statusReturn = this.ftdi_functions.FT_GetStatus(handle, rxBytes, txBytes, eventDWord);

		// console.log("statusReturn", statusReturn);
		// console.log("rxBytes", ref.deref(rxBytes));
		// console.log("txBytes", ref.deref(txBytes));
		// console.log("eventDWord", ref.deref(eventDWord));

		
		
		

		
	} 
}
