"use strict";
// Server entry point
// Starts the Express application on the configured port with WebSocket support
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = void 0;
require("dotenv").config();
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const websocketService_1 = require("./services/websocketService");
// Graceful shutdown
let server;
let wsService;
async function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    if (server) {
        server.close(async () => {
            console.log("HTTP server closed");
            try {
                await (0, db_1.cleanupDb)();
            }
            catch (error) {
                console.error("Error closing database:", error);
            }
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
// Start server with async initialization
async function startServer() {
    try {
        // Initialize database first
        console.log("🔌 Connecting to database...");
        await (0, db_1.initializeDb)();
        // Create HTTP server for Express + Socket.io
        server = (0, http_1.createServer)(app_1.default);
        // Initialize WebSocket service
        exports.wsService = wsService = new websocketService_1.WebSocketService(server);
        // Start server
        server.listen(env_1.PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║                                        ║
║      BoldTap Backend Server Start      ║
║                                        ║
╚════════════════════════════════════════╝

📍 Server:      ${env_1.BACKEND_URL}
⚙️  Environment: ${env_1.NODE_ENV}
📦 Port:        ${env_1.PORT}
🔌 WebSocket:   Enabled
⏱️  Started:     ${new Date().toLocaleString()}

Ready to accept connections! 🚀
  `);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
exports.default = server;
//# sourceMappingURL=server.js.map