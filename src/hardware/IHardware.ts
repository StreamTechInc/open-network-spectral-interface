/**
 * Hardware interface all types of hardware must implement
 */

import { HardwareModel } from "../models/hardwareModel";
import { SeaBreeze } from "../hardware/SeaBreeze/SeaBreeze";
import { HardwareResponse } from "../hardware/hardwareResponse";

export interface IHardware {
	id: number;
	model: HardwareModel;
	serial: string;
	message: string;

	/**
	 * Get all settings for device
	 */
	getSettings(): HardwareResponse;

	/**
	 * Get a value for a specific setting
	 */
	getSettingValue(key: string): HardwareResponse;

	/**
	 * Set a setting with desired value
	 */
	setSettingValue(key: string, value: string): HardwareResponse;

	/**
	 * Capture an exposure with current settings
	 */
	capture(): HardwareResponse;

	/**
	 * Return camera status
	 * TODO: Figure out what the status actually is
	 */
	// getStatus(): string;

	/**
	 * Return list of frame acquisition subscriptions
	 */
	// getSubscriptions(): string;

	/**
	 * Add a subscription to list
	 * TODO: make Subscription object
	 */
	// addSubscription(): boolean;

	/**
	 * Delete a subscription
	 * TODO: make Subscription object
	 */
	// deleteSubscription(): boolean;

	/**
	 * Return URI for streaming
	 */
	// getStreamUri(): string;

	/**
	 * Toggles the stream on/off
	 */
	// toggleStream(): boolean;

	/**
	 * Closes Device
	 */
	closeDevice(): HardwareResponse;
}

export class HardwareFactory {
	public static createHardware(type: string): IHardware {
		if (type.toLowerCase() === "seabreeze") {
			return new SeaBreeze();
		}
	}
}