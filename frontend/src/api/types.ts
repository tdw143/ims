// src/api/types.ts
import { AxiosPromise } from "axios";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  code: number;
  timestamp: string;
}

// 通用API返回类型，自动包装ApiResponse
export type ApiResult<T> = AxiosPromise<ApiResponse<T>>;
