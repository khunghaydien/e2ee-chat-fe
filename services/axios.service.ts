import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { TokenStorage } from "@/libs/ultils/tokenStorage";
import { authService, AuthTokens } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3030/api";

const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    ...config,
  });

  return instance;
};

// Client cho các API public, không cần auth
export const publicAxiosService = createAxiosInstance();

// Client cho các API cần auth (Bearer token)
export const authAxiosService: AxiosInstance = (() => {
  const instance = createAxiosInstance();

  instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      request.headers = request.headers ?? {};
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const originalRequest: InternalAxiosRequestConfig & {
        _retry?: boolean;
      } = error.config;

      if (status === 401 && !originalRequest._retry) {
        const refreshToken = TokenStorage.getRefreshToken();

        if (!refreshToken) {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Gọi hàm refresh trong auth.service
          const refreshed: AuthTokens = await authService.refreshToken();
          const newAccessToken = refreshed.access_token;

          instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry đúng 1 lần với token mới
          return instance(originalRequest);
        } catch (refreshError) {
          TokenStorage.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
})();

