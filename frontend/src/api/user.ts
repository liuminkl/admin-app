import { get, post, put, del } from '../utils/request';

export interface UserItem {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: number;
  isSuper: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: { id: number; name: string; code: string }[];
}

export interface QueryUserParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

export interface PageResult<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}

export const getUserListApi = (params: QueryUserParams) =>
  get<PageResult<UserItem>>('/user', params);

export const createUserApi = (data: any) => post('/user', data);
export const updateUserApi = (id: number, data: any) => put(`/user/${id}`, data);
export const deleteUserApi = (id: number) => del(`/user/${id}`);
export const resetPasswordApi = (id: number, password: string) =>
  put(`/user/${id}/password`, { password });
