/**
 * This is a class for accessing Canon Camera compatiable devices
 */

import { Logger } from "../../common/logger";
import { Helpers } from "../../common/helpers";

export class CanonCameraAPI {
    /**
     *  Singleton
     */
    private static instance: CanonCameraAPI;

    static get Instance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new CanonCameraAPI();
        }
        return this.instance;
    }

}