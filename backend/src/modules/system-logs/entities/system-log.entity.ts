// src/modules/system-logs/entities/system-log.entity.ts
export class SystemLog {
  id: string;
  level: string;
  module: string;
  action: string;
  message: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  requestData?: any;
  responseData?: any;
  errorStack?: string;
  createdAt: Date;
}