/**
 * IPN P2P Payment - Payment Routes
 *
 * Defines the API routes for P2P payment processing.
 * Follows the route/controller separation pattern.
 */

const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/paymentController");

// POST /api/p2p-payment — Process a P2P payment
router.post("/p2p-payment", processPayment);

module.exports = router;
