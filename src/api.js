import axios from "axios";

const API_URL = "http://localhost:8000";

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const register = async (email, password, is_premium) => {
  const response = await axios.post(`${API_URL}/register`, { email, password, is_premium });
  return response.data;
};

export const logout = async (token) => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const sendMessage = async (token, message) => {
  const response = await axios.post(
    `${API_URL}/chat`,
    { message },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getChatHistory = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/history`, {
        params: { user_id: userId }, // Pass user_id as a query parameter
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Extract the "chats" array from the response
      const chatHistory = Array.isArray(response.data.chats) ? response.data.chats : [];
      return chatHistory;
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      throw err;
    }
  };