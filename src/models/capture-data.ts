import { ICaptureData } from "../interfaces/ICaptureData";

export class CaptureData implements ICaptureData {
	public wavelength: number;
	public measuredValue: number;
}