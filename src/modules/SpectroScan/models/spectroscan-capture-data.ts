import { ICaptureData } from "../../../interfaces/ICaptureData";

export class SpectroScanCaptureData implements ICaptureData {
	public wavelength: number;
	public measuredValue: number;
}