import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 10000
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // Attempt token refresh
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken
          });

          setToken(response.data.token);
          setRefreshToken(response.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

// Auth endpoints
export const auth = {
  register: (email, password, name) =>
    apiClient.post('/api/auth/register', { email, password, name }),
  
  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),
  
  verify: () =>
    apiClient.post('/api/auth/verify')
};

// Upload endpoints
export const uploads = {
  uploadFiles: (projectId, files) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    files.forEach((file) => {
      formData.append('files', file);
    });

    return apiClient.post('/api/upload/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    });
  },

  getProjectFiles: (projectId) =>
    apiClient.get(`/api/upload/project/${projectId}`),

  deleteFile: (fileId) =>
    apiClient.delete(`/api/upload/file/${fileId}`)
};

export default apiClient;
