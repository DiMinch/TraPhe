import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    // Only attach token if both exist (prevents stale token issues on public pages)
    if (token && user) {
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
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // If it's a 401 and we haven't already retried this request
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // If the request is itself the refresh token endpoint, do not attempt to refresh
      if (originalRequest.url && originalRequest.url.includes("/auth/refresh")) {
        localStorage.clear();
        sessionStorage.clear();
        const pathname = window.location.pathname;
        const isPrivateRoute =
          pathname.startsWith("/admin") ||
          pathname.startsWith("/pos") ||
          pathname.startsWith("/account");
        if (isPrivateRoute) {
          window.location.href = "/sign-in";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          // Use base axios here to bypass this client's interceptors
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const resData = response.data;

          if (resData && resData.success && resData.data) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = resData.data;
            const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;

            storage.setItem("accessToken", newAccessToken);
            storage.setItem("refreshToken", newRefreshToken);
            storage.setItem("user", JSON.stringify(user));

            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            isRefreshing = false;

            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          localStorage.clear();
          sessionStorage.clear();
          const pathname = window.location.pathname;
          const isPrivateRoute =
            pathname.startsWith("/admin") ||
            pathname.startsWith("/pos") ||
            pathname.startsWith("/account");
          if (isPrivateRoute) {
            window.location.href = "/sign-in";
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.clear();
        sessionStorage.clear();
        const pathname = window.location.pathname;
        const isPrivateRoute =
          pathname.startsWith("/admin") ||
          pathname.startsWith("/pos") ||
          pathname.startsWith("/account");
        if (isPrivateRoute) {
          window.location.href = "/sign-in";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
