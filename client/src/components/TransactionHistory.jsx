/**
 * TransactionHistory Component
 *
 * Displays a list of past payment attempts within the current session.
 * Provides visibility into all transactions submitted.
 */
function TransactionHistory({ transactions }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Client Reference</th>
              <th>Payment Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transaction ID / Error</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} className={tx.status === "SUCCESS" ? "row-success" : "row-error"}>
                <td>{tx.timestamp}</td>
                <td><code>{tx.clientReference}</code></td>
                <td>{tx.reference}</td>
                <td>NAD {tx.amount.toFixed(2)}</td>
                <td>
                  <span
                    className={`status-badge-sm ${
                      tx.status === "SUCCESS" ? "badge-success" : "badge-error"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td>
                  <code>{tx.transactionId || tx.errorCode || "—"}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionHistory;
