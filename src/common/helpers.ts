import { IProperty } from "../interfaces/IProperty";
import { HardwareResponse } from "../models/hardware-response";
import { Logger } from "./logger";
import * as fs from "fs";

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
				else if (existingProperty.dataType === "string") {
					if (newProperty.value.length <= existingProperty.maxLength) {
						isValid.success = true;
					}
					else {
						isValid.data = "Value length exceeds max length";
						isValid.success = false;
					}
				}
				else {
					// Finish validating enum and bool
					// just have success for now
					isValid.success = true;
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
		else if (expectedType === "string") {
			// Must be string 
			isValid = true;
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

	/** 
	 * String Helpers
	 */
	public ConvertByteArrayToString = (buffer: Buffer): string => {
		let returnString = "";

		for (let index = 0; index < buffer.length; index++) {
			const value = buffer[index];

			if (value > 0) {
				returnString += String.fromCharCode(value);
			}
		}

		return returnString;
	};

	/**
	 * File Helpers
	 */
	public ReadFile(filename: string): HardwareResponse {
		const fileResponse: HardwareResponse = new HardwareResponse();
		fileResponse.success = false;

		try {
			if (filename === undefined || filename.length === 0) {
				fileResponse.data = "No filename provided";
				Logger.Instance.WriteDebug(fileResponse.data);
			}
			else {
				if (!fs.existsSync(filename)) {
					fileResponse.data = 'File "' + filename + '" does not exist';
					Logger.Instance.WriteDebug(fileResponse.data);
				}
				else {
					fileResponse.data = JSON.parse(fs.readFileSync(filename, "utf8"));
					fileResponse.success = true;
				}
			}
		} catch (error) {
			fileResponse.data = error;
		}

		return fileResponse;
	}

	public ReadFilesInDirectory(filepath: string): HardwareResponse {
		const fileResponse: HardwareResponse = new HardwareResponse();
		fileResponse.success = false;

		try {
			if (filepath === undefined || filepath.length === 0) {
				fileResponse.data = "No filepath provided.";
			}
			else {
				const fileDataArray = new Array();
				fs.readdirSync(filepath).forEach(file => {
					const response = this.ReadFile(filepath + file);
					if (response.success) {
						fileDataArray.push(response.data);
					}
				});

				fileResponse.data = fileDataArray;
				fileResponse.success = true;
			}
		} catch (error) {
			fileResponse.data = error;
		}

		return fileResponse;
	}

	/**
	 * Number Helpers
	 */
	public Random(min: number, max: number) {
		return (Math.random() * (max - min + 1)) + min;
	}
}