import { WebServer } from "./web-server";

module.exports = () => {
	const app = new WebServer().GetApplication();
};

// const app = new WebServer().GetApplication();
// export { app };