import { IProperty } from "../interfaces/IProperty";

export class HardwareProperty implements IProperty {
	id: string;
	userReadableName: string;
	value: string;
	dataType: string;
	maxValue: number;
	minValue: number;
	increment: string;
	maxLength: string;
	possibleEnumValues: any;
	order: number;
}