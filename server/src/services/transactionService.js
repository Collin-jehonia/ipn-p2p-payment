/**
 * IPN P2P Payment - Transaction Service
 *
 * Handles transaction storage, idempotency checks, and business logic simulation.
 * Separates business concerns from the HTTP controller layer.
 */

const { generateTransactionId } = require("../utils/transactionIdGenerator");
const { buildSuccessResponse, buildErrorResponse } = require("../utils/responseBuilder");
const ERROR_CODES = require("../config/errorCodes");

// In-memory store for processed transactions (simulates idempotency)
const processedTransactions = new Map();

// Test accounts for simulating specific outcomes
const INSUFFICIENT_FUNDS_ACCOUNT = "1111111111";
const INTERNAL_ERROR_ACCOUNT = "9999999999";

/**
 * Checks if a transaction with the given clientReference already exists.
 * @param {string} clientReference
 * @returns {Object|null} - The cached response or null if not found
 */
function findByClientReference(clientReference) {
  if (processedTransactions.has(clientReference)) {
    return processedTransactions.get(clientReference);
  }
  return null;
}

/**
 * Stores a transaction response for future idempotency lookups.
 * @param {string} clientReference
 * @param {Object} response
 */
function saveTransaction(clientReference, response) {
  processedTransactions.set(clientReference, response);
}

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
    saveTransaction(clientReference, response);
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
  saveTransaction(clientReference, response);
  return { httpStatus: 200, response };
}

module.exports = {
  findByClientReference,
  saveTransaction,
  processPaymentTransaction,
};
