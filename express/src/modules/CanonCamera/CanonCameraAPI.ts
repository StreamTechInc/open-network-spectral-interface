/**
 * This is a class for accessing Canon Camera compatiable devices
 */

import { Logger } from "../../common/logger";
import * as request from "request";
import { CanonCameraDevice } from "./CanonCameraDevice";
import { HardwareProperty } from "../../models/hardware-property";



export class CanonCameraAPI {
	/**
	 *  Singleton
	 */
	private static instance: CanonCameraAPI;

	static get Instance() {
		if (this.instance === null || this.instance === undefined) {
			this.instance = new CanonCameraAPI();
		}
		return this.instance;
	}

	public GetDeviceInfo(): Promise<CanonCameraDevice> {
		return new Promise<CanonCameraDevice>((resolve, reject) => {
		
			try {
				const url: string = "http://192.168.1.2:8080/ccapi/ver100/deviceinformation";

				request.get(url, (error, response, body) => {
					if (error) {
						Logger.Instance.WriteError(error);
						reject(new Error(error));
					}

					if (response) {
						if (response.statusCode === 200) {
							const device: CanonCameraDevice = new CanonCameraDevice();
							device.modelName = JSON.parse(body).productname;
							device.serial = JSON.parse(body).serialnumber;
							resolve(device);
						}
						else {
							reject(new Error("failed to get device info"));
						}
					}
					else {
						reject(new Error("failed to get response"));
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	public StillImageShooting(af: boolean): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
		
			try {
				const url: string = "http://192.168.1.2:8080/ccapi/ver100/shooting/control/shutterbutton";
				const options = {
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify({af: af})
				};
				
				request.post(url, options, async (error, response, body) => {
					
					if (error) {
						Logger.Instance.WriteError(error);
						reject(new Error(error));
					}
					
					if (response) {
						
						if (response.statusCode === 200) {
							setTimeout(async () => {
								const fileNameUrl: string = await CanonCameraAPI.Instance.GetLastFileName();
								resolve(fileNameUrl);
							}, 400);
						}
						else {
							reject(new Error(response.statusCode + "failed to capture"));
						}
					}
					else {
						reject(new Error("Failed to get request response"));
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	public async GetLastFileName(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			try {
				// get content list from storage
				const url: string = "http://192.168.1.2:8080/ccapi/ver100/contents/sd/100CANON/";
				setTimeout(() => {
					request.get(url, (error, response, body) => {
						
						if (error) {
							Logger.Instance.WriteError(error);
							reject(new Error(error));
						}
						
						if (response) {
							
							if (response.statusCode === 200) {
								const contentList = JSON.parse(body).url;
								
								if (contentList.length > 0) {
									const lastUrl = contentList.pop();
									resolve(lastUrl);
								}
								else {
									reject(new Error("Content is empty"));
								}
							}
							else if (response.statusCode === 503) {
								Logger.Instance.WriteDebug("Device is buty");
								reject(new Error("busy"));
							}
							else {
								reject(new Error("Failed to get content"));
							}
						}
						else {
							reject(new Error("Failed to get request response"));
						}
					});
				}, (200));
			} catch (error) {
				reject(error);
			}
		});
	}

	public GetZoomProperty(): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			const property: HardwareProperty = new HardwareProperty();

			property.id = "zoom";
			property.userReadableName = "zoom";
			property.dataType = "int";
			property.order = 1;
			property.increment = 1;
			property.minValue = 0;
			property.maxValue = 201;

			try {
				const url: string = "http://192.168.1.2:8080/ccapi/ver100/shooting/control/zoom";
				
				request.get(url, (error, response, body) => {
					
					if (error) {
						Logger.Instance.WriteError(error);
						reject(new Error(error));
					}

					if (response) {
						
						if (response.statusCode === 200) {
							property.value = JSON.parse(body).value;
							resolve(property);
						}
					}
					else {
						reject(new Error("Failed to get zoom property"));
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}	

	public SetZoomProperty(newValue: number): Promise<HardwareProperty> {
		return new Promise<HardwareProperty>((resolve, reject) => {
			const property: HardwareProperty = new HardwareProperty();
			try {
				const url: string = "http://192.168.1.2:8080/ccapi/ver100/shooting/control/zoom";
				const options = {
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify({"value": newValue})
				};
				request.post(url, options, (error, response, body) => {
					
					if (error) {
						Logger.Instance.WriteError(error);
						reject(new Error(error));
					}
					
					if (response) {
						
						if (response.statusCode === 200) {
							property.value = JSON.parse(body).value;
							resolve(property);
						}
					}
					else {
						reject(new Error("Failed to get zoom property"));
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}
	
	public DownloadStorageFile(fileUrl: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {

			try {
				const options = {
					headers: {
						"content-type": "image/jpeg"
					}
				};
				request.get(fileUrl, options, (error, response, body) => {
					if (error) {
						Logger.Instance.WriteError(error);
						reject(error);
					}
					
					if (response) {

						if (response.statusCode === 200) {
							resolve(body);
						}
						else {
							Logger.Instance.WriteDebug("Failed to delete");
							reject();
						}
					}
					else {
						Logger.Instance.WriteDebug("Failed to get delete response");
						reject();
					}
				});

			} catch (error) {
				reject(error);
			}
		});
	}


	public DeleteStorageFile(fileUrl: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let isDeleted: boolean = false;

			try {
				request.delete(fileUrl, (error, response, body) => {
					
					if (error) {
						Logger.Instance.WriteError(error);
						reject(error);
					}
					
					if (response) {

						if (response.statusCode === 200) {
							isDeleted = true;
							resolve(isDeleted);
						}
						else {
							Logger.Instance.WriteDebug(response.statusCode + "Failed to delete");
							reject();
						}
					}
					else {
						Logger.Instance.WriteDebug("Failed to get delete response");
						reject();
					}
				});
			} catch (error) {
				Logger.Instance.WriteError(error);
				reject();
			}
		});
	} 
}