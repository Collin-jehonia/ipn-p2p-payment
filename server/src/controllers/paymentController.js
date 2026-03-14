/**
 * IPN P2P Payment - Payment Controller
 *
 * Thin HTTP handler that orchestrates validation, idempotency,
 * and payment processing by delegating to the service layer.
 */

const { validatePaymentRequest } = require("../validators/paymentValidator");
const { buildErrorResponse } = require("../utils/responseBuilder");
const { findByClientReference, processPaymentTransaction } = require("../services/transactionService");
const ERROR_CODES = require("../config/errorCodes");

/**
 * POST /api/p2p-payment
 * Processes a P2P payment request against the Mock API Specification.
 */
async function processPayment(req, res) {
  try {
    const body = req.body;

    // Step 1: Validate the request
    const validationError = validatePaymentRequest(body);
    if (validationError) {
      const errorDef = ERROR_CODES[validationError.errorCode];
      const response = buildErrorResponse(
        validationError.errorCode,
        `${errorDef.message}: ${validationError.field}`
      );
      return res.status(errorDef.httpStatus).json(response);
    }

    // Step 2: Check for duplicate clientReference (idempotency)
    const duplicate = findByClientReference(body.clientReference);
    if (duplicate) {
      return res.status(200).json(duplicate);
    }

    // Step 3: Process the payment through business logic
    const { httpStatus, response } = processPaymentTransaction(body);
    return res.status(httpStatus).json(response);
  } catch (error) {
    const response = buildErrorResponse("ERR006", ERROR_CODES.ERR006.message);
    return res.status(500).json(response);
  }
}

module.exports = { processPayment };
