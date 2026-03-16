# How To Use — IPN P2P Payment Application

## Using the Web Interface

### 1. Start the Application

**Option A — Local (Node.js)**

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

**Option B — Docker**

```bash
docker-compose up --build
```

Open your browser at `http://localhost:8080`.

### 2. Make a Payment

Fill in the payment form:

| Field | Example | Rules |
|---|---|---|
| Sender Account Number | `1234567890` | Numeric, at least 10 digits |
| Receiver Account Number | `0987654321` | Numeric, at least 10 digits |
| Amount | `150.00` | Must be greater than 0 |
| Currency | `NAD` | Dropdown — only NAD accepted by server |
| Payment Reference | `Rent payment March` | Max 50 characters |

Click **Submit Payment** — the button shows a loading spinner while processing.

### 3. View the Result

A result card appears showing:
- **SUCCESS** (green) — with transaction ID and amount in N$
- **FAILED** (red) — with error code and message

### 4. Transaction History

All payments from the current session are logged in the history table at the bottom of the page.

---

## Test Scenarios

### Successful Payment
Use any valid account numbers (e.g. `1234567890` and `0987654321`).

### Insufficient Funds (ERR005)
Use sender account `1111111111` — simulates a balance check failure.

### Internal Server Error (ERR006)
Use sender account `9999999999` — simulates an infrastructure failure.

### Invalid Currency (ERR003)
Select any currency other than NAD from the dropdown (e.g. USD, ZAR) — server rejects it.

### Validation Errors
- Leave any field empty — **ERR001** (Missing required field)
- Use an account number with fewer than 10 digits — **ERR002** (Invalid account number)
- Use a reference longer than 50 characters — **ERR001** (Reference exceeds max length)

### Network Error
Stop the server and submit a payment — displays "Unable to reach the payment server".

---

## Using the API Directly (curl / Postman)

### Successful Payment

```bash
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
```

### Insufficient Funds

```bash
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientReference": "REF-20260315-002",
    "senderAccountNumber": "1111111111",
    "receiverAccountNumber": "0987654321",
    "amount": 500.00,
    "currency": "NAD",
    "reference": "Insufficient funds test"
  }'
```

### Internal Error

```bash
curl -X POST http://localhost:3001/api/p2p-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientReference": "REF-20260315-003",
    "senderAccountNumber": "9999999999",
    "receiverAccountNumber": "0987654321",
    "amount": 200.00,
    "currency": "NAD",
    "reference": "Internal error test"
  }'
```

### Health Check

```bash
curl http://localhost:3001/health
```

### Undefined Route (404)

```bash
curl http://localhost:3001/random
```

---

## Error Code Reference

| Code | HTTP Status | Description | Trigger |
|---|---|---|---|
| ERR001 | 400 | Missing required field | Any field is missing, null, or empty |
| ERR002 | 400 | Invalid account number | Non-numeric or fewer than 10 digits |
| ERR003 | 400 | Invalid currency | Currency is not `"NAD"` |
| ERR004 | 400 | Invalid amount | Zero, negative, NaN, or non-number |
| ERR005 | 402 | Insufficient funds | Sender account `1111111111` |
| ERR006 | 500 | Internal processing error | Sender account `9999999999` or unhandled error |
