import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化种子数据...');

  // 1. 创建管理员角色
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      name: '超级管理员',
      code: 'admin',
      description: '拥有全部权限',
      status: 1,
      sort: 0,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: {
      name: '普通用户',
      code: 'user',
      description: '基础权限',
      status: 1,
      sort: 1,
    },
  });

  console.log('角色创建完成:', adminRole.code, userRole.code);

  // 2. 创建菜单树
  const menuTree = [
    { name: '仪表盘', path: '/dashboard', component: 'dashboard/index', type: 2, icon: 'Odometer', sort: 1, perms: null },
    { name: '系统管理', path: '/system', component: null, type: 1, icon: 'Setting', sort: 2, perms: null, children: [
      { name: '用户管理', path: '/system/user', component: 'system/user/index', type: 2, icon: 'User', sort: 1, perms: 'system:user:list', children: [
        { name: '用户查询', path: null, component: null, type: 3, icon: null, sort: 1, perms: 'system:user:list' },
        { name: '用户新增', path: null, component: null, type: 3, icon: null, sort: 2, perms: 'system:user:add' },
        { name: '用户编辑', path: null, component: null, type: 3, icon: null, sort: 3, perms: 'system:user:edit' },
        { name: '用户删除', path: null, component: null, type: 3, icon: null, sort: 4, perms: 'system:user:delete' },
      ]},
      { name: '角色管理', path: '/system/role', component: 'system/role/index', type: 2, icon: 'Avatar', sort: 2, perms: 'system:role:list', children: [
        { name: '角色查询', path: null, component: null, type: 3, icon: null, sort: 1, perms: 'system:role:list' },
        { name: '角色新增', path: null, component: null, type: 3, icon: null, sort: 2, perms: 'system:role:add' },
        { name: '角色编辑', path: null, component: null, type: 3, icon: null, sort: 3, perms: 'system:role:edit' },
        { name: '角色删除', path: null, component: null, type: 3, icon: null, sort: 4, perms: 'system:role:delete' },
      ]},
      { name: '菜单管理', path: '/system/menu', component: 'system/menu/index', type: 2, icon: 'Menu', sort: 3, perms: 'system:menu:list', children: [
        { name: '菜单查询', path: null, component: null, type: 3, icon: null, sort: 1, perms: 'system:menu:list' },
        { name: '菜单新增', path: null, component: null, type: 3, icon: null, sort: 2, perms: 'system:menu:add' },
        { name: '菜单编辑', path: null, component: null, type: 3, icon: null, sort: 3, perms: 'system:menu:edit' },
        { name: '菜单删除', path: null, component: null, type: 3, icon: null, sort: 4, perms: 'system:menu:delete' },
      ]},
      { name: '操作日志', path: '/system/log', component: 'system/log/index', type: 2, icon: 'Document', sort: 4, perms: 'system:log:list' },
    ]},
  ];

  const createdMenuIds: number[] = [];
  async function createMenuTree(menus: any[], parentId = 0) {
    for (const m of menus) {
      const { children, ...data } = m;
      const menu = await prisma.menu.create({
        data: { ...data, parentId },
      });
      createdMenuIds.push(menu.id);
      if (children && children.length) {
        await createMenuTree(children, menu.id);
      }
    }
  }

  // 清空菜单，重建（开发环境幂等）
  await prisma.menu.deleteMany();
  await createMenuTree(menuTree);
  console.log('菜单创建完成，共', createdMenuIds.length, '条');

  // 3. 创建管理员用户
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHash,
      nickname: '超级管理员',
      email: 'admin@example.com',
      status: 1,
      isSuper: true,
    },
  });

  // 4. 关联管理员角色与全部菜单
  await prisma.userRole.deleteMany();
  await prisma.roleMenu.deleteMany();
  await prisma.userRole.create({
    data: { userId: admin.id, roleId: adminRole.id },
  });

  // 普通用户角色也分配所有菜单（演示方便）
  for (const menuId of createdMenuIds) {
    await prisma.roleMenu.create({ data: { roleId: adminRole.id, menuId } });
  }

  console.log('用户创建完成: admin / admin123');
  console.log('种子数据初始化完成 ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
