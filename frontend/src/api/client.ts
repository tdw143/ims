// src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiResult } from './types';

// 创建axios实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加token等逻辑
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 可以在这里统一处理成功响应
    if (response.data.code !== 200) {
      // 后端返回success为false时，也视为错误
      return Promise.reject(new Error(response.data.message || '操作失败'));
    }
    return response;
  },
  (error) => {
    // 统一处理错误
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 封装通用请求方法，自动处理类型
export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig): ApiResult<T> => {
    return apiClient.get<ApiResponse<T>>(url, config);
  },
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): ApiResult<T> => {
    return apiClient.post<ApiResponse<T>>(url, data, config);
  },
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): ApiResult<T> => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig): ApiResult<T> => {
    return apiClient.delete<ApiResponse<T>>(url, config);
  },
};
