<template>
  <el-card shadow="never">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键字">
          <el-input
            v-model="query.keyword"
            placeholder="角色名称/标识"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="btn-bar">
      <el-button v-perm="'system:role:add'" type="primary" :icon="Plus" @click="openDialog()">
        新增角色
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="code" label="角色标识" width="140">
        <template #default="{ row }">
          <el-tag :type="row.code === 'admin' ? 'danger' : 'info'" size="small">
            {{ row.code }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200">
        <template #default="{ row }">{{ row.description || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-perm="'system:role:edit'" link type="primary" @click="openDialog(row)">
            编辑
          </el-button>
          <el-button v-perm="'system:role:edit'" link type="warning" @click="openMenuAssign(row)">
            分配权限
          </el-button>
          <el-button
            v-if="row.code !== 'admin'"
            v-perm="'system:role:delete'"
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑角色' : '新增角色'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="code">
          <el-input v-model="form.code" :disabled="form.id === 1" placeholder="如 operator" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="角色描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-model="menuVisible" title="分配菜单权限" width="400px">
      <el-tree
        ref="menuTreeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        default-expand-all
      />
      <template #footer>
        <el-button @click="menuVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitMenuAssign">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { Search, Refresh, Plus } from '@element-plus/icons-vue';
import {
  getRoleListApi,
  getRoleDetailApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  assignRoleMenusApi,
  type RoleItem,
} from '../../../api/role';
import { getMenuTreeApi } from '../../../api/menu';

const loading = ref(false);
const tableData = ref<RoleItem[]>([]);
const total = ref(0);
const menuTree = ref<any[]>([]);

const query = reactive({ page: 1, pageSize: 10, keyword: '' });

async function fetchData() {
  loading.value = true;
  try {
    const data = await getRoleListApi({ ...query });
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
  query.keyword = '';
  query.page = 1;
  fetchData();
}

// 新增/编辑
const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<any>({
  id: undefined,
  name: '',
  code: '',
  description: '',
  sort: 0,
  status: 1,
});
const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { min: 2, message: '至少 2 位', trigger: 'blur' },
  ],
};

function openDialog(row?: RoleItem) {
  Object.assign(form, {
    id: row?.id,
    name: row?.name || '',
    code: row?.code || '',
    description: row?.description || '',
    sort: row?.sort ?? 0,
    status: row?.status ?? 1,
  });
  dialogVisible.value = true;
}

async function submitForm() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (form.id) {
      await updateRoleApi(form.id, { ...form, id: undefined });
      ElMessage.success('修改成功');
    } else {
      await createRoleApi({ ...form, id: undefined });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: RoleItem) {
  await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', { type: 'warning' });
  await deleteRoleApi(row.id);
  ElMessage.success('删除成功');
  fetchData();
}

// 分配权限
const menuVisible = ref(false);
const menuTreeRef = ref();
const currentRoleId = ref(0);

async function openMenuAssign(row: RoleItem) {
  currentRoleId.value = row.id;
  menuVisible.value = true;
  // 加载菜单树
  if (!menuTree.value.length) {
    menuTree.value = await getMenuTreeApi();
  }
  // 加载角色已有菜单
  const detail = await getRoleDetailApi(row.id);
  menuTreeRef.value?.setCheckedKeys(detail.menuIds);
}

async function submitMenuAssign() {
  const checked = menuTreeRef.value.getCheckedKeys();
  const halfChecked = menuTreeRef.value.getHalfCheckedKeys();
  submitting.value = true;
  try {
    await assignRoleMenusApi(currentRoleId.value, [...checked, ...halfChecked]);
    ElMessage.success('权限分配成功');
    menuVisible.value = false;
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
.btn-bar {
  margin-bottom: 16px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
