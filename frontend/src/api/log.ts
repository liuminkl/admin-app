import { get, del } from '../utils/request';

export interface LogItem {
  id: number;
  userId?: number;
  username?: string;
  module?: string;
  action?: string;
  method?: string;
  url?: string;
  params?: string;
  ip?: string;
  status: number;
  costTime?: number;
  errorMsg?: string;
  createdAt: string;
}

export const getLogListApi = (params: any) => get('/log', params);
export const clearLogApi = () => del('/log/clear');
