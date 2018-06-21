import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import { Logger } from "../../common/logger";
import { errno } from "ffi";
import { Helpers } from "../../common/helpers";
import { EventData } from "applicationinsights/out/Declarations/Contracts";

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
	// private readonly libPath = "./src/modules/SpectroScan/SpectroScanDLL_V6.b.dll";

	// private functions = new ffi.Library(this.libPath, {
	// 	"FTIR_DeviceConnect_64": [ref.types.uint32, [ref.types.uint32, ref.refType("uint64"), refArray(ref.types.char), ref.types.int32]],
	// 	"FTIR_DeviceRead_64": [ref.types.uint32, [ref.types.uint64, ref.types.uint32, refArray(ref.types.uint8), ref.refType("uint32"), ref.types.int32]],
	// 	// "FTIR_UartConversion": [ref.types.void, [refArray(ref.types.byte), ref.types.short, refArray(ref.types.int), ref.types.int, ref.types.int]],
	// 	// "FTIR_InterferogramToSpectrum": [ref.types.void, [refArray(ref.types.int), ref.types.double, ref.types.int, ref.types.int, ref.types.int, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
	// 	// "FTIR_Spectrum_Interpo": [ref.types.void, [refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.double, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
	// 	// "FTIR_UpdateAlignment": [ref.types.void, [ref.types.int, ref.types.double, ref.types.double]]
	// });

	// private readonly baudRate = 460800;

	// /**
	//  * 
	//  * Public Functions
	//  * 
	//  */
	// public DeviceConnect(): number {		
	// 	const handle = ref.alloc(ref.types.uint64);
	// 	const device = refArray(ref.types.uint8, 15);
	// 	let outHandle;
	// 	try {
	// 		const val1 = this.functions.FTIR_DeviceConnect_64(this.baudRate, handle, device, 15);

	// 		outHandle = ref.deref(handle);

	// 		console.log("handle", outHandle);

	// 		// const uartdata = refArray(ref.types.uint8, 8000);
	// 		// const byteswaiting = ref.alloc(ref.types.uint32);

	// 		// const time = ref.alloc(ref.types.uint32, 800);
	// 		// const len = ref.alloc(ref.types.int32, 8000);
	// 		// const handle2 = ref.deref(ref.alloc(ref.types.ulong, outHandle));

	// 		// console.log("handle", outHandle);
	// 		// console.log("handle2", handle2);

	// 		// const val2 = this.functions.FTIR_DeviceRead_64(outHandle, time, uartdata, byteswaiting, len);
	// 		console.log("val1", val1);
	// 		// console.log("val2", val2);
	// 		// console.log("bytes", ref.deref(byteswaiting));
	// 		// console.log("uart", uartdata);

	// 	} catch (error) {
	// 		console.error("Error", error);
	// 	}


	// 	// console.log("handle", outHandle);
	// 	// console.log("device", Helpers.Instance.ConvertByteArrayToString(device));

	// 	return outHandle;
	// }

	// public UpdateAlignment(handle: number, x: number, y: number) {
	// 	try {
	// 		// this.functions.FTIR_UpdateAlignment(handle, x, y);
	// 	} catch (error) {
	// 		console.error("Error", error);
	// 	}
	// }

	// public Read(handle: number) {
	// 	try {
	// 		console.log("handle", handle);

	// 		const uartdata = ref.alloc(refArray(ref.types.uint8, 8000));
	// 		const byteswaiting = ref.alloc(ref.types.uint);

	// 		const val = this.functions.FTIR_DeviceRead_64(handle, 800, uartdata, byteswaiting, 8000);
	// 		console.log("val", val);
	// 		console.log("bytes", ref.deref(byteswaiting));
	// 		console.log("uart", ref.deref(uartdata));
	// 		// const intf = refArray(ref.types.int, 4000);

	// 		// this.functions.FTIR_UartConversion(ref.deref(uartdata), 1, intf, ref.deref(byteswaiting), ref.deref(byteswaiting));

	// 	} catch (error) {
	// 		console.error("Error", error);
	// 	}
	// }


	/**
	 * Temp FTDI testing functionsbes
	 */

	private readonly ftdiPath = "C:\\Users\\BrendanBohay\\Downloads\\CDM v2.12.28 WHQL Certified\\amd64\\ftd2xx64.dll";

	private ftdi_functions = new ffi.Library(this.ftdiPath, {
		"FT_Open": [ref.types.ulong, [ref.types.int, ref.refType(ref.types.uint64)]],
		"FT_Close": [ref.types.ulong, [ref.types.uint64]],
		"FT_SetBaudRate": [ref.types.ulong, [ref.types.uint64, ref.types.ulong]],
		"FT_Write": [ref.types.ulong, [ref.types.uint64, refArray(ref.types.byte), ref.types.ulong, ref.refType(ref.types.ulong)]],
		"FT_Read": [ref.types.ulong, [ref.types.uint64, ref.refType(refArray(ref.types.byte)), ref.types.ulong, ref.refType(ref.types.ulong)]],
		"FT_GetStatus": [ref.types.ulong, [ref.types.uint64, ref.refType(ref.types.ulong), ref.refType(ref.types.ulong), ref.refType(ref.types.ulong)]],
		"FT_SetTimeouts": [ref.types.ulong, [ref.types.uint64, ref.types.ulong, ref.types.ulong]]
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

	public FTDI_Read(handle: number) {
		// Set timeout
		const timeoutRet = this.ftdi_functions.FT_SetTimeouts(handle, 5000, 0);

		console.log("timeoutRet", timeoutRet);

		// Get status
		const rxBytes = ref.alloc(ref.types.ulong);
		const txBytes = ref.alloc(ref.types.ulong);
		const eventD = ref.alloc(ref.types.ulong);

		const status = this.ftdi_functions.FT_GetStatus(handle, rxBytes, txBytes, eventD);

		console.log("status", status);
		console.log("rxBytes", ref.deref(rxBytes));
		console.log("txBytes", ref.deref(txBytes));
		console.log("eventD", ref.deref(eventD));

		// Read data
	} 
}
