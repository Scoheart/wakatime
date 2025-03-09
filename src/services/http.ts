import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Default configuration
const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

const http = axios.create(DEFAULT_CONFIG);

http.interceptors.request.use((config) => {
  return config;
});

http.interceptors.response.use((response) => {
  return response;
});

const http_get = async (
  url: string,
  config: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return http.get(url, config);
};

export default http;
export { http_get };
