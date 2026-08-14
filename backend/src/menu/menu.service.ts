import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  /** 菜单树 */
  async getTree() {
    const menus = await this.prisma.menu.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    return this.buildTree(menus);
  }

  /** 菜单列表（扁平） */
  async findAll() {
    return this.prisma.menu.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  /** 菜单详情 */
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  /** 新增菜单 */
  async create(dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        parentId: dto.parentId ?? 0,
        name: dto.name,
        path: dto.path,
        component: dto.component,
        type: dto.type ?? 2,
        icon: dto.icon,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
        perms: dto.perms,
        visible: dto.visible ?? 1,
      },
    });
  }

  /** 更新菜单 */
  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return this.prisma.menu.update({
      where: { id },
      data: {
        parentId: dto.parentId,
        name: dto.name,
        path: dto.path,
        component: dto.component,
        type: dto.type,
        icon: dto.icon,
        sort: dto.sort,
        status: dto.status,
        perms: dto.perms,
        visible: dto.visible,
      },
    });
  }

  /** 删除菜单 */
  async remove(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    // 检查是否存在子菜单
    const children = await this.prisma.menu.findMany({
      where: { parentId: id },
    });
    if (children.length) {
      throw new NotFoundException('存在子菜单，无法删除');
    }
    // 删除角色关联
    await this.prisma.roleMenu.deleteMany({ where: { menuId: id } });
    await this.prisma.menu.delete({ where: { id } });
    return true;
  }

  /** 构建菜单树 */
  private buildTree(menus: any[], parentId = 0): any[] {
    const tree: any[] = [];
    for (const menu of menus) {
      if (menu.parentId === parentId) {
        const children = this.buildTree(menus, menu.id);
        tree.push({
          ...menu,
          children: children.length ? children : undefined,
        });
      }
    }
    return tree;
  }
}
