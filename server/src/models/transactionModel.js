/**
 * IPN P2P Payment - Transaction Model
 *
 * Class-based data-access layer that handles in-memory storage
 * and retrieval of processed transactions. Separates persistence
 * concerns from business logic.
 */

class TransactionModel {
  constructor() {
    // In-memory store for processed transactions (simulates a database)
    this.processedTransactions = new Map();
  }

  /**
   * Finds a transaction response by clientReference.
   * @param {string} clientReference
   * @returns {Object|null} The stored response or null if not found
   */
  findByClientReference(clientReference) {
    return this.processedTransactions.get(clientReference) || null;
  }

  /**
   * Saves a transaction response keyed by clientReference.
   * @param {string} clientReference
   * @param {Object} response
   */
  save(clientReference, response) {
    this.processedTransactions.set(clientReference, response);
  }

  /**
   * Clears all stored transactions. Useful for test isolation.
   */
  clearAll() {
    this.processedTransactions.clear();
  }
}

// Singleton instance shared across the application
const transactionModel = new TransactionModel();
module.exports = transactionModel;
