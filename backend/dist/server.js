"use strict";
// Server entry point
// Starts the Express application on the configured port
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
// Graceful shutdown
let server;
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    if (server) {
        server.close(() => {
            console.log("HTTP server closed");
            process.exit(0);
        });
        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error("Could not close connections in time, forcefully shutting down");
            process.exit(1);
        }, 10000);
    }
    else {
        process.exit(0);
    }
}
// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
// Start server
server = app_1.default.listen(env_1.PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║                                        ║
║      BoldTap Backend Server Start      ║
║                                        ║
╚════════════════════════════════════════╝

📍 Server:      ${env_1.BACKEND_URL}
⚙️  Environment: ${env_1.NODE_ENV}
📦 Port:        ${env_1.PORT}
⏱️  Started:     ${new Date().toLocaleString()}

Ready to accept connections! 🚀
  `);
});
exports.default = server;
//# sourceMappingURL=server.js.map