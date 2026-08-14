import { get } from '../utils/request';

export interface DashboardStats {
  userTotal: number;
  userToday: number;
  roleTotal: number;
  menuTotal: number;
  logTotal: number;
  logToday: number;
}

export const getStatsApi = () => get<DashboardStats>('/dashboard/stats');
export const getUserTrendApi = () => get<{ date: string; count: number }[]>('/dashboard/user-trend');
export const getLogByModuleApi = () => get<{ module: string; count: number }[]>('/dashboard/log-by-module');
export const getLogTrendApi = () => get<{ date: string; count: number }[]>('/dashboard/log-trend');
export const getRecentLogsApi = () => get<any[]>('/dashboard/recent-logs');
