import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  /** 登录 */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status === 0) {
      throw new UnauthorizedException('该账号已被禁用');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 签发 token
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '7d');

    // 记录 token 到 Redis（登出失效用）
    await this.redis.set(
      `token:${user.id}`,
      accessToken,
      7 * 24 * 60 * 60,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  /** 登出 */
  async logout(userId: number) {
    await this.redis.del(`token:${userId}`);
    return true;
  }

  /** 获取当前用户完整信息（含角色、权限、菜单） */
  async getProfile(user: any) {
    const { permissions, roles } = user;
    // 获取菜单树（超级管理员拿全部，否则按角色）
    const menuTree = await this.getUserMenus(user.id, user.isSuper, roles);

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      isSuper: user.isSuper,
      roles,
      permissions,
      menus: menuTree,
    };
  }

  /** 查询用户菜单树 */
  private async getUserMenus(userId: number, isSuper: boolean, roles: string[]) {
    let menus;
    if (isSuper) {
      menus = await this.prisma.menu.findMany({
        where: { type: { in: [1, 2] } },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      });
    } else {
      const roleRecords = await this.prisma.role.findMany({
        where: { code: { in: roles } },
        include: {
          menus: {
            include: { menu: true },
          },
        },
      });
      const menuMap = new Map<number, any>();
      roleRecords.forEach((r) =>
        r.menus.forEach((rm) => {
          if (rm.menu.type === 1 || rm.menu.type === 2) {
            menuMap.set(rm.menu.id, rm.menu);
          }
        }),
      );
      menus = Array.from(menuMap.values()).sort(
        (a, b) => a.sort - b.sort || a.id - b.id,
      );
    }
    return this.buildTree(menus);
  }

  /** 构建菜单树 */
  private buildTree(menus: any[], parentId = 0): any[] {
    const tree: any[] = [];
    for (const menu of menus) {
      if (menu.parentId === parentId) {
        const children = this.buildTree(menus, menu.id);
        tree.push({
          id: menu.id,
          name: menu.name,
          path: menu.path,
          component: menu.component,
          type: menu.type,
          icon: menu.icon,
          perms: menu.perms,
          visible: menu.visible,
          children: children.length ? children : undefined,
        });
      }
    }
    return tree;
  }

  /** 修改密码 */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('原密码错误');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return true;
  }
}
