import { IHardware } from '../../interfaces/IHardware';
import { Guid } from 'guid-typescript';
import { HardwareProperty } from '../../models/hardware-property';
import { Logger } from '../../common/logger';
import { IStatus } from '../../interfaces/IStatus';
import { ISubscription } from '../../interfaces/ISubscription';
import { SoftCameraCaptureData } from './models/softcamera-capture-data';
import { Helpers } from '../../common/helpers';

export class SoftCameraDevice implements IHardware {
	/**
	 * Public Member Variables
	 */
	public id: Guid;
	public modelName: string;
	public serial: string;
	public type: string = 'SoftCamera';

	/**
	 * Private Member Variables
	 */
	private _datasetPath: string = 'D:\\RGB Images\\';
	private _datasetIndex: number = 0;

	/**
	 * Properties
	 */
	get timeout(): number {
		// default to 2 minutes in milliseconds
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
				properties.push(this.GetDatasetPathProperty());
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
					case 'dataset_path':
						property = this.GetDatasetPathProperty();
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
		return new Promise<HardwareProperty>((resolve, reject) => {
			let property: HardwareProperty = undefined;

			try {
				switch (setting.id) {
					case 'dataset_path':
						property = this.SetDatasetPathProperty(setting.value);
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

	public Capture(): Promise<Array<SoftCameraCaptureData>> {
		return new Promise<Array<SoftCameraCaptureData>>((resolve, reject) => {
			const capturedData: Array<SoftCameraCaptureData> = new Array<SoftCameraCaptureData>();

			try {
				const datasetPath = this.GetDatasetPathProperty();

				if (datasetPath && datasetPath.value) {
					const directoryReturn = Helpers.Instance.ReadFilenamesInDirectory(this._datasetPath);

					if (directoryReturn && directoryReturn.success) {
						// Reset the dataset file index
						if (directoryReturn.data.length <= this._datasetIndex) {
							this._datasetIndex = 0;
						}

						const fileResponse = Helpers.Instance.ReadImageFile(`${this._datasetPath}${directoryReturn.data[this._datasetIndex]}`);

						if (fileResponse && fileResponse.success) {							
							const imageData: SoftCameraCaptureData = new SoftCameraCaptureData();
							imageData.base64ImageData = fileResponse.data;
	
							capturedData.push(imageData);
						}
						else {
							reject(new Error(fileResponse.data));
						}						
					}
					else {
						reject(new Error(directoryReturn.data));
					}
				}
				else {
					reject(new Error('No dataset name set for scan data'));
				}

			} catch (error) {
				this._datasetIndex = 0;
				Logger.Instance.WriteError(error);
				reject(error);
			}

			resolve(capturedData);
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
	//#region Property Helpers
	private GetDatasetPathProperty(): HardwareProperty {
		const property: HardwareProperty = new HardwareProperty();

		// Fill out some known values
		property.id = 'dataset_path';
		property.userReadableName = 'Dataset Path';
		property.dataType = 'string';
		property.order = 1;
		property.maxLength = 100;

		// Get Current Value
		property.value = this._datasetPath.toString();

		return property;
	}

	private SetDatasetPathProperty(newValue: string): HardwareProperty {
		const property: HardwareProperty = this.GetDatasetPathProperty();

		this._datasetIndex = 0;
		this._datasetPath = newValue;
		property.value = newValue.toString();

		return property;
	}
	//#endregion
}