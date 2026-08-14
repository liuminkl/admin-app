import { get, post } from '../utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  isSuper: boolean;
  roles: string[];
  permissions: string[];
  menus: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  path?: string;
  component?: string;
  type: number;
  icon?: string;
  perms?: string;
  visible?: number;
  children?: MenuItem[];
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: { id: number; username: string; nickname?: string; avatar?: string };
}

export const loginApi = (data: LoginParams) =>
  post<LoginResult>('/auth/login', data);

export const logoutApi = () => post('/auth/logout');

export const getProfileApi = () => get<UserInfo>('/auth/profile');
