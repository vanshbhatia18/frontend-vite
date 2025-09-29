import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error.response?.data);
    const originalRequest = error.config;

    // if not 401 or already retried → reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Only refresh if it's due to invalid/expired access token
    if (
      error.response.status === 401 &&
      error.response.data?.message === "Invalid Access Token"
    ) {
      if (isRefreshing) {
        // wait for refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh the token
        await api.post("/users/refresh-token", {});

        processQueue(null); // resolve queued requests
        return api(originalRequest); // retry original
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Session expired. Please log in again.");
        // e.g. logout user → window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
