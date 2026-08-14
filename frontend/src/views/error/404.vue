<template>
  <div class="error-404">
    <h1>404</h1>
    <p>抱歉，页面不存在</p>
    <el-button type="primary" @click="$router.push('/dashboard')">
      返回首页
    </el-button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.error-404 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 80px 0;
}
.error-404 h1 {
  font-size: 80px;
  color: #409eff;
  margin: 0;
}
.error-404 p {
  color: #909399;
  font-size: 18px;
  margin: 16px 0 24px;
}
</style>
