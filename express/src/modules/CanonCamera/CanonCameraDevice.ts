import { IHardware } from "../../interfaces/IHardware";
import { Guid } from "guid-typescript";
import { HardwareProperty } from "../../models/hardware-property";
import { IStatus } from "../../interfaces/IStatus";
import { ISubscription } from "../../interfaces/ISubscription";
import { Logger } from "../../common/logger";
import { CanonCameraAPI } from "./CanonCameraAPI";
import { CanonCameraCaptureData } from "./models/canoncamera-capture-data";

export class CanonCameraDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = "Canon Camera";

	/**
	 * Private Variables
	 */
	private _autoFocus: boolean = true;

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
		return new Promise<Array<HardwareProperty>>(async (resolve, reject) => {
			const properties: Array<HardwareProperty> = Array<HardwareProperty>();

			try {
				const zoomProperty: HardwareProperty = new HardwareProperty();
				zoomProperty.id = "zoom";
				zoomProperty.userReadableName = "zoom";
				zoomProperty.dataType = "int";
				zoomProperty.order = 1;
				zoomProperty.increment = 1;
				zoomProperty.minValue = 0;
				zoomProperty.maxValue = 201;
				zoomProperty.value = await CanonCameraAPI.Instance.GetZoomProperty();
				properties.push(zoomProperty);
				properties.push(this.GetAutoFocusProperty());
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(properties);
		});
	}

	public GetProperty(key: string): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>(async (resolve, reject) => {
			let property: HardwareProperty = undefined;

			try {
				switch (key) {
					case "zoom":
						property = new HardwareProperty();
						property.id = "zoom";
						property.userReadableName = "zoom";
						property.dataType = "int";
						property.order = 1;
						property.increment = 1;
						property.minValue = 0;
						property.maxValue = 201;
						property.value = await CanonCameraAPI.Instance.GetZoomProperty();
						break;
					case "auto_focus":
						property = this.GetAutoFocusProperty();
						break;
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
		return new Promise<HardwareProperty>(async (resolve, reject) => {
			let property: HardwareProperty = undefined;

			try {
				switch (setting.id) {
					case "zoom":
						property = await CanonCameraAPI.Instance.SetZoomProperty(+setting.value);
						break;
					case "auto_focus":
						property = this.SetAutoFocusProperty(setting.value === "true");
						break;
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
				const fileNameUrl: string = await CanonCameraAPI.Instance.StillImageShooting(this._autoFocus);

				if (fileNameUrl) {
					const returnData: CanonCameraCaptureData = new CanonCameraCaptureData();
					returnData.imageData = await CanonCameraAPI.Instance.DownloadStorageFile(fileNameUrl);
					returnArray.push(returnData);
					await CanonCameraAPI.Instance.DeleteStorageFile(fileNameUrl);
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

	/**
	 * Private Functions
	 */

	private GetAutoFocusProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		property.id = "auto_focus";
		property.userReadableName = "Auto Focus";
		property.dataType = "bool";
		property.order = 2;
		property.increment = null;
		property.minValue = null;
		property.maxValue = null;

		property.value = this._autoFocus.toString();

		return property;
	}

	private SetAutoFocusProperty(newValue: boolean): HardwareProperty {
		const property: HardwareProperty = this.GetAutoFocusProperty();

		this._autoFocus = newValue;
		property.value = this._autoFocus.toString();

		return property;
	}
}