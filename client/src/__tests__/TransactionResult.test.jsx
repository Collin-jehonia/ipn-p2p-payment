/**
 * Unit Tests — TransactionResult Component
 *
 * Verifies rendering of API response details:
 *   - Success state: transactionId, message, status badge
 *   - Error state: errorCode, message, status badge
 *   - Dismiss button functionality
 *   - Null/empty state
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import TransactionResult from "../components/TransactionResult";

describe("TransactionResult", () => {
  // ─── Null State ────────────────────────────────────────────
  test("renders nothing when result is null", () => {
    const { container } = render(<TransactionResult result={null} />);
    expect(container.innerHTML).toBe("");
  });

  // ─── Success State ─────────────────────────────────────────
  describe("Success result", () => {
    const successResult = {
      status: "SUCCESS",
      errorCode: null,
      transactionId: "TXN202603140001",
      message: "Payment processed successfully",
      clientReference: "REF-20260314-001",
    };

    test("displays SUCCESS status badge", () => {
      render(<TransactionResult result={successResult} />);
      const badges = screen.getAllByText("SUCCESS");
      expect(badges.length).toBeGreaterThanOrEqual(1);
      expect(badges[0]).toBeInTheDocument();
    });

    test("displays the success message", () => {
      render(<TransactionResult result={successResult} />);
      expect(screen.getByText("Payment processed successfully")).toBeInTheDocument();
    });

    test("displays the transaction ID", () => {
      render(<TransactionResult result={successResult} />);
      expect(screen.getByText("TXN202603140001")).toBeInTheDocument();
    });

    test("displays the client reference", () => {
      render(<TransactionResult result={successResult} />);
      expect(screen.getByText("REF-20260314-001")).toBeInTheDocument();
    });

    test("applies success CSS class", () => {
      const { container } = render(<TransactionResult result={successResult} />);
      expect(container.querySelector(".transaction-result.success")).toBeInTheDocument();
    });

    test("does not display error code", () => {
      render(<TransactionResult result={successResult} />);
      expect(screen.queryByText("Error Code")).not.toBeInTheDocument();
    });
  });

  // ─── Error State ───────────────────────────────────────────
  describe("Error result", () => {
    const errorResult = {
      status: "FAILED",
      errorCode: "ERR005",
      transactionId: null,
      message: "Insufficient funds",
      clientReference: "REF-20260314-002",
    };

    test("displays FAILED status badge", () => {
      render(<TransactionResult result={errorResult} />);
      const badges = screen.getAllByText("FAILED");
      expect(badges.length).toBeGreaterThanOrEqual(1);
      expect(badges[0]).toBeInTheDocument();
    });

    test("displays the error message", () => {
      render(<TransactionResult result={errorResult} />);
      expect(screen.getByText("Insufficient funds")).toBeInTheDocument();
    });

    test("displays the error code", () => {
      render(<TransactionResult result={errorResult} />);
      expect(screen.getByText("ERR005")).toBeInTheDocument();
    });

    test("applies error CSS class", () => {
      const { container } = render(<TransactionResult result={errorResult} />);
      expect(container.querySelector(".transaction-result.error")).toBeInTheDocument();
    });

    test("does not display transaction ID label", () => {
      render(<TransactionResult result={errorResult} />);
      expect(screen.queryByText("Transaction ID")).not.toBeInTheDocument();
    });
  });

  // ─── Dismiss Button ────────────────────────────────────────
  describe("Dismiss functionality", () => {
    const result = {
      status: "SUCCESS",
      errorCode: null,
      transactionId: "TXN202603140001",
      message: "Payment processed successfully",
    };

    test("renders dismiss button when onDismiss is provided", () => {
      render(<TransactionResult result={result} onDismiss={() => {}} />);
      expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
    });

    test("calls onDismiss when dismiss button is clicked", async () => {
      const onDismiss = vi.fn();
      render(<TransactionResult result={result} onDismiss={onDismiss} />);
      await userEvent.click(screen.getByLabelText("Dismiss"));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    test("does not render dismiss button when onDismiss is not provided", () => {
      render(<TransactionResult result={result} />);
      expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
    });
  });
});
