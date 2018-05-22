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
	private readonly libPath = "./src/modules/SpectroScan/SpectroScanDLL.dll";

	private functions = new ffi.Library(this.libPath, {
		// "FTIR_DeviceConnect": [ref.types.void, [ref.types.uint, ref.refType("int"), ref.refType("bool"), refArray(ref.types.byte), ref.types.int]],
		// "FTIR_DeviceRead": [ref.types.void, [ref.types.int, ref.types.uint, refArray(ref.types.byte), ref.refType("uint"), ref.types.int]],
		// "FTIR_UartConversion": [ref.types.void, [refArray(ref.types.byte), ref.types.short, refArray(ref.types.int), ref.types.int, ref.types.int]],
		// "FTIR_InterferogramToSpectrum": [ref.types.void, [refArray(ref.types.int), ref.types.double, ref.types.int, ref.types.int, ref.types.int, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		// "FTIR_Spectrum_Interpo": [ref.types.void, [refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.double, ref.types.double, refArray(ref.types.double), refArray(ref.types.double), refArray(ref.types.double), ref.types.int, ref.types.int, ref.types.int]],
		// "FTIR_UpdateAlignment": [ref.types.void, [ref.types.int, ref.types.double, ref.types.double]]
	});


	/**
	 * 
	 * Public Functions
	 * 
	 */
	public DeviceConnect(): number {
		
		const handle = ref.alloc(ref.types.int);
		const status = ref.alloc(ref.types.bool);
		const device = refArray(ref.types.byte);

		console.log("about to connect");
		try {
			this.functions.FTIR_DeviceConnect(460800, handle, status, device, 100);
		} catch (error) {
			console.error(error);
		}

		const outHandle = ref.deref(handle);
		const outStatus = ref.deref(status);

		console.log("outHandle", outHandle);
		console.log("outStatus", outStatus);

		return outHandle;
	}
}
