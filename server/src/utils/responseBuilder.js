// IPN P2P Payment - Response Builder Utility

const { logInfo } = require("./logger");

// Builds a standardised success response
function buildSuccessResponse(transactionId, message = "Payment processed successfully") {
  logInfo(`Building success response | txnId=${transactionId}`);
  return {
    status: "SUCCESS",
    errorCode: null,
    transactionId,
    message,
  };
}

// Builds a standardised error response
function buildErrorResponse(errorCode, message) {
  logInfo(`Building error response | errorCode=${errorCode}`);
  return {
    status: "FAILED",
    errorCode,
    transactionId: null,
    message,
  };
}

module.exports = { buildSuccessResponse, buildErrorResponse };
