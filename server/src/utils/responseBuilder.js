/**
 * IPN P2P Payment - Response Builder Utility
 *
 * Provides standardised response builders for the API.
 * Ensures consistent response format across all controllers.
 */

/**
 * Builds a standardised success response.
 * @param {string} transactionId - The generated transaction ID
 * @param {string} [message="Payment processed successfully"]
 * @returns {Object}
 */
function buildSuccessResponse(transactionId, message = "Payment processed successfully") {
  return {
    status: "SUCCESS",
    errorCode: null,
    transactionId,
    message,
  };
}

/**
 * Builds a standardised error response.
 * @param {string} errorCode - The error code (e.g. "ERR001")
 * @param {string} message - Human-readable error message
 * @returns {Object}
 */
function buildErrorResponse(errorCode, message) {
  return {
    status: "FAILED",
    errorCode,
    transactionId: null,
    message,
  };
}

module.exports = { buildSuccessResponse, buildErrorResponse };
