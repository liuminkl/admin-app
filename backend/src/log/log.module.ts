import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { OperationLogInterceptor } from './operation-log.interceptor';

@Module({
  controllers: [LogController],
  providers: [
    LogService,
    // 全局注册操作日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
  ],
  exports: [LogService],
})
export class LogModule {}
