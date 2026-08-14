import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'secret'),
    });
  }

  /**
   * JWT 校验通过后，加载用户完整信息（含角色、权限）
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.status === 0) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 加载角色与权限
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });
    const roles = userRoles.map((ur) => ur.role.code);
    const roleIds = userRoles.map((ur) => ur.roleId);

    let permissions: string[] = [];
    if (user.isSuper) {
      // 超级管理员拥有所有菜单权限
      const allMenus = await this.prisma.menu.findMany({
        where: { perms: { not: null } },
      });
      permissions = allMenus
        .map((m) => m.perms)
        .filter((p): p is string => !!p);
    } else {
      const roleMenus = await this.prisma.roleMenu.findMany({
        where: { roleId: { in: roleIds } },
        include: { menu: true },
      });
      permissions = roleMenus
        .map((rm) => rm.menu.perms)
        .filter((p): p is string => !!p);
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      isSuper: user.isSuper,
      roles,
      permissions: Array.from(new Set(permissions)),
    };
  }
}
