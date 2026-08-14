<template>
  <el-card shadow="never">
    <div class="btn-bar">
      <el-button v-perm="'system:menu:add'" type="primary" :icon="Plus" @click="openDialog()">
        新增菜单
      </el-button>
      <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
    </div>

    <el-table
      :data="tableData"
      v-loading="loading"
      border
      row-key="id"
      :tree-props="{ children: 'children' }"
      default-expand-all
    >
      <el-table-column prop="name" label="菜单名称" min-width="180" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.type === 1" type="warning" size="small">目录</el-tag>
          <el-tag v-else-if="row.type === 2" type="success" size="small">菜单</el-tag>
          <el-tag v-else type="info" size="small">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="{ row }">
          <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由地址" min-width="150">
        <template #default="{ row }">{{ row.path || '-' }}</template>
      </el-table-column>
      <el-table-column prop="component" label="组件路径" min-width="180">
        <template #default="{ row }">{{ row.component || '-' }}</template>
      </el-table-column>
      <el-table-column prop="perms" label="权限标识" min-width="160">
        <template #default="{ row }">
          <el-tag v-if="row.perms" type="primary" size="small">{{ row.perms }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="70" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-perm="'system:menu:add'" link type="primary" @click="openDialog(undefined, row)">
            新增
          </el-button>
          <el-button v-perm="'system:menu:edit'" link type="primary" @click="openDialog(row)">
            编辑
          </el-button>
          <el-button v-perm="'system:menu:delete'" link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑菜单' : '新增菜单'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            check-strictly
            :render-after-expand="false"
            placeholder="不选则为顶级菜单"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button :value="1">目录</el-radio-button>
            <el-radio-button :value="2">菜单</el-radio-button>
            <el-radio-button :value="3">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item v-if="form.type !== 3" label="路由地址">
          <el-input v-model="form.path" placeholder="如 /system/user" />
        </el-form-item>
        <el-form-item v-if="form.type === 2" label="组件路径">
          <el-input v-model="form.component" placeholder="如 system/user/index" />
        </el-form-item>
        <el-form-item label="权限标识">
          <el-input v-model="form.perms" placeholder="如 system:user:add" />
        </el-form-item>
        <el-form-item v-if="form.type !== 3" label="图标">
          <el-input v-model="form.icon" placeholder="Element Plus 图标名，如 User" />
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
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import {
  getMenuTreeApi,
  createMenuApi,
  updateMenuApi,
  deleteMenuApi,
  type MenuItem,
} from '../../../api/menu';

const loading = ref(false);
const tableData = ref<MenuItem[]>([]);

async function fetchData() {
  loading.value = true;
  try {
    tableData.value = await getMenuTreeApi();
  } finally {
    loading.value = false;
  }
}

// 上级菜单选项（顶级 + 目录）
const parentOptions = computed(() => {
  return [{ id: 0, name: '顶级菜单', children: tableData.value }];
});

const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<any>({
  id: undefined,
  parentId: 0,
  name: '',
  path: '',
  component: '',
  type: 2,
  icon: '',
  sort: 0,
  status: 1,
  perms: '',
});
const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
};

function openDialog(row?: MenuItem, parent?: MenuItem) {
  Object.assign(form, {
    id: row?.id,
    parentId: row ? row.parentId : parent?.id ?? 0,
    name: row?.name || '',
    path: row?.path || '',
    component: row?.component || '',
    type: row?.type ?? 2,
    icon: row?.icon || '',
    sort: row?.sort ?? 0,
    status: row?.status ?? 1,
    perms: row?.perms || '',
  });
  dialogVisible.value = true;
}

async function submitForm() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (form.id) {
      await updateMenuApi(form.id, { ...form, id: undefined });
      ElMessage.success('修改成功');
    } else {
      await createMenuApi({ ...form, id: undefined });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: MenuItem) {
  await ElMessageBox.confirm(`确定删除菜单「${row.name}」吗？`, '提示', { type: 'warning' });
  await deleteMenuApi(row.id);
  ElMessage.success('删除成功');
  fetchData();
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.btn-bar {
  margin-bottom: 16px;
}
</style>
