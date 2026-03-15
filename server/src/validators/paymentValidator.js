/**
 * IPN P2P Payment - Request Validator
 *
 * Validates incoming payment requests against the Mock API Specification.
 * Returns the first matching error code, or null if validation passes.
 */

const paymentConfig = require("../config/payment-config.json");

const REQUIRED_FIELDS = [
  "clientReference",
  "senderAccountNumber",
  "receiverAccountNumber",
  "amount",
  "currency",
  "reference",
];

const VALID_CURRENCY = paymentConfig.payment.validCurrency;
const MIN_ACCOUNT_LENGTH = paymentConfig.payment.minAccountLength;
const MAX_REFERENCE_LENGTH = paymentConfig.payment.maxReferenceLength;

/**
 * Validates the payment request body.
 * @param {Object} body - The request payload
 * @returns {{ errorCode: string, field: string } | null} - Error details or null if valid
 */
function validatePaymentRequest(body) {
  // ERR001 — Missing required fields
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return { errorCode: "ERR001", field };
    }
  }

  // ERR002 — Invalid sender account number (must be numeric, min 10 digits)
  if (!isValidAccountNumber(body.senderAccountNumber)) {
    return { errorCode: "ERR002", field: "senderAccountNumber" };
  }

  // ERR002 — Invalid receiver account number (must be numeric, min 10 digits)
  if (!isValidAccountNumber(body.receiverAccountNumber)) {
    return { errorCode: "ERR002", field: "receiverAccountNumber" };
  }

  // ERR003 — Invalid currency (must be "NAD")
  if (body.currency !== VALID_CURRENCY) {
    return { errorCode: "ERR003", field: "currency" };
  }

  // ERR004 — Invalid amount (must be a number greater than 0)
  if (typeof body.amount !== "number" || body.amount <= 0 || !isFinite(body.amount)) {
    return { errorCode: "ERR004", field: "amount" };
  }

  // Additional: reference must not exceed 50 characters
  if (typeof body.reference !== "string" || body.reference.length > MAX_REFERENCE_LENGTH) {
    return { errorCode: "ERR001", field: "reference" };
  }

  return null;
}

/**
 * Checks if an account number is valid (numeric string, min 10 characters).
 * @param {string} accountNumber
 * @returns {boolean}
 */
function isValidAccountNumber(accountNumber) {
  if (typeof accountNumber !== "string") return false;
  if (accountNumber.length < MIN_ACCOUNT_LENGTH) return false;
  return /^\d+$/.test(accountNumber);
}

module.exports = { validatePaymentRequest };
