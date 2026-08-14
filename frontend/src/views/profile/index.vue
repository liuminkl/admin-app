<template>
  <el-row :gutter="16">
    <el-col :xs="24" :md="8">
      <el-card shadow="never" class="profile-card">
        <div class="profile-header">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar">
            {{ avatarText }}
          </el-avatar>
          <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
          <p class="username">{{ userStore.userInfo?.username }}</p>
          <div class="roles">
            <el-tag v-for="r in userStore.userInfo?.roles" :key="r" size="small" class="role-tag">
              {{ r }}
            </el-tag>
          </div>
        </div>
        <el-divider />
        <div class="profile-info">
          <p><el-icon><Message /></el-icon> 邮箱：{{ userStore.userInfo?.email || '-' }}</p>
          <p><el-icon><Phone /></el-icon> 手机：{{ userStore.userInfo?.phone || '-' }}</p>
          <p><el-icon><Key /></el-icon> 权限数：{{ userStore.userInfo?.permissions.length }}</p>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :md="16">
      <el-card shadow="never">
        <template #header>
          <span>我的权限</span>
        </template>
        <el-table :data="permTable" border>
          <el-table-column prop="index" label="序号" width="80" />
          <el-table-column prop="perm" label="权限标识" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const avatarText = computed(() =>
  (userStore.userInfo?.nickname || userStore.userInfo?.username || 'U').slice(0, 1).toUpperCase(),
);

const permTable = computed(() =>
  userStore.userInfo?.permissions.map((p, i) => ({ index: i + 1, perm: p })) || [],
);
</script>

<style scoped>
.profile-card {
  text-align: center;
}
.profile-header {
  padding: 16px 0 8px;
}
.profile-header h3 {
  margin: 12px 0 4px;
}
.username {
  color: #909399;
  font-size: 13px;
  margin: 0;
}
.roles {
  margin-top: 12px;
}
.role-tag {
  margin: 0 4px;
}
.profile-info {
  text-align: left;
}
.profile-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  margin: 12px 0;
}
</style>
