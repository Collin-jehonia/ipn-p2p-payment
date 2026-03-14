import axios from "axios";

const API_BASE_URL = "/api";

/**
 * Submits a P2P payment request to the Mock API.
 * @param {Object} paymentData - The payment request payload
 * @returns {Promise<Object>} - The API response data
 */
export async function submitPayment(paymentData) {
  const response = await axios.post(`${API_BASE_URL}/p2p-payment`, paymentData);
  return response.data;
}
