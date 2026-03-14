# IPN P2P Payment Application

A full-stack Person-to-Person (P2P) payment application built for the **Instant Payments Namibia (IPN) Developer Integration Challenge**. This application implements a Mock API server and a React-based frontend that allows users to initiate P2P payments, validates input per the specification, and displays transaction results.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Specification](#api-specification)
- [Validation Rules](#validation-rules)
- [Error Codes](#error-codes)
- [Frontend Features](#frontend-features)
- [Assumptions](#assumptions)
- [Integration Details](#integration-details)

---

## Architecture Overview

```
┌──────────────────────┐         ┌──────────────────────┐
│   React Frontend     │  HTTP   │   Express Backend    │
│   (Vite + React)     │────────▶│   (Mock API Server)  │
│   Port: 5173         │  POST   │   Port: 3001         │
│                      │◀────────│                      │
│  - Payment Form      │  JSON   │  - Request Validation│
│  - Result Display    │         │  - Payment Simulation│
│  - Transaction       │         │  - Error Handling    │
│    History           │         │  - Idempotency Check │
└──────────────────────┘         └──────────────────────┘
```

The application follows a **client-server architecture**:

- **Frontend (Client)**: A React SPA served by Vite's development server. It provides the payment form UI, performs client-side validation, sends requests to the backend via a proxied API path, and displays transaction results.
- **Backend (Server)**: An Express.js server that implements the Mock API specification. It validates incoming requests, simulates payment processing (including success, insufficient funds, and internal error scenarios), and returns structured JSON responses.
- **API Proxy**: In development, Vite proxies `/api/*` requests to the Express backend on port 3001, avoiding CORS issues.

---

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 19, Vite 8, Axios            |
| Backend  | Node.js, Express 4, UUID           |
| Dev      | Nodemon, Concurrently, ESLint      |

---

## Project Structure

```
ipn-p2p-payment/
├── package.json                    # Root: scripts to run both server & client
├── README.md                       # This file
│
├── server/                         # Express Mock API Server
│   ├── package.json
│   └── src/
│       ├── index.js                # Express app entry point
│       ├── routes/
│       │   └── paymentRouter.js    # Route definitions
│       ├── controllers/
│       │   └── paymentController.js # HTTP request/response handling
│       ├── services/
│       │   └── transactionService.js # Business logic & transaction processing
│       ├── validators/
│       │   └── paymentValidator.js  # Request validation rules
│       ├── utils/
│       │   ├── responseBuilder.js   # Standardised response builders
│       │   └── transactionIdGenerator.js # Sequential TXN ID generation
│       └── config/
│           └── errorCodes.js        # Error code definitions
│
└── client/                         # React Frontend
    ├── package.json
    ├── vite.config.js              # Vite config with API proxy
    └── src/
        ├── main.jsx                # App entry point
        ├── App.jsx                 # Root component
        ├── App.css                 # Application styles
        ├── index.css               # Global styles
        ├── services/
        │   └── paymentService.js   # API client (Axios)
        └── components/
            ├── PaymentForm.jsx     # Payment form with validation
            ├── TransactionResult.jsx # Success/error display
            └── TransactionHistory.jsx # Session transaction log
```

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or later (developed with v20)
- **npm** v9 or later

### Install Dependencies

From the project root:

```bash
# Install all dependencies (server + client)
npm run install:all

# OR install individually:
npm install --include=dev --prefix server
npm install --include=dev --prefix client
```

> **Note**: If your npm config has `omit=dev` set globally, use `--include=dev` to ensure development dependencies (Vite, Nodemon) are installed.

---

## Running the Application

### Development Mode (Recommended)

Start both server and client simultaneously:

```bash
npm run dev
```

This runs:
- **Server** on `http://localhost:3001` (with auto-reload via Nodemon)
- **Client** on `http://localhost:5173` (with HMR via Vite)

### Run Individually

```bash
# Start only the server
npm run server

# Start only the client
npm run client
```

### Production Build

```bash
# Build the client for production
npm run build

# Start the server (serves the API)
npm start
```

---

## API Specification

### Endpoint

```
POST /api/p2p-payment
Content-Type: application/json
```

### Request Body

| Field                  | Type   | Required | Constraints                  |
| ---------------------- | ------ | -------- | ---------------------------- |
| `clientReference`      | string | Yes      | Unique identifier per request |
| `senderAccountNumber`  | string | Yes      | Numeric, minimum 10 digits   |
| `receiverAccountNumber`| string | Yes      | Numeric, minimum 10 digits   |
| `amount`               | number | Yes      | Greater than 0               |
| `currency`             | string | Yes      | Must be `"NAD"`              |
| `reference`            | string | Yes      | Non-empty, max 50 characters |

### Example Request

```json
{
  "clientReference": "REF-20260306-001",
  "senderAccountNumber": "1234567890",
  "receiverAccountNumber": "0987654321",
  "amount": 150.00,
  "currency": "NAD",
  "reference": "Lunch payment"
}
```

### Response Structure

| Field           | Type        | Description                        |
| --------------- | ----------- | ---------------------------------- |
| `status`        | string      | `"SUCCESS"` or `"FAILED"`          |
| `errorCode`     | string/null | Error code if failed, null if success |
| `transactionId` | string/null | Transaction ID if success, null if failed |
| `message`       | string      | Human-readable result message       |

### Example Success Response

```json
{
  "status": "SUCCESS",
  "errorCode": null,
  "transactionId": "TXN202603060001",
  "message": "Payment processed successfully"
}
```

### Example Error Response

```json
{
  "status": "FAILED",
  "errorCode": "ERR001",
  "transactionId": null,
  "message": "Missing required field: senderAccountNumber"
}
```

---

## Validation Rules

The server validates requests in the following order:

1. **Required fields** — All six fields must be present and non-empty (`ERR001`)
2. **Account numbers** — Must be numeric strings with at least 10 digits (`ERR002`)
3. **Currency** — Must be exactly `"NAD"` (`ERR003`)
4. **Amount** — Must be a positive finite number (`ERR004`)
5. **Reference length** — Must not exceed 50 characters (`ERR001`)

The client performs the same validation before submitting, providing immediate user feedback.

---

## Error Codes

| Code   | HTTP Status | Description                    |
| ------ | ----------- | ------------------------------ |
| ERR001 | 400         | Missing required field          |
| ERR002 | 400         | Invalid account number format   |
| ERR003 | 400         | Invalid currency                |
| ERR004 | 400         | Invalid amount                  |
| ERR005 | 402         | Insufficient funds              |
| ERR006 | 500         | Internal processing error       |

---

## Frontend Features

- **Payment Form**: Clean, accessible form with labelled inputs for all required fields
- **Client-Side Validation**: Real-time error messages displayed per field before submission
- **Auto-Generated Client Reference**: Each submission generates a sequential reference in `REF-YYYYMMDD-NNN` format
- **Currency Lock**: Currency field is locked to `"NAD"` as per specification
- **Character Counter**: Reference field shows live character count (max 50)
- **Transaction Result**: Animated success/error card displaying the API response
- **Transaction History**: Session-based table showing all payment attempts with timestamps
- **Responsive Design**: Fully responsive layout that works on desktop and mobile
- **Loading State**: Form disables during API calls to prevent duplicate submissions

---

## Assumptions

The following assumptions were made where the specification did not provide explicit guidance. These are informed by an understanding of the IPN (Instant Payments Namibia) platform, the Bank of Namibia's Instant Payment System (IPS) framework, and standard payment processing conventions.

### General Architecture Assumptions

1. **Synchronous request-response model**: The mock API processes payments synchronously and returns a result immediately. In a production IPN integration, the payment initiation would likely follow an asynchronous pattern — the client submits a `pain.013` (ISO 20022 Creditor Payment Activation Request), receives an acknowledgement, and the final settlement status arrives via callback or polling. This mock simplifies that to a single synchronous POST for demonstration purposes.

2. **No persistent storage**: Transactions are stored in-memory on the server and reset when the server restarts. In production, all transactions would be persisted to a database to support reconciliation, audit trails, and regulatory reporting as required by the Bank of Namibia.

3. **No authentication or encryption**: As stated in the "Out of Scope" section. In the real IPN environment, all participant communication is secured via **mTLS with RSA2048 certificates**, and API access is managed through an API gateway (e.g. Kong) with OAuth2 token-based authentication.

### Payment Processing Assumptions

4. **Idempotency via clientReference**: If a payment with the same `clientReference` is submitted again, the server returns the original cached response. This mirrors real-world payment idempotency requirements — in IPN, the `EndToEndIdentification` (ISO 20022) must be unique per transaction to prevent duplicate settlement.

5. **clientReference format**: The frontend generates references in the format `REF-YYYYMMDD-NNN` (e.g. `REF-20260314-001`), matching the sample in the specification. In production, this would map to the ISO 20022 `EndToEndIdentification` field, which uniquely traces a payment from origination through settlement.

6. **transactionId format**: The server generates IDs in the format `TXN` + `YYYYMMDD` + sequential number (e.g. `TXN202603140001`), matching the sample in the specification. In the real IPN switch, this would be an IPN-assigned transaction reference used for settlement reconciliation.

7. **NAD currency only**: The Namibian Dollar (NAD, ISO 4217) is the only supported currency. This is consistent with IPN's mandate as a **domestic** instant payment system under the Bank of Namibia. The IPS is designed for NAD-denominated real-time transfers between Namibian financial institutions.

8. **Amount precision**: Amounts are accepted as floating-point numbers. In a production system, amounts would follow ISO 4217 conventions for NAD (2 decimal places) and would typically be represented as integers in the smallest currency unit (cents) to avoid floating-point precision issues.

### Simulated Business Logic Assumptions

9. **Test accounts for error simulation**: Since there is no real banking backend:
   - Sender account `1111111111` always returns `ERR005` (Insufficient Funds) — simulates a balance check failure that would normally be performed by the sending participant bank before initiating the IPN transfer.
   - Sender account `9999999999` always returns `ERR006` (Internal Processing Error) — simulates an infrastructure failure at the IPN switch or participant bank level.
   - All other valid requests return `SUCCESS` — simulates a successful real-time settlement.

10. **Account number validation (numeric, 10+ digits)**: The spec requires numeric account numbers with a minimum of 10 digits. In the Namibian banking context, account numbers vary by institution but typically range from 10-16 digits. The validation does not verify that the account exists at a participant bank — in production, account validation would involve a lookup against the IPN participant directory.

### Frontend Assumptions

11. **Validation order**: When multiple validation errors exist, the server returns the first error encountered (missing fields → account format → currency → amount → reference length). This "fail-fast" approach is standard in payment APIs to provide clear, actionable error feedback.

12. **Session-based transaction history**: The transaction history is maintained in the browser's React state for the current session only. In production, transaction history would be retrieved from a persistent backend, with support for searching, filtering, and reconciliation.

13. **No transaction limits**: The mock does not enforce per-transaction or daily limits. In the real IPN system, the Bank of Namibia imposes transaction value limits and daily aggregate thresholds that participant banks must enforce.

---

## Integration Details

### How This Maps to a Real IPN Integration

The IPN system is Namibia's national instant payment infrastructure, mandated by the Bank of Namibia and operated as a shared real-time switch between participating financial institutions. In production, a P2P payment flows through multiple layers:

```
┌─────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐
│  Payer   │────▶│  Originating │────▶│    IPN     │────▶│ Beneficiary  │────▶│  Payee  │
│  (User)  │     │  Bank (API)  │     │  Switch    │     │  Bank (API)  │     │ (User)  │
└─────────┘     └──────────────┘     └───────────┘     └──────────────┘     └─────────┘
                  pain.013             pacs.008           pain.014
              (Payment Request)    (FI-to-FI Transfer)  (Status Report)
```

This mock application simulates the **Originating Bank's client-facing layer** — the entry point where the payer captures payment details and the bank validates and submits them to the IPN switch.

| This Mock App                    | Production IPN Integration                                   |
| -------------------------------- | ------------------------------------------------------------ |
| Express mock endpoint            | Participant bank's API gateway (e.g. Kong on OpenShift)       |
| JSON request/response            | ISO 20022 XML messages (pain.013, pacs.008, pain.014)         |
| In-memory transaction store      | Database-backed transaction ledger with full audit trail       |
| Synchronous processing           | Asynchronous: initiate → acknowledge → settle → notify        |
| Simulated success/failure        | Real-time settlement through IPN switch with BoN oversight     |
| Sequential transaction IDs       | IPN-assigned transaction references for settlement tracing     |
| No authentication                | mTLS (RSA2048) + OAuth2 tokens via API gateway                 |
| No encryption                    | End-to-end message signing and encryption per BoN requirements |
| NAD currency hardcoded           | NAD per ISO 4217 (domestic scope of IPN)                       |
| Client-side clientReference      | Maps to ISO 20022 EndToEndIdentification field                 |
| No transaction limits            | BoN-mandated per-transaction and daily aggregate limits        |
| No account verification          | Real-time account lookup via IPN participant directory          |

### Server Architecture (Layered Design)

The backend follows a **layered architecture** separating concerns for maintainability and testability:

```
Routes (paymentRouter.js)          → HTTP route definitions
  ↓
Controllers (paymentController.js) → Request/response handling, orchestration
  ↓
Services (transactionService.js)   → Business logic, transaction processing
  ↓
Validators (paymentValidator.js)   → Input validation rules
  ↓
Utils (responseBuilder.js,         → Reusable utilities
       transactionIdGenerator.js)
  ↓
Config (errorCodes.js)             → Error code definitions
```

### API Proxy Configuration

In development, Vite proxies API requests to avoid CORS issues:

```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://localhost:3001",
      changeOrigin: true,
    },
  },
}
```

### Testing the API Directly

You can test the mock API using curl:

```bash
# Successful payment
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientReference": "REF-20260314-001",
    "senderAccountNumber": "1234567890",
    "receiverAccountNumber": "0987654321",
    "amount": 150.00,
    "currency": "NAD",
    "reference": "Lunch payment"
  }'

# Insufficient funds (sender account 1111111111)
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientReference": "REF-20260314-002",
    "senderAccountNumber": "1111111111",
    "receiverAccountNumber": "0987654321",
    "amount": 100,
    "currency": "NAD",
    "reference": "Will fail - insufficient funds"
  }'

# Missing required field
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Idempotency test (re-submit same clientReference — returns cached result)
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientReference": "REF-20260314-001",
    "senderAccountNumber": "1234567890",
    "receiverAccountNumber": "0987654321",
    "amount": 150.00,
    "currency": "NAD",
    "reference": "Lunch payment"
  }'
```

### Health Check

```bash
curl http://localhost:3001/health
# {"status":"ok","timestamp":"2026-03-14T..."}
```

---
