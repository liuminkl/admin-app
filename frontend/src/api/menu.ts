import { get, post, put, del } from '../utils/request';

export interface MenuItem {
  id: number;
  parentId: number;
  name: string;
  path?: string;
  component?: string;
  type: number;
  icon?: string;
  sort: number;
  status: number;
  perms?: string;
  visible?: number;
  children?: MenuItem[];
}

export const getMenuTreeApi = () => get<MenuItem[]>('/menu/tree');
export const getMenuListApi = () => get<MenuItem[]>('/menu');
export const createMenuApi = (data: any) => post('/menu', data);
export const updateMenuApi = (id: number, data: any) => put(`/menu/${id}`, data);
export const deleteMenuApi = (id: number) => del(`/menu/${id}`);
