import { WebServer } from "./web-server";

const app = new WebServer().GetApp();
module.exports = app;

// module.exports = () => {
// 	const app = new WebServer().GetApp();
// };