import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /** 统计卡片数据 */
  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [userTotal, userToday, roleTotal, menuTotal, logTotal, logToday] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
        this.prisma.role.count(),
        this.prisma.menu.count(),
        this.prisma.operationLog.count(),
        this.prisma.operationLog.count({
          where: { createdAt: { gte: startOfToday } },
        }),
      ]);

    return {
      userTotal,
      userToday,
      roleTotal,
      menuTotal,
      logTotal,
      logToday,
    };
  }

  /** 近 30 天用户注册趋势 */
  async getUserTrend(days = 30) {
    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = await this.prisma.user.count({
        where: { createdAt: { gte: date, lt: next } },
      });
      result.push({
        date: `${date.getMonth() + 1}-${date.getDate()}`,
        count,
      });
    }
    return result;
  }

  /** 操作日志按模块统计 */
  async getLogByModule() {
    const logs = await this.prisma.operationLog.groupBy({
      by: ['module'],
      _count: { _all: true },
    });
    return logs.map((l) => ({
      module: l.module ?? '其他',
      count: l._count._all,
    }));
  }

  /** 近 30 天操作日志趋势 */
  async getLogTrend(days = 30) {
    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = await this.prisma.operationLog.count({
        where: { createdAt: { gte: date, lt: next } },
      });
      result.push({
        date: `${date.getMonth() + 1}-${date.getDate()}`,
        count,
      });
    }
    return result;
  }

  /** 最近操作日志 */
  async getRecentLogs(limit = 8) {
    return this.prisma.operationLog.findMany({
      orderBy: { id: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        module: true,
        action: true,
        ip: true,
        status: true,
        costTime: true,
        createdAt: true,
      },
    });
  }
}
