/**
 * Unit Tests — PaymentForm Component
 *
 * Verifies:
 *   - Form rendering and initial state
 *   - Client-side validation (mirrors server-side rules)
 *   - Payload construction on submission
 *   - Client reference generation (REF-YYYYMMDD-NNN format)
 *   - Loading state disables form
 *   - Reset functionality
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import PaymentForm from "../components/PaymentForm";

// Helper to fill all required fields
async function fillValidForm(user) {
  await user.type(screen.getByLabelText("Sender Account Number"), "1234567890");
  await user.type(screen.getByLabelText("Receiver Account Number"), "0987654321");
  await user.type(screen.getByLabelText("Amount"), "150");
  await user.type(screen.getByLabelText("Payment Reference"), "Rent payment March 2026");
}

describe("PaymentForm", () => {
  // ─── Rendering ─────────────────────────────────────────────
  describe("Initial rendering", () => {
    test("renders all form fields", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      expect(screen.getByLabelText("Sender Account Number")).toBeInTheDocument();
      expect(screen.getByLabelText("Receiver Account Number")).toBeInTheDocument();
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
      expect(screen.getByLabelText("Currency")).toBeInTheDocument();
      expect(screen.getByLabelText("Payment Reference")).toBeInTheDocument();
    });

    test("renders submit and reset buttons", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      expect(screen.getByText("Submit Payment")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    test("pre-fills currency as NAD with dropdown options", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      const currencySelect = screen.getByLabelText("Currency");
      expect(currencySelect.value).toBe("NAD");
      expect(currencySelect.tagName).toBe("SELECT");
    });

    test("displays character count for reference field", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      expect(screen.getByText("0/50")).toBeInTheDocument();
    });

    test("renders the form heading", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      expect(screen.getByText("Send Payment")).toBeInTheDocument();
    });
  });

  // ─── Client-Side Validation ────────────────────────────────
  describe("Validation", () => {
    test("shows error when sender account number is empty", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Sender account number is required")).toBeInTheDocument();
    });

    test("shows error when sender account number is less than 10 digits", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.type(screen.getByLabelText("Sender Account Number"), "12345");
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Must be numeric, at least 10 digits")).toBeInTheDocument();
    });

    test("shows error when sender account contains letters", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.type(screen.getByLabelText("Sender Account Number"), "123ABC7890");
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Must be numeric, at least 10 digits")).toBeInTheDocument();
    });

    test("shows error when receiver account number is empty", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.type(screen.getByLabelText("Sender Account Number"), "1234567890");
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Receiver account number is required")).toBeInTheDocument();
    });

    test("shows error when amount is empty", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Amount is required")).toBeInTheDocument();
    });

    test("shows error when reference is empty", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Reference is required")).toBeInTheDocument();
    });

    test("clears field error when user types in the field", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);
      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Sender account number is required")).toBeInTheDocument();

      await user.type(screen.getByLabelText("Sender Account Number"), "1234567890");
      expect(screen.queryByText("Sender account number is required")).not.toBeInTheDocument();
    });

    test("does not call onSubmit when validation fails", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={onSubmit} isLoading={false} />);
      await user.click(screen.getByText("Submit Payment"));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ─── Successful Submission ─────────────────────────────────
  describe("Submission", () => {
    test("calls onSubmit with correctly structured payload", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={onSubmit} isLoading={false} />);

      await fillValidForm(user);
      await user.click(screen.getByText("Submit Payment"));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.senderAccountNumber).toBe("1234567890");
      expect(payload.receiverAccountNumber).toBe("0987654321");
      expect(payload.amount).toBe(150);
      expect(payload.currency).toBe("NAD");
      expect(payload.reference).toBe("Rent payment March 2026");
    });

    test("generates clientReference in REF-YYYYMMDD-NNN format", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={onSubmit} isLoading={false} />);

      await fillValidForm(user);
      await user.click(screen.getByText("Submit Payment"));

      const payload = onSubmit.mock.calls[0][0];
      expect(payload.clientReference).toMatch(/^REF-\d{8}-\d{3}$/);
    });

    test("converts amount from string to number", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={onSubmit} isLoading={false} />);

      await fillValidForm(user);
      await user.click(screen.getByText("Submit Payment"));

      const payload = onSubmit.mock.calls[0][0];
      expect(typeof payload.amount).toBe("number");
    });

    test("trims whitespace from text fields", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={onSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText("Sender Account Number"), "  1234567890  ");
      await user.type(screen.getByLabelText("Receiver Account Number"), "  0987654321  ");
      await user.type(screen.getByLabelText("Payment Reference"), "  Test  ");
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.click(screen.getByText("Submit Payment"));

      const payload = onSubmit.mock.calls[0][0];
      expect(payload.senderAccountNumber).toBe("1234567890");
      expect(payload.receiverAccountNumber).toBe("0987654321");
      expect(payload.reference).toBe("Test");
    });
  });

  // ─── Loading State ─────────────────────────────────────────
  describe("Loading state", () => {
    test("disables submit button when loading", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={true} />);
      expect(screen.getByText("Processing...")).toBeDisabled();
    });

    test("disables all input fields when loading", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={true} />);
      expect(screen.getByLabelText("Sender Account Number")).toBeDisabled();
      expect(screen.getByLabelText("Receiver Account Number")).toBeDisabled();
      expect(screen.getByLabelText("Amount")).toBeDisabled();
      expect(screen.getByLabelText("Payment Reference")).toBeDisabled();
    });

    test("shows 'Processing...' text instead of 'Submit Payment'", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={true} />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
      expect(screen.queryByText("Submit Payment")).not.toBeInTheDocument();
    });

    test("disables reset button when loading", () => {
      render(<PaymentForm onSubmit={() => {}} isLoading={true} />);
      expect(screen.getByText("Reset")).toBeDisabled();
    });
  });

  // ─── Reset ─────────────────────────────────────────────────
  describe("Reset functionality", () => {
    test("clears all form fields on reset", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);

      await fillValidForm(user);
      await user.click(screen.getByText("Reset"));

      expect(screen.getByLabelText("Sender Account Number").value).toBe("");
      expect(screen.getByLabelText("Receiver Account Number").value).toBe("");
      expect(screen.getByLabelText("Amount").value).toBe("");
      expect(screen.getByLabelText("Payment Reference").value).toBe("");
    });

    test("clears validation errors on reset", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} isLoading={false} />);

      await user.click(screen.getByText("Submit Payment"));
      expect(screen.getByText("Sender account number is required")).toBeInTheDocument();

      await user.click(screen.getByText("Reset"));
      expect(screen.queryByText("Sender account number is required")).not.toBeInTheDocument();
    });
  });
});
