/**
 * TransactionResult Component
 *
 * Displays the API response after a payment submission.
 * Shows success or failure status with relevant details.
 */
function TransactionResult({ result, onDismiss }) {
  if (!result) return null;

  const isSuccess = result.status === "SUCCESS";

  return (
    <div className={`transaction-result ${isSuccess ? "success" : "error"}`}>
      <div className="result-header">
        <span className={`status-badge ${isSuccess ? "badge-success" : "badge-error"}`}>
          {result.status}
        </span>
        {onDismiss && (
          <button className="btn-dismiss" onClick={onDismiss} aria-label="Dismiss">
            &times;
          </button>
        )}
      </div>

      <div className="result-body">
        <p className="result-message">{result.message}</p>

        {result.amount != null && (
          <div className="result-detail">
            <span className="detail-label">Amount</span>
            <code className="detail-value">N$ {Number(result.amount).toFixed(2)}</code>
          </div>
        )}

        {result.clientReference && (
          <div className="result-detail">
            <span className="detail-label">Client Reference</span>
            <code className="detail-value">{result.clientReference}</code>
          </div>
        )}

        {isSuccess ? (
          <div className="result-detail">
            <span className="detail-label">Transaction ID</span>
            <code className="detail-value">{result.transactionId}</code>
          </div>
        ) : (
          result.errorCode && (
            <div className="result-detail">
              <span className="detail-label">Error Code</span>
              <code className="detail-value">{result.errorCode}</code>
            </div>
          )
        )}

        <div className="result-detail">
          <span className="detail-label">Status</span>
          <code className="detail-value">{result.status}</code>
        </div>
      </div>
    </div>
  );
}

export default TransactionResult;
