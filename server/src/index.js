const express = require("express");
const cors = require("cors");
const paymentRouter = require("./routes/paymentRouter");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", paymentRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server only when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`IPN P2P Payment Mock API running on port ${PORT}`);
  });
}

module.exports = app;
