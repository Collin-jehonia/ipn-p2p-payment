/**
 * Unit Tests — Transaction ID Generator
 *
 * Verifies the TXN ID format defined in the Mock API Specification:
 *   Format: TXN + YYYYMMDD + sequential 4-digit number
 *   Example: "TXN202603140001"
 */

const { generateTransactionId } = require("../../utils/transactionIdGenerator");

describe("transactionIdGenerator — generateTransactionId", () => {
  test("returns a string starting with 'TXN'", () => {
    const id = generateTransactionId();
    expect(id).toMatch(/^TXN/);
  });

  test("matches the full format TXNYYYYMMDDnnnn", () => {
    const id = generateTransactionId();
    expect(id).toMatch(/^TXN\d{8}\d{4}$/);
  });

  test("contains today's date in YYYYMMDD format", () => {
    const id = generateTransactionId();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const expectedDate = `${year}${month}${day}`;
    expect(id.substring(3, 11)).toBe(expectedDate);
  });

  test("generates sequential IDs on successive calls", () => {
    const id1 = generateTransactionId();
    const id2 = generateTransactionId();
    const seq1 = parseInt(id1.substring(11), 10);
    const seq2 = parseInt(id2.substring(11), 10);
    expect(seq2).toBe(seq1 + 1);
  });

  test("pads the sequence number to 4 digits", () => {
    const id = generateTransactionId();
    const seqPart = id.substring(11);
    expect(seqPart).toHaveLength(4);
  });

  test("total ID length is 15 characters (TXN + 8 date + 4 seq)", () => {
    const id = generateTransactionId();
    expect(id).toHaveLength(15);
  });
});
