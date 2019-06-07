import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { resolve } from "path";
import { Logger } from "../../common/logger";
import { CanonCameraAPI } from "./CanonCameraAPI";
import { ICaptureData } from "../../interfaces/ICaptureData";
import request = require("request");
import { CanonCameraCaptureData } from "./models/canoncamera-capture-data";

export class CanonCameraDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = "Canon Camera";

	get timeout(): number {
		return 2 * 60 * 1000;
	}
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
			const properties: Array<HardwareProperty> = Array<HardwareProperty>();

			try {
				
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(properties);
		});
	}
		
	public GetProperty(key: string): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			let property: HardwareProperty = undefined;

			try {
				switch (key) {
					
					default:
						property = undefined;
						break;
				}
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(property);
		});
	}

	public SetProperty(setting: HardwareProperty): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			let property: HardwareProperty = undefined;

			try {
				switch (setting.id) {
					
					default:
						property = undefined;
						break;
				}
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(property);
		});
	}
		
	public Capture(): Promise<Array<CanonCameraCaptureData>> {
		return new Promise<Array<CanonCameraCaptureData>>(async (resolve, reject) => {
			try {
				const returnArray = new Array<CanonCameraCaptureData>();
				const fileNameUrl: string = await CanonCameraAPI.Instance.stillImageShooting(true);
				
					if (fileNameUrl) {
						console.log("sent back the url " + fileNameUrl);
						const returnData: CanonCameraCaptureData = new CanonCameraCaptureData();
						returnData.fileNameUrl = fileNameUrl;
						returnArray.push(returnData);
					}
				resolve(returnArray);
			} catch (error) {
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