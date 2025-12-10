import axios from "axios";
import { getAccessToken } from "../utils/tokenHelper";

const base = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Create instance
const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

// Never throw automatically
api.defaults.validateStatus = () => true;

// -----------------------------
// REQUEST → attach access token
// -----------------------------
api.interceptors.request.use((config) => {
  const skip = ["/auth/login", "/auth/register", "/auth/token"];

  if (!skip.some((p) => config.url.includes(p))) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -----------------------------
// RESPONSE → auto-refresh
// -----------------------------
let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  async (response) => {
    // not 401 → return normally
    if (response.status !== 401) return response;

    const url = response.config?.url || "";

    // ⛔ DO NOT refresh for login/refresh itself
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/token")
    ) {
      return response;
    }

    const original = response.config;

    if (original._retry) return response;

    // First 401 → try refresh
    if (!isRefreshing) {
      original._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/auth/token");

        const newToken = res.data?.accessToken;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          processQueue(null, newToken);
          isRefreshing = false;

          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        return response;
      }
    }

    // If refresh ongoing → queue
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject });
    })
      .then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      })
      .catch(() => response);
  }
);

export default api;
