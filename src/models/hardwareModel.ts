import { HardwareSettingModel } from "./hardwareSettingModel";

export class HardwareModel {
	model: string;
	hardwareType: string;
	settings: Array<HardwareSettingModel>;
}