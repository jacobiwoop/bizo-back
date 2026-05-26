import axios from "axios";

import { API_BASE_URL } from "@/src/config/env";
import { useSessionStore } from "@/src/store/session";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useSessionStore.getState().clearSession();
    }

    return Promise.reject(error);
  },
);
