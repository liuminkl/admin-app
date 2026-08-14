import { SetMetadata } from '@nestjs/common';

export const LOG_KEY = 'operation_log';

export interface OperationLogOptions {
  module: string; // 模块名称，如 用户管理
  action: string; // 操作描述，如 新增用户
}

/**
 * 操作日志装饰器，记录接口调用日志
 * 用法: @OperationLog({ module: '用户管理', action: '新增用户' })
 */
export const OperationLog = (options: OperationLogOptions) =>
  SetMetadata(LOG_KEY, options);
