import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const now = Date.now();
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest<RequestWithUser>();
      const response = httpContext.getResponse<Response>();
      const { method, url, headers, body, ip, user } = request;

      // Log request
      this.logger.log({
        message: 'Incoming Request',
        method,
        url,
        ip,
        userAgent: headers['user-agent'],
        userId: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        requestId: headers['x-request-id'] || 'no-id',
        body: this.sanitizeBody(body, method),
      });

      return next
        .handle()
        .pipe(
          tap(() => {
            const duration = Date.now() - now;
            this.logger.log({
              message: 'Request Completed',
              method,
              url,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
              userId: user?.id || 'anonymous',
              timestamp: new Date().toISOString(),
            });
          }),
          catchError((error) => {
            const duration = Date.now() - now;
            this.logger.error({
              message: 'Request Failed',
              method,
              url,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
              error: error.message,
              stack: error.stack,
              userId: user?.id || 'anonymous',
              timestamp: new Date().toISOString(),
            });
            throw error;
          }),
        );
    }

    return next.handle();
  }

  private sanitizeBody(body: any, method: string): any {
    if (!body || method === 'GET') return undefined;
    
    // Remove sensitive data
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.refreshToken) sanitized.refreshToken = '[REDACTED]';
    if (sanitized.currentPassword) sanitized.currentPassword = '[REDACTED]';
    if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
    
    return sanitized;
  }
}