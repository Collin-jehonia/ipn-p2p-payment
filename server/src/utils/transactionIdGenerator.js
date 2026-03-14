/**
 * IPN P2P Payment - Transaction ID Generator
 *
 * Generates sequential transaction IDs in the format TXN + YYYYMMDD + sequential number.
 * Example: "TXN202603060001"
 */

let transactionCounter = 0;

/**
 * Generates the next sequential transaction ID.
 * @returns {string} Transaction ID in format TXNYYYYMMDDnnnn
 */
function generateTransactionId() {
  transactionCounter++;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(transactionCounter).padStart(4, "0");
  return `TXN${year}${month}${day}${seq}`;
}

module.exports = { generateTransactionId };
