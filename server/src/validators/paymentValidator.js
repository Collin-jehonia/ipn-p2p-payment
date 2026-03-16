// IPN P2P Payment - Request Validator
// Validates incoming payment requests against the Mock API Specification.

const { logInfo, logWarning } = require("../utils/logger");
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

// Validates the payment request body
function validatePaymentRequest(body) {
  logInfo("Checking required fields");
  const missingField = findMissingField(body);
  if (missingField) {
    logWarning(`Missing required field: ${missingField}`);
    return { errorCode: "ERR001", field: missingField };
  }

  logInfo("Validating account numbers");
  if (!isValidAccountNumber(body.senderAccountNumber)) {
    logWarning("Invalid sender account number format");
    return { errorCode: "ERR002", field: "senderAccountNumber" };
  }
  if (!isValidAccountNumber(body.receiverAccountNumber)) {
    logWarning("Invalid receiver account number format");
    return { errorCode: "ERR002", field: "receiverAccountNumber" };
  }

  logInfo("Validating currency");
  if (!isValidCurrency(body.currency)) {
    logWarning(`Invalid currency: ${body.currency}`);
    return { errorCode: "ERR003", field: "currency" };
  }

  logInfo("Validating amount");
  if (!isValidAmount(body.amount)) {
    logWarning(`Invalid amount: ${body.amount}`);
    return { errorCode: "ERR004", field: "amount" };
  }

  logInfo("Validating reference");
  if (!isValidReference(body.reference)) {
    const isTooLong = typeof body.reference === "string" && body.reference.length > MAX_REFERENCE_LENGTH;
    logWarning(`Invalid reference: ${isTooLong ? "exceeds max length" : "invalid format"}`);
    return {
      errorCode: "ERR001",
      field: isTooLong ? `reference (max ${MAX_REFERENCE_LENGTH} characters)` : "reference",
    };
  }

  logInfo("All validations passed");
  return null;
}

// Returns the first missing required field, or null if all present
function findMissingField(body) {
  for (const field of REQUIRED_FIELDS) {
    if (isMissing(body[field])) {
      return field;
    }
  }
  return null;
}

// Checks if a value is missing (undefined, null, or empty string)
function isMissing(value) {
  return value === undefined || value === null || value === "";
}

// Checks if an account number is valid (numeric string, min length)
function isValidAccountNumber(accountNumber) {
  if (typeof accountNumber !== "string") return false;
  if (accountNumber.length < MIN_ACCOUNT_LENGTH) return false;
  return /^\d+$/.test(accountNumber);
}

// Checks if the currency matches the required value
function isValidCurrency(currency) {
  return currency === VALID_CURRENCY;
}

// Checks if the amount is a positive finite number
function isValidAmount(amount) {
  return typeof amount === "number" && amount > 0 && isFinite(amount);
}

// Checks if the reference is a valid string within max length
function isValidReference(reference) {
  return typeof reference === "string" && reference.length <= MAX_REFERENCE_LENGTH;
}

module.exports = { validatePaymentRequest };
