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
	public TestIncrement(value: number, increment: number): boolean {
		const result = +(value / increment).toFixed(5);
		return (result % 1) === 0;
	}

	public TestMinMax(value: number, min: number, max: number) {
		return (value >= min && value <= max);
	}

}