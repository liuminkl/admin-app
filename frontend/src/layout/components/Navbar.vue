<template>
  <div class="navbar">
    <!-- 折叠按钮 -->
    <div class="navbar-left">
      <el-icon class="collapse-btn" :size="20" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧用户区 -->
    <div class="navbar-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="30" :src="avatar">
            {{ avatarText }}
          </el-avatar>
          <span class="username">{{ displayName }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <!-- 修改密码对话框 -->
  <el-dialog v-model="pwdVisible" title="修改密码" width="420px" append-to-body>
    <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="80px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="pwdForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="pwdForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pwdVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitPassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { useAppStore } from '../../stores/app';
import { useUserStore } from '../../stores/user';
import { put } from '../../utils/request';

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const currentTitle = computed(() => {
  return router.currentRoute.value.meta?.title as string | undefined;
});

const displayName = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || '',
);
const avatar = computed(() => userStore.userInfo?.avatar || '');
const avatarText = computed(() => (displayName.value || 'U').slice(0, 1).toUpperCase());

function handleCommand(command: string) {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'password') {
    pwdVisible.value = true;
  } else if (command === 'logout') {
    handleLogout();
  }
}

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  await userStore.logout();
  router.push('/login');
}

// 修改密码
const pwdVisible = ref(false);
const submitting = ref(false);
const pwdFormRef = ref<FormInstance>();
const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6-32 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_: any, value: string, callback: any) => {
        if (value !== pwdForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

async function submitPassword() {
  await pwdFormRef.value?.validate();
  submitting.value = true;
  try {
    await put('/auth/change-password', {
      oldPassword: pwdForm.value.oldPassword,
      newPassword: pwdForm.value.newPassword,
    });
    ElMessage.success('密码修改成功，请重新登录');
    pwdVisible.value = false;
    await userStore.logout();
    router.push('/login');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #606266;
}

.breadcrumb {
  font-size: 14px;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #333;
}
</style>
