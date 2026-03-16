/**
 * Unit Tests — Payment Validator
 *
 * Validates all input rules defined in the Mock API Specification:
 *   - ERR001: Missing required fields
 *   - ERR002: Invalid account number format
 *   - ERR003: Invalid currency
 *   - ERR004: Invalid amount
 *   - Additional: reference max-length constraint
 */

const { validatePaymentRequest } = require("../../validators/paymentValidator");

// Valid baseline payload — every test starts from this and overrides one field
const validPayload = () => ({
  clientReference: "REF-20260314-001",
  senderAccountNumber: "1234567890",
  receiverAccountNumber: "0987654321",
  amount: 150.0,
  currency: "NAD",
  reference: "Rent payment March 2026",
});

describe("paymentValidator — validatePaymentRequest", () => {
  // ─── Happy Path ────────────────────────────────────────────
  test("returns null for a fully valid payload", () => {
    expect(validatePaymentRequest(validPayload())).toBeNull();
  });

  // ─── ERR001: Missing Required Fields ───────────────────────
  describe("ERR001 — missing required fields", () => {
    const requiredFields = [
      "clientReference",
      "senderAccountNumber",
      "receiverAccountNumber",
      "amount",
      "currency",
      "reference",
    ];

    requiredFields.forEach((field) => {
      test(`returns ERR001 when '${field}' is undefined`, () => {
        const payload = validPayload();
        delete payload[field];
        const result = validatePaymentRequest(payload);
        expect(result).toEqual({ errorCode: "ERR001", field });
      });

      test(`returns ERR001 when '${field}' is null`, () => {
        const payload = validPayload();
        payload[field] = null;
        const result = validatePaymentRequest(payload);
        expect(result).toEqual({ errorCode: "ERR001", field });
      });

      test(`returns ERR001 when '${field}' is an empty string`, () => {
        const payload = validPayload();
        payload[field] = "";
        const result = validatePaymentRequest(payload);
        expect(result).toEqual({ errorCode: "ERR001", field });
      });
    });
  });

  // ─── ERR002: Invalid Account Number Format ────────────────
  describe("ERR002 — invalid account number format", () => {
    test("returns ERR002 when senderAccountNumber is too short", () => {
      const payload = validPayload();
      payload.senderAccountNumber = "123456789"; // 9 digits
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR002", field: "senderAccountNumber" });
    });

    test("returns ERR002 when receiverAccountNumber is too short", () => {
      const payload = validPayload();
      payload.receiverAccountNumber = "12345";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR002", field: "receiverAccountNumber" });
    });

    test("returns ERR002 when senderAccountNumber contains letters", () => {
      const payload = validPayload();
      payload.senderAccountNumber = "12345ABCDE";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR002", field: "senderAccountNumber" });
    });

    test("returns ERR002 when receiverAccountNumber contains special characters", () => {
      const payload = validPayload();
      payload.receiverAccountNumber = "12345678-0";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR002", field: "receiverAccountNumber" });
    });

    test("returns ERR002 when senderAccountNumber is a number (not a string)", () => {
      const payload = validPayload();
      payload.senderAccountNumber = 1234567890;
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR002", field: "senderAccountNumber" });
    });

    test("accepts account numbers longer than 10 digits", () => {
      const payload = validPayload();
      payload.senderAccountNumber = "12345678901234";
      expect(validatePaymentRequest(payload)).toBeNull();
    });

    test("accepts account numbers with exactly 10 digits", () => {
      const payload = validPayload();
      payload.senderAccountNumber = "1234567890";
      expect(validatePaymentRequest(payload)).toBeNull();
    });
  });

  // ─── ERR003: Invalid Currency ──────────────────────────────
  describe("ERR003 — invalid currency", () => {
    test("returns ERR003 when currency is 'USD'", () => {
      const payload = validPayload();
      payload.currency = "USD";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR003", field: "currency" });
    });

    test("returns ERR003 when currency is lowercase 'nad'", () => {
      const payload = validPayload();
      payload.currency = "nad";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR003", field: "currency" });
    });

    test("returns ERR003 when currency is 'ZAR'", () => {
      const payload = validPayload();
      payload.currency = "ZAR";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR003", field: "currency" });
    });
  });

  // ─── ERR004: Invalid Amount ────────────────────────────────
  describe("ERR004 — invalid amount", () => {
    test("returns ERR004 when amount is zero", () => {
      const payload = validPayload();
      payload.amount = 0;
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR004", field: "amount" });
    });

    test("returns ERR004 when amount is negative", () => {
      const payload = validPayload();
      payload.amount = -50;
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR004", field: "amount" });
    });

    test("returns ERR004 when amount is a string", () => {
      const payload = validPayload();
      payload.amount = "150";
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR004", field: "amount" });
    });

    test("returns ERR004 when amount is Infinity", () => {
      const payload = validPayload();
      payload.amount = Infinity;
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR004", field: "amount" });
    });

    test("returns ERR004 when amount is NaN", () => {
      const payload = validPayload();
      payload.amount = NaN;
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR004", field: "amount" });
    });

    test("accepts valid decimal amounts", () => {
      const payload = validPayload();
      payload.amount = 0.01;
      expect(validatePaymentRequest(payload)).toBeNull();
    });

    test("accepts large amounts", () => {
      const payload = validPayload();
      payload.amount = 999999.99;
      expect(validatePaymentRequest(payload)).toBeNull();
    });
  });

  // ─── Reference Length ──────────────────────────────────────
  describe("Reference validation", () => {
    test("returns ERR001 when reference exceeds 50 characters", () => {
      const payload = validPayload();
      payload.reference = "A".repeat(51);
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR001", field: "reference (max 50 characters)" });
    });

    test("accepts reference with exactly 50 characters", () => {
      const payload = validPayload();
      payload.reference = "A".repeat(50);
      expect(validatePaymentRequest(payload)).toBeNull();
    });

    test("returns ERR001 when reference is a number (not a string)", () => {
      const payload = validPayload();
      payload.reference = 12345;
      const result = validatePaymentRequest(payload);
      expect(result).toEqual({ errorCode: "ERR001", field: "reference" });
    });
  });

  // ─── Priority Order ────────────────────────────────────────
  describe("Validation priority order", () => {
    test("returns ERR001 before ERR002 when both field missing and format invalid", () => {
      const payload = validPayload();
      delete payload.clientReference;
      payload.senderAccountNumber = "short";
      const result = validatePaymentRequest(payload);
      expect(result.errorCode).toBe("ERR001");
    });
  });
});
