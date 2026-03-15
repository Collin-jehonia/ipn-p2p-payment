/**
 * IPN P2P Payment - Logger Utility
 *
 * Provides structured logging with sensitive data masking.
 * Account numbers, references, and other PII are partially
 * masked to prevent exposure in logs.
 */

// Fields that contain sensitive data and should be masked
const SENSITIVE_FIELDS = ["senderAccountNumber", "receiverAccountNumber", "clientReference"];

/**
 * Masks a string value, showing only the first 3 and last 3 characters.
 * Example: "1234567890" → "123***890"
 * @param {string} value
 * @returns {string}
 */
function maskValue(value) {
  if (typeof value !== "string" || value.length <= 6) {
    return "***";
  }
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

/**
 * Creates a sanitised copy of the payload with sensitive fields masked.
 * @param {Object} payload
 * @returns {Object}
 */
function sanitisePayload(payload) {
  if (!payload || typeof payload !== "object") return {};

  const sanitised = { ...payload };
  for (const field of SENSITIVE_FIELDS) {
    if (sanitised[field]) {
      sanitised[field] = maskValue(sanitised[field]);
    }
  }
  return sanitised;
}

/**
 * Logs an incoming payment request with masked sensitive data.
 * @param {Object} payload - The request body
 */
function logRequest(payload) {
  const sanitised = sanitisePayload(payload);
  console.log(
    `${new Date().toISOString()} | REQUEST  | ${JSON.stringify(sanitised)}`
  );
}

/**
 * Logs the payment response.
 * @param {string} clientReference - The client reference (will be masked)
 * @param {Object} response - The response object
 * @param {number} httpStatus - The HTTP status code
 */
function logResponse(clientReference, response, httpStatus) {
  console.log(
    `${new Date().toISOString()} | RESPONSE | status=${response.status} | httpStatus=${httpStatus} | ref=${maskValue(clientReference)} | txnId=${response.transactionId || "N/A"} | error=${response.errorCode || "none"}`
  );
}

/**
 * Logs an error event.
 * @param {string} message - Error description
 * @param {Error} [error] - The error object
 */
function logError(message, error) {
  console.error(
    `${new Date().toISOString()} | ERROR    | ${message}${error ? ` | ${error.message}` : ""}`
  );
}

module.exports = { maskValue, sanitisePayload, logRequest, logResponse, logError };
