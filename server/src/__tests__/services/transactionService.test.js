/**
 * Unit Tests — Transaction Service
 *
 * Tests the core business logic layer:
 *   - Idempotency: findByClientReference + saveTransaction
 *   - Payment processing: success path, insufficient funds (ERR005),
 *     internal error (ERR006)
 */

const {
  findByClientReference,
  saveTransaction,
  processPaymentTransaction,
} = require("../../services/transactionService");

// Valid baseline payload
const validPayload = (overrides = {}) => ({
  clientReference: `REF-20260314-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
  senderAccountNumber: "1234567890",
  receiverAccountNumber: "0987654321",
  amount: 250.0,
  currency: "NAD",
  reference: "Test payment",
  ...overrides,
});

describe("transactionService", () => {
  // ─── findByClientReference / saveTransaction ───────────────
  describe("findByClientReference", () => {
    test("returns null for an unknown clientReference", () => {
      expect(findByClientReference("REF-UNKNOWN-999")).toBeNull();
    });

    test("returns the saved response for a known clientReference", () => {
      const ref = "REF-IDEMPOTENCY-001";
      const mockResponse = { status: "SUCCESS", transactionId: "TXN202603140099" };
      saveTransaction(ref, mockResponse);
      expect(findByClientReference(ref)).toEqual(mockResponse);
    });

    test("returns exact same object reference (no cloning)", () => {
      const ref = "REF-IDEMPOTENCY-002";
      const mockResponse = { status: "SUCCESS" };
      saveTransaction(ref, mockResponse);
      expect(findByClientReference(ref)).toBe(mockResponse);
    });
  });

  // ─── processPaymentTransaction ─────────────────────────────
  describe("processPaymentTransaction", () => {
    // Success path
    test("returns httpStatus 200 and SUCCESS status for valid payment", () => {
      const payload = validPayload();
      const { httpStatus, response } = processPaymentTransaction(payload);
      expect(httpStatus).toBe(200);
      expect(response.status).toBe("SUCCESS");
      expect(response.errorCode).toBeNull();
      expect(response.transactionId).toMatch(/^TXN\d{12}$/);
      expect(response.message).toBe("Payment processed successfully");
    });

    test("generates a unique transactionId per call", () => {
      const result1 = processPaymentTransaction(validPayload());
      const result2 = processPaymentTransaction(validPayload());
      expect(result1.response.transactionId).not.toBe(result2.response.transactionId);
    });

    test("stores successful transaction for idempotency", () => {
      const payload = validPayload({ clientReference: "REF-STORED-001" });
      const { response } = processPaymentTransaction(payload);
      const cached = findByClientReference("REF-STORED-001");
      expect(cached).toEqual(response);
    });

    // Insufficient funds (ERR005)
    test("returns ERR005 (402) for sender account 1111111111", () => {
      const payload = validPayload({
        senderAccountNumber: "1111111111",
        clientReference: "REF-INSUFF-001",
      });
      const { httpStatus, response } = processPaymentTransaction(payload);
      expect(httpStatus).toBe(402);
      expect(response.status).toBe("FAILED");
      expect(response.errorCode).toBe("ERR005");
      expect(response.transactionId).toBeNull();
      expect(response.message).toBe("Insufficient funds");
    });

    test("stores insufficient funds response for idempotency", () => {
      const payload = validPayload({
        senderAccountNumber: "1111111111",
        clientReference: "REF-INSUFF-002",
      });
      processPaymentTransaction(payload);
      const cached = findByClientReference("REF-INSUFF-002");
      expect(cached).not.toBeNull();
      expect(cached.errorCode).toBe("ERR005");
    });

    // Internal error (ERR006)
    test("returns ERR006 (500) for sender account 9999999999", () => {
      const payload = validPayload({
        senderAccountNumber: "9999999999",
        clientReference: "REF-INTERR-001",
      });
      const { httpStatus, response } = processPaymentTransaction(payload);
      expect(httpStatus).toBe(500);
      expect(response.status).toBe("FAILED");
      expect(response.errorCode).toBe("ERR006");
      expect(response.transactionId).toBeNull();
      expect(response.message).toBe("Internal processing error");
    });

    test("does NOT store internal error response (transient failure)", () => {
      const payload = validPayload({
        senderAccountNumber: "9999999999",
        clientReference: "REF-INTERR-002",
      });
      processPaymentTransaction(payload);
      const cached = findByClientReference("REF-INTERR-002");
      expect(cached).toBeNull();
    });
  });
});
