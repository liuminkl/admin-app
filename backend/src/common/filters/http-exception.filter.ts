import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 全局异常过滤器：统一错误响应格式 { code, message, data }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        // ValidationPipe 的错误信息在 message 数组中
        if (Array.isArray(obj.message)) {
          message = obj.message.join('; ');
        } else {
          message = obj.message || exception.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // 打印未预期的错误堆栈
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        console.error('Unhandled error:', exception);
      }
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
