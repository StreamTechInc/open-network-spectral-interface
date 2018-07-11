import * as fs from "fs";

export class FileHandler {

	public WriteFile(filename: string, data: any) {
		try {
			fs.writeFileSync(filename, JSON.stringify(data));
		} catch (error) {
			console.log(error);
		}
	}
}