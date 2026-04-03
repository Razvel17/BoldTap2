// Server entry point
// Starts the Express application on the configured port with WebSocket support

require("dotenv").config();

import { createServer } from "http";
import app from "./app";
import { PORT, NODE_ENV, BACKEND_URL } from "./config/env";
import { initializeDb, cleanupDb } from "./config/db";
import { WebSocketService } from "./services/websocketService";

// Graceful shutdown
let server: any;
let wsService: WebSocketService;

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      try {
        await cleanupDb();
      } catch (error) {
        console.error("Error closing database:", error);
      }
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down",
      );
      process.exit(1);
    }, 10000);
  } else {
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
    await initializeDb();

    // Create HTTP server for Express + Socket.io
    server = createServer(app);

    // Initialize WebSocket service
    wsService = new WebSocketService(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║                                        ║
║      BoldTap Backend Server Start      ║
║                                        ║
╚════════════════════════════════════════╝

📍 Server:      ${BACKEND_URL}
⚙️  Environment: ${NODE_ENV}
📦 Port:        ${PORT}
🔌 WebSocket:   Enabled
⏱️  Started:     ${new Date().toLocaleString()}

Ready to accept connections! 🚀
  `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default server;
export { wsService };

