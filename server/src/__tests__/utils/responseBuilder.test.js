/**
 * Unit Tests — Response Builder Utility
 *
 * Verifies the standardised response format returned by the API:
 *   - Success: { status, errorCode: null, transactionId, message }
 *   - Error:   { status, errorCode, transactionId: null, message }
 */

const { buildSuccessResponse, buildErrorResponse } = require("../../utils/responseBuilder");

describe("responseBuilder", () => {
  // ─── buildSuccessResponse ──────────────────────────────────
  describe("buildSuccessResponse", () => {
    test("returns correct structure with default message", () => {
      const result = buildSuccessResponse("TXN202603140001");
      expect(result).toEqual({
        status: "SUCCESS",
        errorCode: null,
        transactionId: "TXN202603140001",
        message: "Payment processed successfully",
      });
    });

    test("returns correct structure with custom message", () => {
      const result = buildSuccessResponse("TXN202603140002", "Custom success");
      expect(result).toEqual({
        status: "SUCCESS",
        errorCode: null,
        transactionId: "TXN202603140002",
        message: "Custom success",
      });
    });

    test("always sets status to 'SUCCESS'", () => {
      const result = buildSuccessResponse("TXN202603140003");
      expect(result.status).toBe("SUCCESS");
    });

    test("always sets errorCode to null", () => {
      const result = buildSuccessResponse("TXN202603140004");
      expect(result.errorCode).toBeNull();
    });

    test("preserves the transactionId exactly as provided", () => {
      const id = "TXN202603140005";
      const result = buildSuccessResponse(id);
      expect(result.transactionId).toBe(id);
    });
  });

  // ─── buildErrorResponse ────────────────────────────────────
  describe("buildErrorResponse", () => {
    test("returns correct structure for a validation error", () => {
      const result = buildErrorResponse("ERR001", "Missing required field: amount");
      expect(result).toEqual({
        status: "FAILED",
        errorCode: "ERR001",
        transactionId: null,
        message: "Missing required field: amount",
      });
    });

    test("always sets status to 'FAILED'", () => {
      const result = buildErrorResponse("ERR002", "Invalid account");
      expect(result.status).toBe("FAILED");
    });

    test("always sets transactionId to null", () => {
      const result = buildErrorResponse("ERR005", "Insufficient funds");
      expect(result.transactionId).toBeNull();
    });

    test("preserves errorCode exactly as provided", () => {
      const result = buildErrorResponse("ERR006", "Internal processing error");
      expect(result.errorCode).toBe("ERR006");
    });

    test("preserves message exactly as provided", () => {
      const msg = "Invalid currency";
      const result = buildErrorResponse("ERR003", msg);
      expect(result.message).toBe(msg);
    });
  });
});
