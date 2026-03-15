/**
 * Unit Tests — Transaction Model
 *
 * Tests the data-access layer:
 *   - findByClientReference: lookup by key
 *   - save: persist a transaction response
 *   - clearAll: reset the store
 */

const TransactionModel = require("../../models/transactionModel");

describe("transactionModel", () => {
  beforeEach(() => {
    TransactionModel.clearAll();
  });

  describe("findByClientReference", () => {
    test("returns null for an unknown clientReference", () => {
      expect(TransactionModel.findByClientReference("REF-UNKNOWN-999")).toBeNull();
    });

    test("returns the saved response for a known clientReference", () => {
      const ref = "REF-MODEL-001";
      const mockResponse = { status: "SUCCESS", transactionId: "TXN202603140099" };
      TransactionModel.save(ref, mockResponse);
      expect(TransactionModel.findByClientReference(ref)).toEqual(mockResponse);
    });

    test("returns exact same object reference (no cloning)", () => {
      const ref = "REF-MODEL-002";
      const mockResponse = { status: "SUCCESS" };
      TransactionModel.save(ref, mockResponse);
      expect(TransactionModel.findByClientReference(ref)).toBe(mockResponse);
    });
  });

  describe("save", () => {
    test("overwrites existing entry with same clientReference", () => {
      const ref = "REF-MODEL-003";
      TransactionModel.save(ref, { status: "FAILED" });
      TransactionModel.save(ref, { status: "SUCCESS" });
      expect(TransactionModel.findByClientReference(ref).status).toBe("SUCCESS");
    });
  });

  describe("clearAll", () => {
    test("removes all stored transactions", () => {
      TransactionModel.save("REF-1", { status: "SUCCESS" });
      TransactionModel.save("REF-2", { status: "SUCCESS" });
      TransactionModel.clearAll();
      expect(TransactionModel.findByClientReference("REF-1")).toBeNull();
      expect(TransactionModel.findByClientReference("REF-2")).toBeNull();
    });
  });
});
