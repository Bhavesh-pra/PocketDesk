import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_BASE_URL = `${rawApiUrl.replace(/\/+$/, "")}/api`;

const getRequestUrl = (baseURL?: string, url?: string) => {
  if (!url) {
    return baseURL || "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!baseURL) {
    return url;
  }

  return new URL(url.replace(/^\//, ""), `${baseURL.replace(/\/+$/, "")}/`).toString();
};

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

API.interceptors.request.use((req) => {
  const requestUrl = getRequestUrl(req.baseURL, req.url);

  console.log("[API] Request", {
    method: req.method?.toUpperCase() || "GET",
    url: requestUrl,
    hasAuth: Boolean(accessToken)
  });

  if (accessToken) {
    req.headers.Authorization = `Bearer ${accessToken}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => {
    console.log("[API] Response", {
      method: res.config.method?.toUpperCase() || "GET",
      url: getRequestUrl(res.config.baseURL, res.config.url),
      status: res.status
    });
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log("[API] Error", {
      method: originalRequest?.method?.toUpperCase() || "GET",
      url: getRequestUrl(originalRequest?.baseURL, originalRequest?.url),
      status: error.response?.status || null,
      data: error.response?.data || null
    });

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/signup") &&
      !originalRequest.responseType
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);
      } catch {
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
