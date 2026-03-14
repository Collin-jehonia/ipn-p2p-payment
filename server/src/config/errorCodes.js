/**
 * IPN P2P Payment - Error Code Definitions
 *
 * Maps error codes to their HTTP status codes and default messages,
 * as defined in the Mock API Specification.
 */

const ERROR_CODES = {
  ERR001: {
    httpStatus: 400,
    message: "Missing required field",
  },
  ERR002: {
    httpStatus: 400,
    message: "Invalid account number format",
  },
  ERR003: {
    httpStatus: 400,
    message: "Invalid currency",
  },
  ERR004: {
    httpStatus: 400,
    message: "Invalid amount",
  },
  ERR005: {
    httpStatus: 402,
    message: "Insufficient funds",
  },
  ERR006: {
    httpStatus: 500,
    message: "Internal processing error",
  },
};

module.exports = ERROR_CODES;
