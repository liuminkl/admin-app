import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LOG_KEY } from '../common/decorators/operation-log.decorator';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 操作日志拦截器：自动记录带 @OperationLog() 装饰器的接口调用
 */
@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const options = this.reflector.get(LOG_KEY, context.getHandler());

    // 无日志装饰器则不记录
    if (!options) {
      return next.handle();
    }

    const startTime = Date.now();
    const user = (request as any).user;
    const params = this.sanitizeParams(request.body ?? {});

    return next.handle().pipe(
      tap({
        next: () => {
          this.record(request, response, options, user, params, startTime, 0);
        },
        error: (err) => {
          this.record(request, response, options, user, params, startTime, 1, err?.message);
        },
      }),
    );
  }

  private record(
    request: Request,
    response: Response,
    options: any,
    user: any,
    params: string,
    startTime: number,
    status: number,
    errorMsg?: string,
  ) {
    const costTime = Date.now() - startTime;
    // 登录等公开接口 user 为空时，尝试从请求体提取用户名
    const fallbackUsername = (request.body as any)?.username;
    this.prisma.operationLog
      .create({
        data: {
          userId: user?.id,
          username: user?.username ?? fallbackUsername,
          module: options.module,
          action: options.action,
          method: request.method,
          url: request.originalUrl,
          params,
          ip: this.getClientIp(request),
          status,
          costTime,
          errorMsg,
        },
      })
      .catch((e) => console.error('写入操作日志失败:', e.message));
  }

  private getClientIp(request: Request): string {
    const xff = request.headers['x-forwarded-for'];
    if (Array.isArray(xff)) return xff[0];
    if (xff) return xff.split(',')[0].trim();
    return request.socket?.remoteAddress ?? '';
  }

  private sanitizeParams(body: any): string {
    try {
      const safe = { ...body };
      if (safe.password) safe.password = '***';
      if (safe.oldPassword) safe.oldPassword = '***';
      if (safe.newPassword) safe.newPassword = '***';
      return JSON.stringify(safe).slice(0, 2000);
    } catch {
      return '{}';
    }
  }
}
