// src/api/modules/auth.ts
import { request } from '../client';
import { LoginRequest, LoginResponse, User } from '../../types';

export const authApi = {
  // 登录接口，直接使用业务类型
  login: (data: LoginRequest) => {
    return request.post<LoginResponse>('/auth/login', data);
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return request.get<User>('/auth/me');
  },
  
  // 登出接口
  logout: () => {
    return request.post<{ success: boolean }>('/auth/logout');
  }
};
