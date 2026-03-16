import { useState } from "react";

const INITIAL_FORM = {
  senderAccountNumber: "",
  receiverAccountNumber: "",
  amount: "",
  currency: "NAD",
  reference: "",
};

// Counter for generating sequential client references per session
let referenceCounter = 0;

/**
 * Generates a client reference in the format REF-YYYYMMDD-NNN
 * matching the spec sample: "REF-20260306-001"
 */
function generateClientReference() {
  referenceCounter++;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(referenceCounter).padStart(3, "0");
  return `REF-${year}${month}${day}-${seq}`;
}

/**
 * PaymentForm Component
 *
 * Renders the P2P payment form with client-side validation.
 * Generates a unique clientReference per submission.
 */
function PaymentForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!form.senderAccountNumber.trim()) {
      newErrors.senderAccountNumber = "Sender account number is required";
    } else if (!/^\d{10,}$/.test(form.senderAccountNumber.trim())) {
      newErrors.senderAccountNumber = "Must be numeric, at least 10 digits";
    }

    if (!form.receiverAccountNumber.trim()) {
      newErrors.receiverAccountNumber = "Receiver account number is required";
    } else if (!/^\d{10,}$/.test(form.receiverAccountNumber.trim())) {
      newErrors.receiverAccountNumber = "Must be numeric, at least 10 digits";
    }

    if (!form.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = "Must be a positive number";
    }

    if (form.currency !== "NAD") {
      newErrors.currency = "Only NAD currency is supported";
    }

    if (!form.reference.trim()) {
      newErrors.reference = "Reference is required";
    } else if (form.reference.trim().length > 50) {
      newErrors.reference = "Maximum 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      clientReference: generateClientReference(),
      senderAccountNumber: form.senderAccountNumber.trim(),
      receiverAccountNumber: form.receiverAccountNumber.trim(),
      amount: Number(form.amount),
      currency: form.currency,
      reference: form.reference.trim(),
    };

    onSubmit(payload);
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setErrors({});
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2>Send Payment</h2>

      <div className="form-group">
        <label htmlFor="senderAccountNumber">Sender Account Number</label>
        <input
          id="senderAccountNumber"
          name="senderAccountNumber"
          type="text"
          placeholder="e.g. 1234567890"
          value={form.senderAccountNumber}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.senderAccountNumber && (
          <span className="field-error">{errors.senderAccountNumber}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="receiverAccountNumber">Receiver Account Number</label>
        <input
          id="receiverAccountNumber"
          name="receiverAccountNumber"
          type="text"
          placeholder="e.g. 0987654321"
          value={form.receiverAccountNumber}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.receiverAccountNumber && (
          <span className="field-error">{errors.receiverAccountNumber}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <input
            id="currency"
            name="currency"
            type="text"
            value={form.currency}
            readOnly
            disabled
          />
          {errors.currency && <span className="field-error">{errors.currency}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reference">Payment Reference</label>
        <input
          id="reference"
          name="reference"
          type="text"
          placeholder="e.g. Rent payment March 2026"
          maxLength={50}
          value={form.reference}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.reference && <span className="field-error">{errors.reference}</span>}
        <span className="char-count">{form.reference.length}/50</span>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" />
              Processing...
            </>
          ) : (
            "Submit Payment"
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default PaymentForm;
