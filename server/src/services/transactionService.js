/**
 * IPN P2P Payment - Transaction Service
 *
 * Handles business logic and payment processing simulation.
 * Delegates data persistence to the Transaction Model.
 */

const { generateTransactionId } = require("../utils/transactionIdGenerator");
const { buildSuccessResponse, buildErrorResponse } = require("../utils/responseBuilder");
const ERROR_CODES = require("../config/errorCodes");
const TransactionModel = require("../models/transactionModel");

// Test accounts for simulating specific outcomes
const INSUFFICIENT_FUNDS_ACCOUNT = "1111111111";
const INTERNAL_ERROR_ACCOUNT = "9999999999";

/**
 * Processes a validated payment request through business logic.
 * Returns the appropriate response based on sender account simulation rules.
 *
 * @param {Object} paymentData - The validated payment request body
 * @returns {{ httpStatus: number, response: Object }}
 */
function processPaymentTransaction(paymentData) {
  const { clientReference, senderAccountNumber } = paymentData;

  // Simulate insufficient funds for test account
  if (senderAccountNumber === INSUFFICIENT_FUNDS_ACCOUNT) {
    const response = buildErrorResponse("ERR005", ERROR_CODES.ERR005.message);
    TransactionModel.save(clientReference, response);
    return { httpStatus: ERROR_CODES.ERR005.httpStatus, response };
  }

  // Simulate internal processing error for test account
  if (senderAccountNumber === INTERNAL_ERROR_ACCOUNT) {
    const response = buildErrorResponse("ERR006", ERROR_CODES.ERR006.message);
    return { httpStatus: ERROR_CODES.ERR006.httpStatus, response };
  }

  // Successful transaction
  const transactionId = generateTransactionId();
  const response = buildSuccessResponse(transactionId);
  TransactionModel.save(clientReference, response);
  return { httpStatus: 200, response };
}

module.exports = { processPaymentTransaction };
