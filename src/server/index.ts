import { WebServer } from "./web-server";

module.exports = () => {
	const app = new WebServer().GetApp();
};