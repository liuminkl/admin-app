import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
} from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  /** 角色分页列表 */
  async findAll(query: QueryRoleDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: any = {};

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { code: { contains: query.keyword } },
      ];
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [total, list] = await Promise.all([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
    ]);

    return { total, page, pageSize, list };
  }

  /** 全部角色（下拉选择用） */
  async findAllOptions() {
    return this.prisma.role.findMany({
      where: { status: 1 },
      orderBy: { sort: 'asc' },
      select: { id: true, name: true, code: true },
    });
  }

  /** 角色详情（含菜单ID） */
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { menus: { select: { menuId: true } } },
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return {
      ...role,
      menuIds: role.menus.map((m) => m.menuId),
    };
  }

  /** 新增角色 */
  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findFirst({
      where: { OR: [{ name: dto.name }, { code: dto.code }] },
    });
    if (exists) {
      throw new ConflictException('角色名称或标识已存在');
    }
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status ?? 1,
        sort: dto.sort ?? 0,
      },
    });
    if (dto.menuIds && dto.menuIds.length) {
      await this.assignMenus(role.id, dto.menuIds);
    }
    return role;
  }

  /** 更新角色 */
  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    if (dto.code === 'admin') {
      throw new ConflictException('内置管理员角色不可修改');
    }
    await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status,
        sort: dto.sort,
      },
    });
    if (dto.menuIds) {
      await this.assignMenus(id, dto.menuIds);
    }
    return this.findOne(id);
  }

  /** 删除角色 */
  async remove(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    if (role.code === 'admin') {
      throw new ConflictException('内置管理员角色不可删除');
    }
    await this.prisma.role.delete({ where: { id } });
    return true;
  }

  /** 分配菜单权限 */
  async assignMenus(roleId: number, menuIds: number[]) {
    await this.prisma.roleMenu.deleteMany({ where: { roleId } });
    const uniqueIds = Array.from(new Set(menuIds));
    if (uniqueIds.length) {
      await this.prisma.roleMenu.createMany({
        data: uniqueIds.map((menuId) => ({ roleId, menuId })),
        skipDuplicates: true,
      });
    }
    return true;
  }
}
