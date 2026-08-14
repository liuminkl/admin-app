<template>
  <!-- 有子菜单且子菜单非空（目录） -->
  <el-sub-menu
    v-if="item.children && item.children.length > 0"
    :index="resolvePath(item.path || '')"
  >
    <template #title>
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.name }}</span>
    </template>
    <SidebarItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :base-path="item.path || ''"
    />
  </el-sub-menu>

  <!-- 叶子菜单（菜单类型） -->
  <el-menu-item v-else-if="item.type === 2 && item.path" :index="resolvePath(item.path)">
    <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
    <template #title>{{ item.name }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { MenuItem } from '../../api/auth';

defineOptions({ name: 'SidebarItem' });

const props = defineProps<{
  item: MenuItem;
  basePath: string;
}>();

function resolvePath(path: string): string {
  if (!path) return props.basePath || '/';
  if (path.startsWith('/')) return path;
  const base = props.basePath.replace(/\/$/, '');
  return `${base}/${path}`;
}
</script>
