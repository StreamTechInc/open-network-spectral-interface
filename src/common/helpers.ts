import { IProperty } from "../interfaces/IProperty";
import { HardwareResponse } from "../models/hardwareResponse";

export class Helpers {
	/**
	 * 
	 * Singleton
	 * 
	 */
	private static instance: Helpers;

	static get Instance() {
		if (this.instance === null || this.instance === undefined) {
			this.instance = new Helpers();
		}

		return this.instance;
	}

	/**
	 * Property Validation
	 */
	public ValidateProperty(existingProperty: IProperty, newProperty: IProperty): HardwareResponse {
		const isValid = new HardwareResponse();
		isValid.success = false;

		if (newProperty.value !== undefined && newProperty.value.length > 0) {
			if (this.TestDataType(existingProperty.dataType, newProperty.value)) {
				if (existingProperty.dataType === "int" || existingProperty.dataType === "double") {
					// Following only need if a number
					const castValue = +newProperty.value;

					if (this.TestMinMax(castValue, existingProperty.minValue, existingProperty.maxValue)) {
						if (this.TestIncrement(castValue, existingProperty.increment)) {
							isValid.success = true;
						}
						else {
							isValid.data = "Value not incremented by set value.";
							isValid.success = false;
						}
					}
					else {
						isValid.data = "Value outside of bounds";
						isValid.success = false;
					}
				}
				else {
					// Finish validation if bool, enum or string here
				}
			}
			else {
				isValid.data = "Value not in expected format. Expecting " + existingProperty.dataType;
				isValid.success = false;
			}
		}
		else {
			isValid.data = "Must send actual value to set.";
			isValid.success = false;
		}

		return isValid;
	}

	public TestDataType(expectedType: string, newValue: string): boolean {
		let isValid = false;

		if (expectedType === "int" || expectedType === "double") {
			if (+newValue) {
				isValid = true;
			}
		}
		else if (expectedType === "enum") {
			// TODO: validate enum
		}
		else if (expectedType === "bool") {
			// TODO: validate bool
		}

		return isValid;
	}

	public TestIncrement(value: number, increment: number): boolean {
		const result = +(value / increment).toFixed(5);
		return (result % 1) === 0;
	}

	public TestMinMax(value: number, min: number, max: number) {
		return (value >= min && value <= max);
	}

}