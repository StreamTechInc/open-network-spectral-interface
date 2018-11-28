import { IHardware } from "./IHardware";

export interface IHardwareType {
	/**
	 * 
	 * @returns Array of connected devices of the hardware type
	 */
	GetDevices(): Promise<Array<IHardware>>;

	/**
	 * 
	 * @param id ID of the device you wish to retrieve
	 * @returns the device if found
	 */
	GetDeviceById(id: string): IHardware;

	/**
	 * 
	 * @returns boolean of successful shutdown or not
	 */
	CloseDevices(): boolean;
}