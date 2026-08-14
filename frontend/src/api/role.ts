import { get, post, put, del } from '../utils/request';

export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  sort: number;
  createdAt: string;
}

export interface RoleDetail extends RoleItem {
  menuIds: number[];
}

export const getRoleListApi = (params: any) => get('/role', params);
export const getRoleOptionsApi = () => get('/role/options');
export const getRoleDetailApi = (id: number) => get<RoleDetail>(`/role/${id}`);
export const createRoleApi = (data: any) => post('/role', data);
export const updateRoleApi = (id: number, data: any) => put(`/role/${id}`, data);
export const deleteRoleApi = (id: number) => del(`/role/${id}`);
export const assignRoleMenusApi = (id: number, menuIds: number[]) =>
  put(`/role/${id}/menus`, { menuIds });
