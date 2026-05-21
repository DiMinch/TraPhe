import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    // For blob responses, return the full response data as-is
    if (response.config.responseType === "blob") {
      return response.data;
    }
    const data = response.data;
    // Backend returns { success, message, data, meta, error }
    // Frontend expects { statusCode, success, message, data, ... }
    // Map HTTP status code into the response so existing code using res.statusCode works
    if (data && typeof data === "object" && !("statusCode" in data)) {
      data.statusCode = response.status;
    }
    return data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    // Only redirect on 401 (unauthorized/expired token)
    // 403 (forbidden) means user is authenticated but lacks permission
    // We should not redirect on 403, just let the calling code handle it
    if (status === 401) {
      localStorage.clear();
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
