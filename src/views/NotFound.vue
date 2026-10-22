<template>
  <div class="status-page">
    <div class="code">404</div>
    <h1>页面不存在</h1>
    <p>地址 <code>{{ $route.fullPath }}</code> 没有匹配到任何路由。</p>
    <el-button type="primary" @click="$router.replace('/dashboard')">回到仪表盘</el-button>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage'
}
</script>

<style scoped>
.status-page {
  display: grid;
  place-content: center;
  justify-items: center;
  min-height: 60vh;
  text-align: center;
}

.code {
  font-size: 64px;
  font-weight: 500;
  color: var(--wa-text-3);
  line-height: 1;
}

h1 {
  margin: 12px 0 8px;
  font-size: 18px;
  font-weight: 500;
}

p {
  margin: 0 0 20px;
  color: var(--wa-text-2);
  font-size: 13px;
}

code {
  padding: 1px 5px;
  background: #f1f3f7;
  border-radius: 4px;
}
</style>
