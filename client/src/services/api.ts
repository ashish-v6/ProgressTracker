import axios from 'axios';

// Access token stored in-memory for security (XSS prevention)
let accessToken: string | null = null;

let refreshFailureListener: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const registerRefreshFailureListener = (listener: () => void) => {
  refreshFailureListener = listener;
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Crucial to send HttpOnly cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach the Access JWT Token to the authorization header
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically refresh access token on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 Unauthorized and request has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Request a new access token using the HttpOnly refresh cookie
        // Use a direct axios call to bypass global interceptors and custom headers
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (response.data && response.data.success) {
          const newAccessToken = response.data.data.accessToken;
          setAccessToken(newAccessToken);

          // Update header and retry the original failed query
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear token and trigger context logout listener
        setAccessToken(null);
        if (refreshFailureListener) {
          refreshFailureListener();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { api };
