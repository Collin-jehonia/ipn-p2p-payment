import { useState } from "react";
import PaymentForm from "./components/PaymentForm";
import TransactionResult from "./components/TransactionResult";
import TransactionHistory from "./components/TransactionHistory";
import { submitPayment } from "./services/paymentService";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function handleSubmit(payload) {
    setIsLoading(true);
    setResult(null);

    try {
      const data = await submitPayment(payload);
      const resultWithRef = { ...data, clientReference: payload.clientReference };
      setResult(resultWithRef);
      addToHistory(payload, data);
    } catch (error) {
      if (error.response && error.response.data) {
        const resultWithRef = { ...error.response.data, clientReference: payload.clientReference };
        setResult(resultWithRef);
        addToHistory(payload, error.response.data);
      } else {
        const networkError = {
          status: "FAILED",
          errorCode: "NETWORK_ERROR",
          transactionId: null,
          message: "Unable to reach the payment server. Please check your connection.",
          clientReference: payload.clientReference,
        };
        setResult(networkError);
        addToHistory(payload, networkError);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function addToHistory(payload, response) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      clientReference: payload.clientReference,
      reference: payload.reference,
      amount: payload.amount,
      status: response.status,
      transactionId: response.transactionId,
      errorCode: response.errorCode,
    };
    setHistory((prev) => [entry, ...prev]);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>IPN P2P Payment</h1>
        <p className="subtitle">Instant Payments Namibia — Person-to-Person Transfer</p>
      </header>

      <main className="app-main">
        <div className="main-content">
          <PaymentForm onSubmit={handleSubmit} isLoading={isLoading} />
          <TransactionResult result={result} onDismiss={() => setResult(null)} />
        </div>
        <TransactionHistory transactions={history} />
      </main>

      <footer className="app-footer">
        <p>IPN Developer Integration Challenge — Mock P2P Payment Application</p>
      </footer>
    </div>
  );
}

export default App;
