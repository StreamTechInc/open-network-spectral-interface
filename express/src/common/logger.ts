import * as ApplicationInsights from 'applicationinsights';
import * as DNS from 'dns';
import { Config } from './config';

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
		// Make sure we are connected to the internet before trying to send logs
		DNS.lookup('google.com', (error: any) => {
			if (!error) {
				ApplicationInsights.setup(Config.InstrumentationKey)
					.setAutoCollectConsole(true)
					.setAutoCollectExceptions(true)
					.start();

				this.client = ApplicationInsights.defaultClient;
			}
			else {
				this.client = undefined;
			}
		});
	}

	/**
	 * This will only write when in NODE_ENV === development
	 * @param message the message you wish to write to app insights
	 */
	public WriteDebug(message: string) {
		if (this.client != undefined && (process.env.NODE_ENV === 'development')) {
			this.client.trackTrace({ message: message });
		}

		console.log('Debug: ' + message);
	}

	/**
	 * This will write trace data in any APP_MODE
	 * @param message the message you wish to write to app insights
	 */
	public WriteInfo(message: string) {
		if (this.client != undefined) {
			this.client.trackTrace({ message: message });
		}

		console.log('Trace: ' + message);
	}

	public WriteError(exception: Error) {
		if (this.client != undefined) {
			this.client.trackException({ exception: exception });
		}

		console.log('Exception: ' + exception);
	}

}