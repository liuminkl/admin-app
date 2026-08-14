<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="24" color="#fff">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="16">
        <el-card shadow="never">
          <template #header>
            <span>近 30 天用户注册趋势</span>
          </template>
          <div ref="userTrendRef" class="chart chart-large"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <span>操作模块分布</span>
          </template>
          <div ref="moduleRef" class="chart chart-large"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志趋势 + 最近日志 -->
    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <span>操作日志趋势</span>
          </template>
          <div ref="logTrendRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <span>最近操作</span>
          </template>
          <el-table :data="recentLogs" size="small" max-height="300">
            <el-table-column prop="username" label="用户" width="100" />
            <el-table-column prop="module" label="模块" width="100" />
            <el-table-column prop="action" label="操作" />
            <el-table-column label="状态" width="70">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
                  {{ row.status === 0 ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';
import {
  getStatsApi,
  getUserTrendApi,
  getLogByModuleApi,
  getLogTrendApi,
  getRecentLogsApi,
} from '../../api/dashboard';

const statCards = ref<any[]>([]);
const recentLogs = ref<any[]>([]);

const userTrendRef = ref<HTMLDivElement>();
const moduleRef = ref<HTMLDivElement>();
const logTrendRef = ref<HTMLDivElement>();

let charts: echarts.ECharts[] = [];

const iconMap: Record<string, string> = {
  userTotal: 'User',
  userToday: 'UserFilled',
  roleTotal: 'Avatar',
  menuTotal: 'Menu',
  logTotal: 'Document',
  logToday: 'DataLine',
};

const colorMap: Record<string, string> = {
  userTotal: '#409EFF',
  userToday: '#67C23A',
  roleTotal: '#E6A23C',
  menuTotal: '#909399',
  logTotal: '#F56C6C',
  logToday: '#36CFC9',
};

async function loadStats() {
  const stats = await getStatsApi();
  const configs: [string, string][] = [
    ['userTotal', '用户总数'],
    ['userToday', '今日新增'],
    ['roleTotal', '角色数量'],
    ['menuTotal', '菜单数量'],
    ['logTotal', '操作日志'],
    ['logToday', '今日日志'],
  ];
  statCards.value = configs.map(([key, label]) => ({
    label,
    value: (stats as any)[key] ?? 0,
    icon: iconMap[key],
    color: colorMap[key],
  }));
}

function initChart(el: HTMLElement | undefined) {
  if (!el) return null;
  const chart = echarts.init(el);
  charts.push(chart);
  return chart;
}

async function loadCharts() {
  const userTrend = await getUserTrendApi();
  const moduleDist = await getLogByModuleApi();
  const logTrend = await getLogTrendApi();

  // 用户注册趋势
  const userChart = initChart(userTrendRef.value);
  userChart?.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: userTrend.map((i) => i.date) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '注册用户',
        type: 'line',
        smooth: true,
        data: userTrend.map((i) => i.count),
        areaStyle: { opacity: 0.15 },
        itemStyle: { color: '#409EFF' },
      },
    ],
  });

  // 模块分布饼图
  const moduleChart = initChart(moduleRef.value);
  moduleChart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        name: '操作模块',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        data: moduleDist.map((m) => ({ name: m.module, value: m.count })),
        label: { formatter: '{b}: {c}' },
      },
    ],
  });

  // 日志趋势柱状图
  const logChart = initChart(logTrendRef.value);
  logChart?.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: logTrend.map((i) => i.date) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '操作日志',
        type: 'bar',
        data: logTrend.map((i) => i.count),
        itemStyle: { color: '#67C23A', borderRadius: [3, 3, 0, 0] },
      },
    ],
  });
}

function handleResize() {
  charts.forEach((c) => c.resize());
}

onMounted(async () => {
  await loadStats();
  await nextTick();
  await loadCharts();
  recentLogs.value = await getRecentLogsApi();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  charts.forEach((c) => c.dispose());
  charts = [];
});
</script>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  margin-bottom: 16px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}
.chart {
  width: 100%;
  height: 260px;
}
.chart-large {
  height: 320px;
}
.bottom-row {
  margin-top: 16px;
}
</style>
