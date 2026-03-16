// IPN P2P Payment - Transaction Model
// Class-based data-access layer that handles in-memory storage
// and retrieval of processed transactions.

const { logInfo, logWarning } = require("../utils/logger");

class TransactionModel {
  constructor() {
    this.processedTransactions = new Map();
  }

  // Finds a transaction response by clientReference
  findByClientReference(clientReference) {
    const result = this.processedTransactions.get(clientReference) || null;
    if (result) {
      logInfo("Transaction found in store");
    }
    return result;
  }

  // Saves a transaction response keyed by clientReference
  save(clientReference, response) {
    this.processedTransactions.set(clientReference, response);
    logInfo(`Transaction saved to store | status=${response.status}`);
  }

  // Clears all stored transactions (used for test isolation)
  clearAll() {
    logWarning("Clearing all stored transactions");
    this.processedTransactions.clear();
  }
}

const transactionModel = new TransactionModel();
module.exports = transactionModel;
