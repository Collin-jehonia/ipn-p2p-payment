/**
 * IPN P2P Payment - Payment Controller
 *
 * Thin HTTP handler that orchestrates validation, idempotency,
 * and payment processing by delegating to the service and model layers.
 */

const { validatePaymentRequest } = require("../validators/paymentValidator");
const { buildErrorResponse } = require("../utils/responseBuilder");
const { logRequest, logResponse, logError } = require("../utils/logger");
const transactionService = require("../services/transactionService");
const TransactionModel = require("../models/transactionModel");
const ERROR_CODES = require("../config/errorCodes");

/**
 * POST /api/p2p-payment
 * Processes a P2P payment request against the Mock API Specification.
 */
async function processPayment(req, res) {
  try {
    const body = req.body;

    // Log incoming request with sensitive data masked
    logRequest(body);

    // Step 1: Validate the request
    const validationError = validatePaymentRequest(body);
    if (validationError) {
      const errorDef = ERROR_CODES[validationError.errorCode];
      const response = buildErrorResponse(
        validationError.errorCode,
        `${errorDef.message}: ${validationError.field}`
      );
      logResponse(body.clientReference || "N/A", response, errorDef.httpStatus);
      return res.status(errorDef.httpStatus).json(response);
    }

    // Step 2: Check for duplicate clientReference (idempotency)
    const duplicate = TransactionModel.findByClientReference(body.clientReference);
    if (duplicate) {
      logResponse(body.clientReference, duplicate, 200);
      return res.status(200).json(duplicate);
    }

    // Step 3: Process the payment through business logic
    const { httpStatus, response } = transactionService.processPaymentTransaction(body);
    logResponse(body.clientReference, response, httpStatus);
    return res.status(httpStatus).json(response);
  } catch (error) {
    logError("Unexpected error processing payment", error);
    const response = buildErrorResponse("ERR006", ERROR_CODES.ERR006.message);
    return res.status(500).json(response);
  }
}

module.exports = { processPayment };
