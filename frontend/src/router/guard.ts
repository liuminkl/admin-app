import router from './index';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getProfileApi } from '../api/auth';
import type { MenuItem } from '../api/auth';

// 避免重复添加路由
let dynamicRoutesAdded = false;

// 记录已注册的动态路由名
const registeredRouteNames = new Set<string>();

/**
 * 将后端菜单树转换为前端路由
 */
function generateRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];
  for (const menu of menus) {
    // 目录（type=1）无 component，递归子菜单
    if (menu.type === 1) {
      if (menu.children && menu.children.length) {
        // 目录下有子菜单时，作为父路由容器
        const childRoutes = generateRoutes(menu.children);
        // 找到第一个有路径的子菜单用于重定向
        routes.push({
          path: menu.path || '',
          name: `menu-${menu.id}`,
          component: () => import('../layout/index.vue'),
          redirect: findFirstPath(menu.children),
          children: childRoutes,
        });
      }
    } else if (menu.type === 2 && menu.path) {
      // 菜单：动态加载组件
      const component = loadView(menu.component);
      routes.push({
        path: menu.path,
        name: `menu-${menu.id}`,
        component,
        meta: { title: menu.name, icon: menu.icon },
      });
    }
  }
  return routes;
}

/** 找到子树中第一个菜单路径 */
function findFirstPath(menus: MenuItem[]): string {
  for (const m of menus) {
    if (m.type === 2 && m.path) return m.path;
    if (m.children?.length) {
      const p = findFirstPath(m.children);
      if (p) return p;
    }
  }
  return '';
}

/** 动态加载视图组件 */
function loadView(componentPath?: string) {
  if (!componentPath) {
    return () => import('../views/dashboard/index.vue');
  }
  const modules = import.meta.glob('../views/**/*.vue');
  const key = `../views/${componentPath}.vue`;
  return modules[key] || (() => import('../views/error/404.vue'));
}

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  const hasToken = userStore.token;

  if (!hasToken) {
    if (to.path === '/login') {
      next();
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  // 已登录访问登录页，跳转首页
  if (to.path === '/login') {
    next('/dashboard');
    return;
  }

  // 已登录但无用户信息，拉取并动态注册路由
  if (!userStore.userInfo) {
    try {
      const userInfo = await getProfileApi();
      userStore.userInfo = userInfo;

      if (!dynamicRoutesAdded) {
        const routes = generateRoutes(userInfo.menus || []);
        // 动态路由注册到根路由下
        routes.forEach((r) => {
          if (!registeredRouteNames.has(r.name as string)) {
            router.addRoute(r);
            registeredRouteNames.add(r.name as string);
          }
        });
        // 追加兜底路由
        router.addRoute({
          path: '/:pathMatch(.*)*',
          redirect: '/dashboard',
        });
        dynamicRoutesAdded = true;
        // 重新进入当前路由（动态路由已就绪）
        next({ ...to, replace: true });
        return;
      }
    } catch (e) {
      userStore.resetToken();
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      return;
    }
  }

  next();
});

export { dynamicRoutesAdded };
