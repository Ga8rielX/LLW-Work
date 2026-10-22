<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="logo">WA</div>
        <div>
          <h1>work-admin</h1>
          <p>Vue 3 + Element Plus 工作管理中台</p>
        </div>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" :disabled="loading" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" size="large" placeholder="请输入账号" clearable>
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            show-password
            placeholder="请输入密码"
            @keyup.enter="login"
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-button type="primary" size="large" class="submit" :loading="loading" @click="login">
          登 录
        </el-button>
      </el-form>

      <div class="login-options">
        <router-link to="/register" class="link">注册接口演示</router-link>
        <a class="link" @click="onForgot">忘记密码？</a>
      </div>

      <div v-if="isMock" class="demo">
        <p class="hint">Mock 演示账号（点击自动填入）</p>
        <div class="chips">
          <el-tag
            v-for="item in demoAccounts"
            :key="item.account"
            size="small"
            effect="plain"
            class="chip"
            @click="fill(item)"
          >
            {{ item.account }} / {{ item.passwd }} · {{ roleLabel(item.roleCode) }}
          </el-tag>
        </div>
      </div>
      <p v-else class="hint">当前为真实后端模式，请使用老师分配的课堂账号登录。</p>
    </div>
  </div>
</template>

<script>
import { loginApi } from '../api/auth'
import { DEMO_ACCOUNTS } from '../mock/db'
import { ROLE_LABELS } from '../utils/session'
import { USE_MOCK } from '../api/request'

export default {
  name: 'AdminLogin',
  data() {
    return {
      loading: false,
      isMock: USE_MOCK,
      demoAccounts: DEMO_ACCOUNTS,
      loginForm: { username: '', password: '' },
      rules: {
        username: [
          { required: true, whitespace: true, message: '请输入账号', trigger: 'blur' },
          { max: 100, message: '账号最多 100 个字符', trigger: 'blur' }
        ],
        password: [{ required: true, whitespace: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    roleLabel(code) {
      return ROLE_LABELS[code] || code
    },
    fill(item) {
      this.loginForm.username = item.account
      this.loginForm.password = item.passwd
    },
    async login() {
      if (this.loading) return
      this.loading = true
      try {
        const valid = await this.$refs.loginFormRef.validate().catch(() => false)
        if (!valid) return

        // 页面字段是 username / password，提交时映射成后端要求的 account / passwd
        const result = await loginApi({
          account: this.loginForm.username.trim(),
          passwd: this.loginForm.password
        })

        this.$store.commit('setSession', result)
        this.$message.success('登录成功')

        const redirect = this.$route.query.redirect
        await this.$router.replace(
          typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
        )
      } catch (error) {
        this.$message.error(error.userMessage || '登录失败，请检查账号密码')
      } finally {
        this.loading = false
      }
    },
    onForgot() {
      this.$message.info('请联系管理员重置密码')
    }
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at 18% 22%, #e7f0ff 0, transparent 45%),
    radial-gradient(circle at 82% 78%, #eaf7f2 0, transparent 45%),
    #f4f6fa;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 36px 32px 28px;
  background: #fff;
  border: 1px solid var(--wa-border);
  border-radius: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--wa-primary);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.brand h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 500;
}

.brand p {
  margin: 4px 0 0;
  color: var(--wa-text-3);
  font-size: 12px;
}

.submit {
  width: 100%;
  margin-top: 4px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 13px;
}

.link {
  color: var(--wa-primary);
  cursor: pointer;
}

.demo {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px dashed var(--wa-border);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chip {
  cursor: pointer;
}
</style>
