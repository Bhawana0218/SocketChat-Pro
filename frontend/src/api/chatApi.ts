import axios from "axios";
import type { Message } from "@/types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

export const chatApi = {
  getMessages: async (limit = 50, before?: string): Promise<Message[]> => {
    const params: Record<string, string | number> = { limit };
    if (before) params.before = before;
    const response = await api.get("/messages", { params });
    return response.data.data;
  },

  getPrivateMessages: async (
    user1: string,
    user2: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> => {
    const params: Record<string, string | number> = { user1, user2, limit };
    if (before) params.before = before;
    const response = await api.get("/messages/private", { params });
    return response.data.data;
  },

  sendMessage: async (
    username: string,
    message: string
  ): Promise<Message> => {
    const response = await api.post("/messages", { username, message });
    return response.data.data;
  },

  healthCheck: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};
