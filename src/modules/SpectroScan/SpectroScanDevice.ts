import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { Logger } from "../../common/logger";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { ICaptureData } from "../../interfaces/ICaptureData";
import { SpectroScanAPI } from "./SpectroScanAPI";
import { SpectroScanCaptureData } from "./models/spectroscan-capture-data";

export class SpectroScanDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string = "nanoFTIR";
	public serial: string = "NO3";
	public type: string = "SpectroScan Spectrometer";
	public handle: number;

	/**
	 * Private Variables
	 */
	private status: boolean;
	
	/**
	 * Constructor
	 */
	constructor() {
		this.id = Guid.create();
	}

	/**
	 * Public Functions
	 */
	public GetProperties(): Promise<Array<HardwareProperty>> {
		return new Promise<Array<HardwareProperty>>((resolve, reject) => {
			resolve(undefined);
		});
	}

	public GetProperty(key: string): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			resolve(undefined);
		});
	}

	public SetProperty(setting: HardwareProperty): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			resolve(undefined);
		});
	}

	public Capture(): Promise<Array<SpectroScanCaptureData>> {
		return new Promise<Array<SpectroScanCaptureData>>((resolve, reject) => {
			try {
				SpectroScanAPI.Instance.GetSpectrum(this.handle).then((data) => {
					resolve(data);
				}, (spectrumError) => {
					Logger.Instance.WriteError(spectrumError);
					reject(spectrumError);
				});
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}
		});
	}

	public GetStatus(): IStatus {
		return undefined;
	}

	public GetSubscriptions(): Array<ISubscription> {
		return undefined;
	}

	public AddSubscription(subscription: ISubscription): ISubscription {
		return undefined;
	}

	public DeleteSubscription(subscription: ISubscription): boolean {
		return false;
	}

	public GetStreamUri(): string {
		return undefined;
	}

	public ToggleStream(): boolean {
		return false;
	}
}