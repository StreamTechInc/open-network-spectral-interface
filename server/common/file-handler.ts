import * as fs from "fs";

export class FileHandler {

	public WriteFile(filename: string, data: any) {
		try {
			fs.writeFileSync(filename, data);
		} catch (error) {
			console.log(error);
		}
	}

	public ReadFile(filename: string): any {
		let data;

		try {
			data = JSON.parse(fs.readFileSync(filename, "utf8"));
		} catch (error) {
			console.log(error);
		}

		return data;
	}

	public FileExists(filename: string): boolean {
		return fs.existsSync(filename);
	}
}