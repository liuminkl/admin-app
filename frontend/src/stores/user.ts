import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginApi, getProfileApi, logoutApi } from '../api/auth';
import type { LoginParams, UserInfo } from '../api/auth';

const TOKEN_KEY = 'admin_app_token';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '');
  const userInfo = ref<UserInfo | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isSuper = computed(() => userInfo.value?.isSuper ?? false);
  const permissions = computed(() => userInfo.value?.permissions ?? []);
  const roles = computed(() => userInfo.value?.roles ?? []);

  /** 判断是否拥有某权限 */
  function hasPermission(perm: string): boolean {
    if (isSuper.value) return true;
    return permissions.value.includes(perm);
  }

  /** 登录 */
  async function login(params: LoginParams) {
    const data = await loginApi(params);
    token.value = data.accessToken;
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    // 登录后拉取用户信息
    await fetchUserInfo();
    return data;
  }

  /** 拉取用户信息 */
  async function fetchUserInfo() {
    userInfo.value = await getProfileApi();
    return userInfo.value;
  }

  /** 登出 */
  async function logout() {
    try {
      await logoutApi();
    } catch {
      // 忽略登出接口错误
    }
    resetToken();
  }

  /** 重置 token */
  function resetToken() {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isSuper,
    permissions,
    roles,
    hasPermission,
    login,
    fetchUserInfo,
    logout,
    resetToken,
  };
});
