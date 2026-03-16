// IPN P2P Payment - Transaction Service
// Class-based service that handles business logic and payment
// processing simulation. Delegates data persistence to the Transaction Model.

const { generateTransactionId } = require("../utils/transactionIdGenerator");
const { buildSuccessResponse, buildErrorResponse } = require("../utils/responseBuilder");
const { logInfo, logWarning, logError } = require("../utils/logger");
const ERROR_CODES = require("../config/errorCodes");
const paymentConfig = require("../config/payment-config.json");
const TransactionModel = require("../models/transactionModel");

// Test accounts for simulating specific outcomes (from config)
const INSUFFICIENT_FUNDS_ACCOUNT = paymentConfig.simulation.insufficientFundsAccount;
const INTERNAL_ERROR_ACCOUNT = paymentConfig.simulation.internalErrorAccount;

class TransactionService {
  constructor() {}

  // Processes a validated payment request through business logic
  processPaymentTransaction(paymentData) {
    logInfo("Processing payment transaction");
    const { clientReference, senderAccountNumber } = paymentData;

    const isInsufficientFunds = senderAccountNumber === INSUFFICIENT_FUNDS_ACCOUNT;
    const isInternalError = senderAccountNumber === INTERNAL_ERROR_ACCOUNT;

    if (isInsufficientFunds) {
      logWarning("Insufficient funds detected for sender account");
      return this.buildFailure(clientReference, "ERR005", { persist: true });
    }

    if (isInternalError) {
      logError("Internal processing error simulated for sender account");
      return this.buildFailure(clientReference, "ERR006", { persist: false });
    }

    return this.buildSuccess(clientReference);
  }

  // Builds and persists a successful transaction response
  buildSuccess(clientReference) {
    logInfo("Building success response");
    const transactionId = generateTransactionId();
    const response = buildSuccessResponse(transactionId);
    TransactionModel.save(clientReference, response);
    logInfo(`Payment processed successfully | txnId=${transactionId}`);
    return { httpStatus: 200, response };
  }

  // Builds a failure response and optionally persists it
  buildFailure(clientReference, errorCode, { persist }) {
    logInfo(`Building failure response | errorCode=${errorCode} | persist=${persist}`);
    const errorDef = ERROR_CODES[errorCode];
    const response = buildErrorResponse(errorCode, errorDef.message);
    if (persist) {
      TransactionModel.save(clientReference, response);
    }
    return { httpStatus: errorDef.httpStatus, response };
  }
}

// Singleton instance shared across the application
const transactionService = new TransactionService();
module.exports = transactionService;
