// Server entry point
// Starts the Express application on the configured port

require("dotenv").config();

import app from "./app";
import { PORT, NODE_ENV, BACKEND_URL } from "./config/env";

// Graceful shutdown
let server: any;

function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
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

// Start server
server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║      BoldTap Backend Server Start      ║
║                                        ║
╚════════════════════════════════════════╝

📍 Server:      ${BACKEND_URL}
⚙️  Environment: ${NODE_ENV}
📦 Port:        ${PORT}
⏱️  Started:     ${new Date().toLocaleString()}

Ready to accept connections! 🚀
  `);
});

export default server;
