import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';
import { useUserStore } from '../stores/user';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 兼容非标准格式
    if (res.code === undefined) {
      return res;
    }
    if (res.code === 0) {
      return res.data;
    }
    // 业务错误
    ElMessage.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || '网络错误';

    if (status === 401) {
      const userStore = useUserStore();
      userStore.resetToken();
      ElMessage.error('登录已过期，请重新登录');
      router.push('/login');
    } else {
      ElMessage.error(message);
    }
    return Promise.reject(error);
  },
);

/** 通用请求方法 */
export function get<T = any>(url: string, params?: any): Promise<T> {
  return service.get(url, { params }) as Promise<T>;
}

export function post<T = any>(url: string, data?: any): Promise<T> {
  return service.post(url, data) as Promise<T>;
}

export function put<T = any>(url: string, data?: any): Promise<T> {
  return service.put(url, data) as Promise<T>;
}

export function del<T = any>(url: string, params?: any): Promise<T> {
  return service.delete(url, { params }) as Promise<T>;
}

export default service;
