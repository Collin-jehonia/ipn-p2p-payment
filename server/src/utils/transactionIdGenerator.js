// IPN P2P Payment - Transaction ID Generator
// Generates sequential transaction IDs in format TXNYYYYMMDDnnnn

const { logInfo } = require("./logger");

let transactionCounter = 0;

// Generates the next sequential transaction ID
function generateTransactionId() {
  transactionCounter++;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(transactionCounter).padStart(4, "0");
  const transactionId = `TXN${year}${month}${day}${seq}`;
  logInfo(`Generating transaction ID | txnId=${transactionId}`);
  return transactionId;
}

module.exports = { generateTransactionId };
