/**
 * Class to handle all common functions
 */
import { IHardware } from "../hardware/IHardware";
import { HardwareSettingModel } from "../models/hardwareSettingModel";

export let RemoveUninitialized = (array: Array<IHardware>): Array<IHardware> => {
	const tempArray = new Array<IHardware>();

	array.forEach(element => {
		if (element.id != undefined) {
			tempArray.push(element);
		}
	});

	return tempArray;
};

export let convertByteArrayToString = (buffer: Buffer): string => {
	let returnString = "";

	for (let index = 0; index < buffer.length; index++) {
		const value = buffer[index];

		if (value > 0) {
			returnString += String.fromCharCode(value);
		}
	}

	return returnString;
};

export let findDeviceById = (array: Array<IHardware>, id: string): IHardware => {
	let device: IHardware = undefined;

	array.forEach(element => {
		if (element.serial == id) {
			device = element;
		}
	});

	return device;
};

export let findSettingByKey = (array: Array<HardwareSettingModel>, key: string): HardwareSettingModel => {
	let settingModel: HardwareSettingModel = undefined;

	array.forEach(element => {
		if (element.id == key) {
			settingModel = element;
		}
	});

	return settingModel;
};