import type { App, Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '../stores/user';

/**
 * 权限指令 v-perm
 * 用法: <el-button v-perm="'system:user:add'">新增</el-button>
 * 无权限时移除元素
 */
function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const userStore = useUserStore();
  const { value } = binding;
  if (!value) return;

  // 支持字符串或数组
  const requiredPerms = Array.isArray(value) ? value : [value];
  const has = userStore.isSuper || requiredPerms.some((p) => userStore.hasPermission(p));
  if (!has) {
    el.parentNode?.removeChild(el);
  }
}

export function setupPermissionDirective(app: App) {
  app.directive('perm', {
    mounted(el, binding) {
      checkPermission(el, binding);
    },
    updated(el, binding) {
      checkPermission(el, binding);
    },
  } as Directive);
}
