# IPN P2P Payment Application

A full-stack Person-to-Person (P2P) payment application built for the **Instant Payments Namibia (IPN) Developer Integration Challenge**. This application implements a Mock API server and a React-based frontend that allows users to initiate P2P payments, validates input per the specification, and displays transaction results.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Endpoints](#endpoints)
- [Response Structure](#response-structure)
- [Validation Rules](#validation-rules)
- [Error Codes](#error-codes)
- [Frontend Features](#frontend-features)
- [Testing](#testing)
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

The application follows a **client-server architecture** with a class-based service layer, config-driven settings, and structured logging with sensitive data masking:

- **Frontend (Client)**: A React SPA served by Vite's development server. It provides the payment form UI, performs client-side validation, sends requests to the backend via a class-based `PaymentAPI` service (Axios), and displays transaction results.
- **Backend (Server)**: An Express.js server that implements the Mock API specification. It uses a layered architecture with class-based services (`TransactionService`, `TransactionModel`), validates incoming requests, simulates payment processing, and returns structured JSON responses. All operations are logged with PII masking for sensitive fields.
- **Config-Driven**: Server port, API base path, validation rules, and simulation accounts are externalised into JSON config files — no hardcoded values.
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
├── INTERVIEW_PREP.md               # Interview preparation guide
│
├── server/                         # Express Mock API Server
│   ├── package.json
│   └── src/
│       ├── index.js                # Express app entry point
│       ├── routes/
│       │   └── paymentRouter.js    # Route definitions
│       ├── controllers/
│       │   └── paymentController.js # HTTP request/response handling
│       ├── models/
│       │   └── transactionModel.js # Data storage & retrieval (in-memory, class-based)
│       ├── services/
│       │   └── transactionService.js # Business logic & payment processing (class-based)
│       ├── validators/
│       │   └── paymentValidator.js  # Request validation rules
│       ├── utils/
│       │   ├── logger.js            # Structured logging with PII masking
│       │   ├── responseBuilder.js   # Standardised response builders
│       │   └── transactionIdGenerator.js # Sequential TXN ID generation
│       ├── config/
│       │   ├── errorCodes.js        # Error code definitions
│       │   ├── server-config.json   # Server port & API base path
│       │   └── payment-config.json  # Validation rules & simulation accounts
│       └── __tests__/
│           ├── api/
│           │   └── payment.test.js          # Integration tests (27)
│           ├── validators/
│           │   └── paymentValidator.test.js  # Validation tests (28)
│           ├── services/
│           │   └── transactionService.test.js # Service tests (7)
│           ├── models/
│           │   └── transactionModel.test.js  # Model tests (5)
│           └── utils/
│               ├── responseBuilder.test.js   # Response builder tests (10)
│               └── transactionIdGenerator.test.js # ID generator tests (6)
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
        │   └── paymentService.js   # API client (class-based Axios instance)
        ├── components/
        │   ├── PaymentForm.jsx     # Payment form with validation
        │   ├── TransactionResult.jsx # Success/error display
        │   └── TransactionHistory.jsx # Session transaction log
        └── __tests__/
            ├── PaymentForm.test.jsx       # Form tests (23)
            ├── TransactionResult.test.jsx # Result tests (15)
            └── TransactionHistory.test.jsx # History tests (15)
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

## Endpoints

### POST — P2P Payment

URL: `localhost:3001/api/p2p-payment`

Method: `POST`

Authentication: `Not Required` (mock environment)

Content-Type: `application/json`

Parameter: | _**localhost:3001**_ | Specifies the link to where the Mock API server is hosted |

Parameter: | _**/api/p2p-payment**_ | Specifies the P2P payment processing endpoint |

#### Request Body Fields

| Field                  | Type   | Required | Constraints                                             |
| ---------------------- | ------ | -------- | ------------------------------------------------------- |
| `clientReference`      | string | Yes      | Unique per request, format `REF-YYYYMMDD-NNN`           |
| `senderAccountNumber`  | string | Yes      | Numeric only, minimum 10 digits                         |
| `receiverAccountNumber`| string | Yes      | Numeric only, minimum 10 digits                         |
| `amount`               | number | Yes      | Must be greater than 0, finite                          |
| `currency`             | string | Yes      | Must be `"NAD"` (Namibian Dollar)                       |
| `reference`            | string | Yes      | Non-empty, maximum 50 characters                        |

---

### 1. Successful Payment — `200 OK`

**Request Body:**

```json
{
  "clientReference": "REF-20260315-001",
  "senderAccountNumber": "1234567890",
  "receiverAccountNumber": "0987654321",
  "amount": 150.00,
  "currency": "NAD",
  "reference": "Lunch payment"
}
```

**Response:**

```json
{
  "status": "SUCCESS",
  "errorCode": null,
  "transactionId": "TXN202603150001",
  "message": "Payment processed successfully"
}
```

---

### 2. Idempotent Duplicate — `200 OK`

Submitting the **same `clientReference`** again returns the **original cached response** with the same `transactionId`. The payment is **not** processed a second time.

**Request Body:**

```json
{
  "clientReference": "REF-20260315-001",
  "senderAccountNumber": "1234567890",
  "receiverAccountNumber": "0987654321",
  "amount": 150.00,
  "currency": "NAD",
  "reference": "Lunch payment"
}
```

**Response:** _(identical to the first submission)_

```json
{
  "status": "SUCCESS",
  "errorCode": null,
  "transactionId": "TXN202603150001",
  "message": "Payment processed successfully"
}
```

---

### 3. ERR001 — Missing Required Field — `400 Bad Request`

Returned when any of the six required fields is missing, `null`, or an empty string.

**Request Body:**

```json
{
  "senderAccountNumber": "1234567890",
  "receiverAccountNumber": "0987654321",
  "amount": 100,
  "currency": "NAD",
  "reference": "Missing clientReference"
}
```

**Response:**

```json
{
  "status": "FAILED",
  "errorCode": "ERR001",
  "transactionId": null,
  "message": "Missing required field: clientReference"
}
```

---

### 4. ERR002 — Invalid Account Number — `400 Bad Request`

Returned when an account number is not a numeric string or has fewer than 10 digits.

**Request Body:**

```json
{
  "clientReference": "REF-20260315-002",
  "senderAccountNumber": "12345",
  "receiverAccountNumber": "0987654321",
  "amount": 100.00,
  "currency": "NAD",
  "reference": "Short sender account"
}
```

**Response:**

```json
{
  "status": "FAILED",
  "errorCode": "ERR002",
  "transactionId": null,
  "message": "Invalid account number format: senderAccountNumber"
}
```

---

### 5. ERR003 — Invalid Currency — `400 Bad Request`

Returned when the currency is anything other than `"NAD"`.

**Request Body:**

```json
{
  "clientReference": "REF-20260315-003",
  "senderAccountNumber": "1234567890",
  "receiverAccountNumber": "0987654321",
  "amount": 100.00,
  "currency": "USD",
  "reference": "Wrong currency"
}
```

**Response:**

```json
{
  "status": "FAILED",
  "errorCode": "ERR003",
  "transactionId": null,
  "message": "Invalid currency: currency"
}
```

---

### 6. ERR004 — Invalid Amount — `400 Bad Request`

Returned when the amount is zero, negative, not a number, or not finite.

**Request Body:**

```json
{
  "clientReference": "REF-20260315-004",
  "senderAccountNumber": "1234567890",
  "receiverAccountNumber": "0987654321",
  "amount": -50,
  "currency": "NAD",
  "reference": "Negative amount"
}
```

**Response:**

```json
{
  "status": "FAILED",
  "errorCode": "ERR004",
  "transactionId": null,
  "message": "Invalid amount: amount"
}
```

---

### 7. ERR005 — Insufficient Funds — `402 Payment Required`

Simulated when the sender account number is `1111111111`.

**Request Body:**

```json
{
  "clientReference": "REF-20260315-005",
  "senderAccountNumber": "1111111111",
  "receiverAccountNumber": "0987654321",
  "amount": 500.00,
  "currency": "NAD",
  "reference": "Insufficient funds test"
}
```

**Response:**

```json
{
  "status": "FAILED",
  "errorCode": "ERR005",
  "transactionId": null,
  "message": "Insufficient funds"
}
```

---

### 8. ERR006 — Internal Processing Error — `500 Internal Server Error`

Simulated when the sender account number is `9999999999`.

**Request Body:**

```json
{
  "clientReference": "REF-20260315-006",
  "senderAccountNumber": "9999999999",
  "receiverAccountNumber": "0987654321",
  "amount": 200.00,
  "currency": "NAD",
  "reference": "Internal error test"
}
```

**Response:**

```json
{
  "status": "FAILED",
  "errorCode": "ERR006",
  "transactionId": null,
  "message": "Internal processing error"
}
```

---

### GET — Health Check

URL: `localhost:3001/health`

Method: `GET`

Authentication: `Not Required`

Parameter: | _**localhost:3001**_ | Specifies the link to where the Mock API server is hosted |

Parameter: | _**/health**_ | Specifies the health check endpoint |

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## Response Structure

All responses from `POST /api/p2p-payment` follow a consistent structure:

| Field           | Type        | Description                                           |
| --------------- | ----------- | ----------------------------------------------------- |
| `status`        | string      | `"SUCCESS"` or `"FAILED"`                             |
| `errorCode`     | string/null | Error code if failed (e.g. `ERR001`), `null` if success |
| `transactionId` | string/null | Transaction ID if success (e.g. `TXN202603150001`), `null` if failed |
| `message`       | string      | Human-readable result message                          |

---

## Validation Rules

The server validates requests in the following priority order. The **first** validation failure encountered is returned:

| Priority | Rule                       | Error Code | HTTP Status |
| -------- | -------------------------- | ---------- | ----------- |
| 1        | All six fields must be present and non-empty | ERR001 | 400 |
| 2        | Account numbers must be numeric strings, min 10 digits | ERR002 | 400 |
| 3        | Currency must be exactly `"NAD"` | ERR003 | 400 |
| 4        | Amount must be a positive finite number | ERR004 | 400 |
| 5        | Reference must not exceed 50 characters | ERR001 | 400 |

The client performs the same validation before submitting, providing immediate user feedback.

---

## Error Codes

| Code   | HTTP Status | Description                    | Trigger                                        |
| ------ | ----------- | ------------------------------ | ---------------------------------------------- |
| ERR001 | 400         | Missing required field          | Any of the 6 fields is missing, null, or empty |
| ERR002 | 400         | Invalid account number format   | Non-numeric or fewer than 10 digits            |
| ERR003 | 400         | Invalid currency                | Currency is not `"NAD"`                        |
| ERR004 | 400         | Invalid amount                  | Zero, negative, NaN, Infinity, or non-number   |
| ERR005 | 402         | Insufficient funds              | Sender account `1111111111` (simulated)        |
| ERR006 | 500         | Internal processing error       | Sender account `9999999999` (simulated) or unhandled server error |

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


5. **Amount precision**: Amounts are accepted as floating-point numbers. In a production system, amounts would follow ISO 4217 conventions for NAD (2 decimal places) and would typically be represented as integers in the smallest currency unit (cents) to avoid floating-point precision issues.

### Simulated Business Logic Assumptions

6. **Test accounts for error simulation**: Since there is no real banking backend:
   - Sender account `1111111111` always returns `ERR005` (Insufficient Funds) — simulates a balance check failure that would normally be performed by the sending participant bank before initiating the IPN transfer.
   - Sender account `9999999999` always returns `ERR006` (Internal Processing Error) — simulates an infrastructure failure at the IPN switch or participant bank level.
   - All other valid requests return `SUCCESS` — simulates a successful real-time settlement.

7. **Account number validation (numeric, 10+ digits)**: The spec requires numeric account numbers with a minimum of 10 digits. In the Namibian banking context, account numbers vary by institution but typically range from 10-16 digits. The validation does not verify that the account exists at a participant bank — in production, account validation would involve a lookup against the IPN participant directory.


8. **No transaction limits**: The mock does not enforce per-transaction or daily limits. In the real IPN system, the Bank of Namibia imposes transaction value limits and daily aggregate thresholds that participant banks must enforce.

---

## Integration Details

### How This Maps to a Real IPN Integration

The IPN system is Namibia's national instant payment infrastructure, mandated by the Bank of Namibia and operated as a shared real-time switch between participating financial institutions. In production, a P2P payment flows through multiple layers:

```
┌─────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐
│  Payer   │────▶│  Originating │────▶│    IPN     │────▶│ Beneficiary  │────▶│  Payee  │
│  (User)  │     │  Bank (API)  │     │  Switch    │     │  Bank (API)  │     │ (User)  │
└─────────┘     └──────────────┘     └───────────┘     └──────────────┘     └─────────┘
                            
              (Payment Request)    (FI-to-FI Transfer)  (Status Report)
```

This mock application simulates the **Originating Bank's client-facing layer** — the entry point where the payer captures payment details and the bank validates and submits them to the IPN switch.


### Server Architecture (Layered Design)

The backend follows a **layered architecture** separating concerns for maintainability and testability:

```
Routes (paymentRouter.js)              → HTTP route definitions
  ↓
Controllers (paymentController.js)     → Request/response handling, orchestration
  ↓
Services (transactionService.js)       → Business logic, payment processing (class-based)
  ↓
Models (transactionModel.js)           → Data storage & retrieval (class-based, in-memory)
  ↓
Validators (paymentValidator.js)       → Input validation rules
  ↓
Utils (logger.js,                      → Structured logging (PII masking),
       responseBuilder.js,               standardised responses,
       transactionIdGenerator.js)        sequential ID generation
  ↓
Config (errorCodes.js,                 → Error codes, server settings,
        server-config.json,              payment validation rules,
        payment-config.json)             simulation accounts
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

### Testing

#### Unit & Integration Tests

The project includes **135 automated tests** across server and client:

```bash
# Run server tests 
cd server && npm test

# Run client tests 
cd client && npm test
```

**Server test suites:**

| Suite | Tests | Coverage |
| ----- | ----- | -------- |
| `paymentValidator.test.js` | 28 | All ERR001–ERR004 validation paths, edge cases |
| `responseBuilder.test.js` | 10 | Success/error response structure |
| `transactionIdGenerator.test.js` | 6 | TXN ID format, sequencing, date |
| `transactionModel.test.js` | 5 | Model CRUD: find, save, clearAll |
| `transactionService.test.js` | 7 | Business logic: success, ERR005, ERR006 |
| `payment.test.js` (integration) | 27 | Full HTTP lifecycle through Express |

**Client test suites:**

| Suite | Tests | Coverage |
| ----- | ----- | -------- |
| `PaymentForm.test.jsx` | 23 | Rendering, validation, submission, loading, reset |
| `TransactionResult.test.jsx` | 15 | Success/error display, dismiss |
| `TransactionHistory.test.jsx` | 15 | Table rendering, formatting, empty state |

#### Testing the API with curl

See the [Endpoints](#endpoints) section above for full request/response examples. Quick test:

```bash
# Successful payment
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientReference": "REF-20260315-001",
    "senderAccountNumber": "1234567890",
    "receiverAccountNumber": "0987654321",
    "amount": 150.00,
    "currency": "NAD",
    "reference": "Lunch payment"
  }'

# Health check
curl http://localhost:3001/health
```

