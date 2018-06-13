import * as ffi from "ffi";
import * as ref from "ref";
import * as refArray from "ref-array";
import { Logger } from "../../common/logger";
import { errno } from "ffi";
import { Helpers } from "../../common/helpers";

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
		"FTIR_DeviceConnect_64": [ref.types.uint32, [ref.types.uint32, ref.refType("uint64"), refArray(ref.types.byte), ref.types.int]],
		"FTIR_DeviceRead_64": [ref.types.uint32, [ref.types.ulong, ref.types.uint, refArray(ref.types.byte), ref.refType("uint"), ref.types.int]],
		// "FTIR_UartConversion": [ref.types.void, [refArray(ref.types.byte), ref.types.short, refArray(ref.types.int), ref.types.int, ref.types.int]],
		// "FTIR_InterferogramToSpectrum": [ref.types.void, [refArray(ref.types.int), ref.types.double, ref.types.int, ref.types.int, ref.types.int, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		// "FTIR_Spectrum_Interpo": [ref.types.void, [refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.double, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		// "FTIR_UpdateAlignment": [ref.types.void, [ref.types.int, ref.types.double, ref.types.double]]
	});

	private readonly baudRate = 460800;

	/**
	 * 
	 * Public Functions
	 * 
	 */
	public DeviceConnect(): number {		
		const handle = ref.alloc(ref.types.ulong);
		const device = refArray(ref.types.byte, 15);
		let outHandle: number = 0;
		try {
			const val1 = this.functions.FTIR_DeviceConnect_64(this.baudRate, handle, device, 15);

			outHandle = ref.deref(handle);

			const uartdata = refArray(ref.types.byte, 8000);
			const byteswaiting = ref.alloc(ref.types.uint);

			const time = ref.alloc(ref.types.uint, 800);
			const len = ref.alloc(ref.types.int, 8000);
			const handle2 = ref.deref(ref.alloc(ref.types.ulong, outHandle));

			console.log("handle", outHandle);
			console.log("handle2", handle2);

			const val2 = this.functions.FTIR_DeviceRead_64(outHandle, time, uartdata, byteswaiting, len);
			console.log("val1", val1);
			console.log("val2", val2);
			console.log("bytes", ref.deref(byteswaiting));
			// console.log("uart", uartdata);

		} catch (error) {
			console.error("Error", error);
		}
		

		// console.log("handle", outHandle);
		// console.log("device", Helpers.Instance.ConvertByteArrayToString(device.));

		return outHandle;
	}

	public UpdateAlignment(handle: number, x: number, y: number) {
		try {
			// this.functions.FTIR_UpdateAlignment(handle, x, y);
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

}
