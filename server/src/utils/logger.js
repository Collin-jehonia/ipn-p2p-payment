// IPN P2P Payment - Logger Utility
// Provides structured logging with sensitive data masking.
// Log levels: INFO, WARN, ERROR, REQUEST, RESPONSE

const SENSITIVE_FIELDS = ["senderAccountNumber", "receiverAccountNumber", "clientReference"];

// Returns a formatted timestamp
function timestamp() {
  return new Date().toISOString();
}

// Masks a string value — e.g. "1234567890" → "123***890"
function maskValue(value) {
  if (typeof value !== "string" || value.length <= 6) {
    return "***";
  }
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

// Creates a sanitised copy of the payload with sensitive fields masked
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

// Logs an informational message
function logInfo(message) {
  console.log(`${timestamp()} | INFO     | ${message}`);
}

// Logs a warning message
function logWarning(message) {
  console.warn(`${timestamp()} | WARN     | ${message}`);
}

// Logs an error event
function logError(message, error) {
  console.error(
    `${timestamp()} | ERROR    | ${message}${error ? ` | ${error.message}` : ""}`
  );
}

// Logs an incoming payment request with masked sensitive data
function logRequest(payload) {
  const sanitised = sanitisePayload(payload);
  console.log(
    `${timestamp()} | REQUEST  | ${JSON.stringify(sanitised)}`
  );
}

// Logs the payment response
function logResponse(clientReference, response, httpStatus) {
  console.log(
    `${timestamp()} | RESPONSE | status=${response.status} | httpStatus=${httpStatus} | ref=${maskValue(clientReference)} | txnId=${response.transactionId || "N/A"} | error=${response.errorCode || "none"}`
  );
}

module.exports = { maskValue, sanitisePayload, logInfo, logWarning, logError, logRequest, logResponse };
