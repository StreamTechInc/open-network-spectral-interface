export interface IProperty {
	id: string;
	userReadableName: string;
	value: string;
	dataType: string;
	maxValue: number;
	minValue: number;
	increment: number;
	maxLength: number;
	possibleEnumValues: any;
	order: number;
}