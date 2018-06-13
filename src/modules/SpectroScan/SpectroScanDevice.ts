import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { Logger } from "../../common/logger";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { ICaptureData } from "../../interfaces/ICaptureData";
import { SpectroScanAPI } from "./SpectroScanAPI";

export class SpectroScanDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = "SpectroScan Spectrometer";
	public handle: number;

	/**
	 * Private Variables
	 */
	private device: Array<number>;
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
	public GetProperties(): Array<HardwareProperty> {
		let properties: Array<HardwareProperty> = Array<HardwareProperty>();
		try {
			// properties.push(this.GetScanFilenameProperty());
		} catch (error) {
			Logger.Instance.WriteError(error);
			properties = undefined;
		}

		return properties;
	}

	public GetProperty(key: string): HardwareProperty {
		let property: HardwareProperty = undefined;

		try {
			switch (key) {
				case "scan_filename":
					// property = this.GetScanFilenameProperty();
					break;
				default:
					property = undefined;
					break;
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = undefined;
		}

		return property;
	}

	public SetProperty(setting: HardwareProperty): HardwareProperty | Error {
		let property: HardwareProperty | Error = undefined;

		try {
			switch (setting.id) {
				case "scan_filename":
					// property = this.SetScanFilenameProperty(setting.value);
					break;
				default:
					property = undefined;
					break;
			}
		} catch (error) {
			Logger.Instance.WriteError(error);
			property = error;
		}

		return property;
	}

	public Capture(): Array<ICaptureData> | Error {
		let capturedData: Array<ICaptureData> | Error = new Array<ICaptureData>();

		try {
			SpectroScanAPI.Instance.Read(this.handle);

		} catch (error) {
			Logger.Instance.WriteError(error);
			capturedData = error;
		}

		return capturedData;
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