import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true // IMPORTANT for cookies
});

// ==========================
// TOKEN STORAGE (IN MEMORY)
// ==========================
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

// ==========================
// REQUEST INTERCEPTOR
// ==========================
API.interceptors.request.use((req) => {
  if (accessToken) {
    req.headers.Authorization = `Bearer ${accessToken}`;
  }
  return req;
});

// ==========================
// RESPONSE INTERCEPTOR
// ==========================
API.interceptors.response.use(
  (res) => res,

  async (error) => {

    const originalRequest = error.config;

    // Prevent infinite loop
    if (
  error.response?.status === 401 &&
  !originalRequest._retry &&
  !originalRequest.url.includes("/auth/refresh") &&
  !originalRequest.url.includes("/auth/login") &&
  !originalRequest.url.includes("/auth/signup")
) {

      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;

        // Save new token
        setAccessToken(newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);

      } catch (refreshError) {

        // Refresh failed → logout
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default API;