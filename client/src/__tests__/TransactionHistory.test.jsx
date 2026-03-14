/**
 * Unit Tests — TransactionHistory Component
 *
 * Verifies the transaction history table rendering:
 *   - Empty/null state
 *   - Column headers
 *   - Row data for success and error transactions
 *   - Status badge styling
 */

import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import TransactionHistory from "../components/TransactionHistory";

const successTx = {
  timestamp: "14:30:00",
  clientReference: "REF-20260314-001",
  reference: "Rent payment",
  amount: 1500.0,
  status: "SUCCESS",
  transactionId: "TXN202603140001",
  errorCode: null,
};

const errorTx = {
  timestamp: "14:31:00",
  clientReference: "REF-20260314-002",
  reference: "Grocery payment",
  amount: 250.5,
  status: "FAILED",
  transactionId: null,
  errorCode: "ERR005",
};

describe("TransactionHistory", () => {
  // ─── Empty State ───────────────────────────────────────────
  test("renders nothing when transactions is null", () => {
    const { container } = render(<TransactionHistory transactions={null} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders nothing when transactions is empty array", () => {
    const { container } = render(<TransactionHistory transactions={[]} />);
    expect(container.innerHTML).toBe("");
  });

  // ─── Table Headers ─────────────────────────────────────────
  test("renders all column headers", () => {
    render(<TransactionHistory transactions={[successTx]} />);
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Client Reference")).toBeInTheDocument();
    expect(screen.getByText("Payment Reference")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Transaction ID / Error")).toBeInTheDocument();
  });

  test("renders the 'Transaction History' heading", () => {
    render(<TransactionHistory transactions={[successTx]} />);
    expect(screen.getByText("Transaction History")).toBeInTheDocument();
  });

  // ─── Success Row ───────────────────────────────────────────
  describe("Success transaction row", () => {
    test("displays timestamp", () => {
      render(<TransactionHistory transactions={[successTx]} />);
      expect(screen.getByText("14:30:00")).toBeInTheDocument();
    });

    test("displays client reference", () => {
      render(<TransactionHistory transactions={[successTx]} />);
      expect(screen.getByText("REF-20260314-001")).toBeInTheDocument();
    });

    test("displays payment reference", () => {
      render(<TransactionHistory transactions={[successTx]} />);
      expect(screen.getByText("Rent payment")).toBeInTheDocument();
    });

    test("displays amount formatted as NAD", () => {
      render(<TransactionHistory transactions={[successTx]} />);
      expect(screen.getByText("NAD 1500.00")).toBeInTheDocument();
    });

    test("displays SUCCESS status badge", () => {
      render(<TransactionHistory transactions={[successTx]} />);
      expect(screen.getByText("SUCCESS")).toBeInTheDocument();
    });

    test("displays transaction ID", () => {
      render(<TransactionHistory transactions={[successTx]} />);
      expect(screen.getByText("TXN202603140001")).toBeInTheDocument();
    });
  });

  // ─── Error Row ─────────────────────────────────────────────
  describe("Error transaction row", () => {
    test("displays error code instead of transaction ID", () => {
      render(<TransactionHistory transactions={[errorTx]} />);
      expect(screen.getByText("ERR005")).toBeInTheDocument();
    });

    test("displays FAILED status", () => {
      render(<TransactionHistory transactions={[errorTx]} />);
      expect(screen.getByText("FAILED")).toBeInTheDocument();
    });

    test("displays amount formatted as NAD", () => {
      render(<TransactionHistory transactions={[errorTx]} />);
      expect(screen.getByText("NAD 250.50")).toBeInTheDocument();
    });
  });

  // ─── Multiple Rows ─────────────────────────────────────────
  test("renders all transactions in the list", () => {
    render(<TransactionHistory transactions={[successTx, errorTx]} />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });

  // ─── Fallback Dash ─────────────────────────────────────────
  test("displays dash when both transactionId and errorCode are null", () => {
    const unknownTx = {
      ...successTx,
      transactionId: null,
      errorCode: null,
    };
    render(<TransactionHistory transactions={[unknownTx]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
