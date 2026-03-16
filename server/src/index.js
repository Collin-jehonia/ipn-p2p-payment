const express = require("express");
const cors = require("cors");
const paymentRouter = require("./routes/paymentRouter");
const serverConfig = require("./config/server-config.json");

const app = express();
const PORT = process.env.PORT || serverConfig.server.port;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use(serverConfig.server.apiBasePath, paymentRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: "FAILED",
    errorCode: "NOT_FOUND",
    transactionId: null,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server only when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`IPN P2P Payment Mock API running on port ${PORT}`);
  });
}

module.exports = app;
