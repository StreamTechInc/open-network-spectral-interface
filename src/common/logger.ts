/**
 * Logger class to be used for logging to console and application insights
 */

import * as ApplicationInsights from "applicationinsights";

export class Logger {
	private static instance: Logger;
	private client: ApplicationInsights.TelemetryClient;

	static get Instance() {
		if (this.instance === null || this.instance === undefined) {
			this.instance = new Logger();
		}

		return this.instance;
	}

	constructor() {
		ApplicationInsights.setup(process.env.INSTRUMENTATION_KEY)
			.setAutoCollectConsole(true)
			.setAutoCollectExceptions(true)
			.start();

		this.client = ApplicationInsights.defaultClient;
	}

	/**
	 * This will only write when in APP_MODE = local || development
	 * @param message the message you wish to write to app insights
	 */
	public WriteDebug(message: string) {
		if (this.client != undefined && (process.env.APP_MODE == "local" || process.env.APP_MODE == "development")) {
			this.client.trackTrace({ message: message });
			console.log("Debug: " + message);
		}
	}

	/**
	 * This will write trace data in any APP_MODE
	 * @param message the message you wish to write to app insights
	 */
	public WriteInfo(message: string) {
		if (this.client != undefined) {
			this.client.trackTrace({ message: message });
		}

		console.log("Trace: " + message);
	}

	public WriteError(exception: Error) {
		if (this.client != undefined) {
			this.client.trackException({ exception: exception });
		}

		console.log("Exception: " + exception);
	}

}