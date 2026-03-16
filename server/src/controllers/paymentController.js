// IPN P2P Payment - Payment Controller
// Thin HTTP handler that orchestrates validation, idempotency,
// and payment processing by delegating to the service and model layers.

const { validatePaymentRequest } = require("../validators/paymentValidator");
const { buildErrorResponse } = require("../utils/responseBuilder");
const { logInfo, logWarning, logError, logRequest, logResponse } = require("../utils/logger");
const transactionService = require("../services/transactionService");
const TransactionModel = require("../models/transactionModel");
const ERROR_CODES = require("../config/errorCodes");

// POST /api/p2p-payment — Processes a P2P payment request
async function processPayment(req, res) {
  try {
    const body = req.body;

    logInfo("*********** Received payment request ***********");
    logRequest(body);

    const validationResult = handleValidation(body);
    if (validationResult) {
      return sendResponse(res, validationResult.httpStatus, validationResult.response, body.clientReference);
    }

    const duplicateResult = handleDuplicateCheck(body.clientReference);
    if (duplicateResult) {
      return sendResponse(res, 200, duplicateResult, body.clientReference);
    }

    const paymentResult = handlePaymentProcessing(body);
    return sendResponse(res, paymentResult.httpStatus, paymentResult.response, body.clientReference);
  } catch (error) {
    return handleUnexpectedError(res, error);
  }
}

// Validates the payment request body
function handleValidation(body) {
  logInfo("Validating payment request");
  const validationError = validatePaymentRequest(body);

  if (validationError) {
    logWarning(`Validation failed | errorCode=${validationError.errorCode} | field=${validationError.field}`);
    const errorDef = ERROR_CODES[validationError.errorCode];
    const response = buildErrorResponse(
      validationError.errorCode,
      `${errorDef.message}: ${validationError.field}`
    );
    return { httpStatus: errorDef.httpStatus, response };
  }

  logInfo("Validation passed");
  return null;
}

// Checks if a clientReference has already been processed (idempotency)
function handleDuplicateCheck(clientReference) {
  logInfo("Checking for duplicate clientReference");
  const duplicate = TransactionModel.findByClientReference(clientReference);

  if (duplicate) {
    logWarning("Duplicate clientReference detected — returning cached response");
    return duplicate;
  }

  return null;
}

// Delegates payment processing to the transaction service
function handlePaymentProcessing(body) {
  logInfo("Delegating to transaction service");
  return transactionService.processPaymentTransaction(body);
}

// Sends the HTTP response and logs the outcome
function sendResponse(res, httpStatus, response, clientReference) {
  logResponse(clientReference || "N/A", response, httpStatus);
  return res.status(httpStatus).json(response);
}

// Handles unexpected errors with a generic ERR006 response
function handleUnexpectedError(res, error) {
  logError("Unexpected error processing payment", error);
  const response = buildErrorResponse("ERR006", ERROR_CODES.ERR006.message);
  return res.status(500).json(response);
}

module.exports = { processPayment };
