import { WebServer } from './web-server';

module.exports = () => {
	const app = new WebServer().GetApplication();
};

// Keep for now
// const app = new WebServer().GetApplication();
// export { app };