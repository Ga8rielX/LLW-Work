<template>
  <div class="status-page">
    <div class="code">403</div>
    <h1>没有访问权限</h1>
    <p>当前账号的角色是「{{ roleName }}」，这个页面只对特定角色开放。</p>
    <div class="actions">
      <el-button type="primary" @click="$router.replace('/dashboard')">回到仪表盘</el-button>
      <el-button @click="relogin">切换账号</el-button>
    </div>
  </div>
</template>

<script>
import { ROLE_LABELS } from '../utils/session'

export default {
  name: 'ForbiddenPage',
  computed: {
    roleName() {
      const code = this.$store.getters.roleCode
      return ROLE_LABELS[code] || code
    }
  },
  methods: {
    relogin() {
      this.$store.commit('clearUserInfo')
      this.$router.replace('/login')
    }
  }
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
  color: var(--wa-primary);
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

.actions {
  display: flex;
  gap: 8px;
}
</style>
