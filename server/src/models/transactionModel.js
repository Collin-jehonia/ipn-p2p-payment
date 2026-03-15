/**
 * IPN P2P Payment - Transaction Model
 *
 * Handles in-memory storage and retrieval of processed transactions.
 * Provides a data-access layer that separates persistence from business logic.
 */

// In-memory store for processed transactions (simulates a database)
const processedTransactions = new Map();

/**
 * Finds a transaction response by clientReference.
 * @param {string} clientReference
 * @returns {Object|null} The stored response or null if not found
 */
function findByClientReference(clientReference) {
  return processedTransactions.get(clientReference) || null;
}

/**
 * Saves a transaction response keyed by clientReference.
 * @param {string} clientReference
 * @param {Object} response
 */
function save(clientReference, response) {
  processedTransactions.set(clientReference, response);
}

/**
 * Clears all stored transactions. Useful for test isolation.
 */
function clearAll() {
  processedTransactions.clear();
}

module.exports = { findByClientReference, save, clearAll };
