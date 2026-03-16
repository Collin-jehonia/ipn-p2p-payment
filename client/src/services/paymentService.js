import axios from "axios";

const API_BASE_URL = "/api";
const instance = axios.create({ baseURL: API_BASE_URL });

/**
 * IPN P2P Payment - Payment API Service
 *
 * Class-based API client that encapsulates all payment-related
 * HTTP requests. Uses a pre-configured Axios instance for
 * consistent base URL and request configuration.
 */
class PaymentAPI {
  constructor() {}

  /**
   * Submits a P2P payment request to the Mock API.
   * @param {Object} paymentData - The payment request payload
   * @returns {Promise<Object>} - The API response data
   */
  async submitPayment(paymentData) {
    const response = await instance.post("/p2p-payment", paymentData);
    return response.data;
  }

  /**
   * Checks the health status of the payment server.
   * @returns {Promise<Object>} - The health check response
   */
  async healthCheck() {
    const response = await axios.get("/health");
    return response.data;
  }
}

const paymentAPI = new PaymentAPI();
export default paymentAPI;
