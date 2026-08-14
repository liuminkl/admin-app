import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  id: number;
  username: string;
  isSuper: boolean;
  roles: string[];
  permissions: string[];
}

/**
 * 获取当前登录用户信息
 * 用法: @CurrentUser() user: CurrentUser
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUser = request.user;
    return data ? user?.[data] : user;
  },
);
