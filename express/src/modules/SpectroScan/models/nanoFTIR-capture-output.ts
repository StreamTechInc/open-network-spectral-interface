import { SpectroScanCaptureData } from './spectroscan-capture-data';

export class NanoFTIRCaptureOutput {
	comPort: number;
	scanData: Array<SpectroScanCaptureData>;
}