// src/common/interceptors/logging.interceptor.ts
import { 
  Injectable, 
  NestInterceptor, 
  ExecutionContext, 
  CallHandler 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemLogsService } from '../../modules/system-logs/system-logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const user = request.user;
    
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          
          // 记录成功日志
          this.systemLogsService.createLog({
            level: 'info',
            module: this.getModuleFromUrl(url),
            action: `${method} ${url}`,
            message: `Request completed in ${responseTime}ms`,
            userId: user?.sub,
            userAgent: headers['user-agent'],
            ipAddress: this.getClientIp(request),
            requestData: this.sanitizeData(body),
            responseData: this.sanitizeData(data),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          
          // 记录错误日志
          this.systemLogsService.createLog({
            level: 'error',
            module: this.getModuleFromUrl(url),
            action: `${method} ${url}`,
            message: `Request failed: ${error.message}`,
            userId: user?.sub,
            userAgent: headers['user-agent'],
            ipAddress: this.getClientIp(request),
            requestData: this.sanitizeData(body),
            errorStack: error.stack,
          });
        },
      })
    );
  }

  private getModuleFromUrl(url: string): string {
    if (url.includes('/auth/')) return 'auth';
    if (url.includes('/departments/')) return 'departments';
    if (url.includes('/employees/')) return 'employees';
    if (url.includes('/purchase/')) return 'purchase';
    if (url.includes('/sales/')) return 'sales';
    if (url.includes('/warehouse/')) return 'warehouse';
    if (url.includes('/reports/')) return 'reports';
    if (url.includes('/rbac/')) return 'rbac';
    if (url.includes('/system-logs/')) return 'system-logs';
    return 'system';
  }

  private getClientIp(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for'] || 
           'unknown';
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // 移除敏感信息
    const sanitized = { ...data };
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.token) sanitized.token = '***';
    if (sanitized.access_token) sanitized.access_token = '***';
    if (sanitized.refresh_token) sanitized.refresh_token = '***';
    
    return sanitized;
  }
}