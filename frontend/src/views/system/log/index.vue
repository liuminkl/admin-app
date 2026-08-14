<template>
  <el-card shadow="never">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-form :inline="true" :model="query">
        <el-form-item label="模块">
          <el-input v-model="query.module" placeholder="模块名称" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="用户">
          <el-input v-model="query.username" placeholder="操作用户" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="danger" plain :icon="Delete" @click="handleClear">清空日志</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户" width="110">
        <template #default="{ row }">{{ row.username || '-' }}</template>
      </el-table-column>
      <el-table-column prop="module" label="模块" width="110" />
      <el-table-column prop="action" label="操作" min-width="120" />
      <el-table-column prop="method" label="方法" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="methodType(row.method)">{{ row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="请求地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="130" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
            {{ row.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="costTime" label="耗时(ms)" width="90" />
      <el-table-column prop="createdAt" label="时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="详情" width="70" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="showDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ detail.module || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ detail.action || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求">{{ detail.method }} {{ detail.url }}</el-descriptions-item>
        <el-descriptions-item label="IP">{{ detail.ip || '-' }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detail.costTime }}ms</el-descriptions-item>
        <el-descriptions-item label="参数">
          <pre class="detail-pre">{{ detail.params || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息">
          <span style="color: #f56c6c">{{ detail.errorMsg || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';
import { getLogListApi, clearLogApi, type LogItem } from '../../../api/log';

const loading = ref(false);
const tableData = ref<LogItem[]>([]);
const total = ref(0);

const query = reactive({
  page: 1,
  pageSize: 10,
  module: '',
  username: '',
  status: undefined as number | undefined,
});

async function fetchData() {
  loading.value = true;
  try {
    const data = await getLogListApi({ ...query });
    tableData.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  fetchData();
}
function handleReset() {
  query.module = '';
  query.username = '';
  query.status = undefined;
  query.page = 1;
  fetchData();
}

async function handleClear() {
  await ElMessageBox.confirm('确定清空所有操作日志吗？此操作不可恢复！', '警告', {
    type: 'warning',
  });
  await clearLogApi();
  ElMessage.success('日志已清空');
  fetchData();
}

function methodType(method?: string) {
  const map: Record<string, string> = {
    GET: '',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger',
  };
  return (map[method || ''] as any) || 'info';
}

function formatDate(date: string) {
  return date ? date.replace('T', ' ').slice(0, 19) : '-';
}

const detailVisible = ref(false);
const detail = ref<LogItem>({} as LogItem);
function showDetail(row: LogItem) {
  detail.value = row;
  detailVisible.value = true;
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.detail-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
