import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  ResetPasswordDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** 用户分页列表 */
  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: any = {};

    if (query.keyword) {
      where.OR = [
        { username: { contains: query.keyword } },
        { nickname: { contains: query.keyword } },
      ];
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [total, list] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
        include: {
          roles: {
            include: { role: { select: { id: true, name: true, code: true } } },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      list: list.map((u) => this.sanitizeUser(u)),
    };
  }

  /** 用户详情 */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return this.sanitizeUser(user);
  }

  /** 新增用户 */
  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException('用户名已存在');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: passwordHash,
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        status: dto.status ?? 1,
      },
    });

    // 关联角色
    if (dto.roleIds && dto.roleIds.length) {
      await this.assignRoles(user.id, dto.roleIds);
    }
    return this.sanitizeUser(user);
  }

  /** 更新用户 */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.prisma.user.update({
      where: { id },
      data: {
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
      },
    });

    if (dto.roleIds) {
      await this.assignRoles(id, dto.roleIds);
    }
    return this.findOne(id);
  }

  /** 删除用户 */
  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.isSuper) {
      throw new ConflictException('超级管理员不可删除');
    }
    await this.prisma.user.delete({ where: { id } });
    return true;
  }

  /** 重置密码 */
  async resetPassword(id: number, dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hash },
    });
    return true;
  }

  /** 为用户分配角色 */
  private async assignRoles(userId: number, roleIds: number[]) {
    await this.prisma.userRole.deleteMany({ where: { userId } });
    const uniqueIds = Array.from(new Set(roleIds));
    if (uniqueIds.length) {
      await this.prisma.userRole.createMany({
        data: uniqueIds.map((roleId) => ({ userId, roleId })),
        skipDuplicates: true,
      });
    }
  }

  /** 脱敏用户信息 */
  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    // 展平 roles
    return {
      ...rest,
      roles: user.roles
        ? user.roles.map((r: any) => r.role ?? r)
        : [],
    };
  }
}
