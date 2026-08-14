import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('仪表盘')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '统计卡片' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('user-trend')
  @ApiOperation({ summary: '用户注册趋势' })
  getUserTrend() {
    return this.dashboardService.getUserTrend();
  }

  @Get('log-by-module')
  @ApiOperation({ summary: '操作日志模块分布' })
  getLogByModule() {
    return this.dashboardService.getLogByModule();
  }

  @Get('log-trend')
  @ApiOperation({ summary: '操作日志趋势' })
  getLogTrend() {
    return this.dashboardService.getLogTrend();
  }

  @Get('recent-logs')
  @ApiOperation({ summary: '最近操作日志' })
  getRecentLogs() {
    return this.dashboardService.getRecentLogs();
  }
}
