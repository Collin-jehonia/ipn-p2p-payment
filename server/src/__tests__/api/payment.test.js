/**
 * Integration Tests — POST /api/p2p-payment
 *
 * Tests the full request lifecycle through Express:
 *   Route → Controller → Validator → Service → Response
 *
 * Uses supertest to send HTTP requests without starting the server.
 */

const request = require("supertest");
const app = require("../../index");

// Valid baseline payload
const validPayload = (overrides = {}) => ({
  clientReference: `REF-20260314-${String(Date.now()).slice(-3)}${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
  senderAccountNumber: "1234567890",
  receiverAccountNumber: "0987654321",
  amount: 100.0,
  currency: "NAD",
  reference: "Integration test payment",
  ...overrides,
});

describe("POST /api/p2p-payment", () => {
  // ─── Successful Payment ────────────────────────────────────
  describe("Success scenarios", () => {
    test("returns 200 with SUCCESS status for valid payload", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload())
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.errorCode).toBeNull();
      expect(res.body.transactionId).toMatch(/^TXN\d{12}$/);
      expect(res.body.message).toBe("Payment processed successfully");
    });

    test("returns all four required response fields", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload())
        .expect(200);

      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("errorCode");
      expect(res.body).toHaveProperty("transactionId");
      expect(res.body).toHaveProperty("message");
    });
  });

  // ─── Idempotency ───────────────────────────────────────────
  describe("Idempotency (duplicate clientReference)", () => {
    test("returns same response for duplicate clientReference", async () => {
      const payload = validPayload({ clientReference: "REF-IDEMPOTENT-API-001" });

      const first = await request(app)
        .post("/api/p2p-payment")
        .send(payload)
        .expect(200);

      const second = await request(app)
        .post("/api/p2p-payment")
        .send(payload)
        .expect(200);

      expect(second.body).toEqual(first.body);
      expect(second.body.transactionId).toBe(first.body.transactionId);
    });
  });

  // ─── ERR001: Missing Required Fields ───────────────────────
  describe("ERR001 — missing required fields", () => {
    test("returns 400 when clientReference is missing", async () => {
      const payload = validPayload();
      delete payload.clientReference;

      const res = await request(app)
        .post("/api/p2p-payment")
        .send(payload)
        .expect(400);

      expect(res.body.status).toBe("FAILED");
      expect(res.body.errorCode).toBe("ERR001");
      expect(res.body.transactionId).toBeNull();
      expect(res.body.message).toContain("Missing required field");
    });

    test("returns 400 when amount is missing", async () => {
      const payload = validPayload();
      delete payload.amount;

      const res = await request(app)
        .post("/api/p2p-payment")
        .send(payload)
        .expect(400);

      expect(res.body.errorCode).toBe("ERR001");
    });

    test("returns 400 when body is empty", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send({})
        .expect(400);

      expect(res.body.status).toBe("FAILED");
      expect(res.body.errorCode).toBe("ERR001");
    });
  });

  // ─── ERR002: Invalid Account Number ────────────────────────
  describe("ERR002 — invalid account number", () => {
    test("returns 400 when senderAccountNumber is too short", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ senderAccountNumber: "12345" }))
        .expect(400);

      expect(res.body.errorCode).toBe("ERR002");
      expect(res.body.message).toContain("senderAccountNumber");
    });

    test("returns 400 when receiverAccountNumber contains letters", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ receiverAccountNumber: "ABCDEFGHIJ" }))
        .expect(400);

      expect(res.body.errorCode).toBe("ERR002");
    });
  });

  // ─── ERR003: Invalid Currency ──────────────────────────────
  describe("ERR003 — invalid currency", () => {
    test("returns 400 when currency is not NAD", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ currency: "USD" }))
        .expect(400);

      expect(res.body.status).toBe("FAILED");
      expect(res.body.errorCode).toBe("ERR003");
      expect(res.body.message).toContain("Invalid currency");
    });
  });

  // ─── ERR004: Invalid Amount ────────────────────────────────
  describe("ERR004 — invalid amount", () => {
    test("returns 400 when amount is zero", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ amount: 0 }))
        .expect(400);

      expect(res.body.errorCode).toBe("ERR004");
    });

    test("returns 400 when amount is negative", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ amount: -10 }))
        .expect(400);

      expect(res.body.errorCode).toBe("ERR004");
    });
  });

  // ─── ERR005: Insufficient Funds ────────────────────────────
  describe("ERR005 — insufficient funds simulation", () => {
    test("returns 402 when senderAccountNumber is 1111111111", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ senderAccountNumber: "1111111111" }))
        .expect(402);

      expect(res.body.status).toBe("FAILED");
      expect(res.body.errorCode).toBe("ERR005");
      expect(res.body.transactionId).toBeNull();
      expect(res.body.message).toBe("Insufficient funds");
    });
  });

  // ─── ERR006: Internal Error ────────────────────────────────
  describe("ERR006 — internal error simulation", () => {
    test("returns 500 when senderAccountNumber is 9999999999", async () => {
      const res = await request(app)
        .post("/api/p2p-payment")
        .send(validPayload({ senderAccountNumber: "9999999999" }))
        .expect(500);

      expect(res.body.status).toBe("FAILED");
      expect(res.body.errorCode).toBe("ERR006");
      expect(res.body.transactionId).toBeNull();
      expect(res.body.message).toBe("Internal processing error");
    });
  });

  // ─── Health Check ──────────────────────────────────────────
  describe("GET /health", () => {
    test("returns ok status", async () => {
      const res = await request(app)
        .get("/health")
        .expect(200);

      expect(res.body.status).toBe("ok");
      expect(res.body).toHaveProperty("timestamp");
    });
  });
});
