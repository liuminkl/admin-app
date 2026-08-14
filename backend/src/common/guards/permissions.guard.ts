import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

/**
 * 权限守卫：校验当前用户是否拥有 @RequirePermission 指定的权限
 * 超级管理员拥有所有权限
 */
@Injectable()
export class PermissionsGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;
    if (!user) {
      throw new ForbiddenException('无访问权限');
    }
    // 超级管理员放行
    if (user.isSuper) {
      return true;
    }
    const userPermissions = user.permissions ?? [];
    const hasPerm = requiredPermissions.some((p) =>
      userPermissions.includes(p),
    );
    if (!hasPerm) {
      throw new ForbiddenException(`无权限: ${requiredPermissions.join(', ')}`);
    }
    return true;
  }
}
