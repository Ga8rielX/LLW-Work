<template>
  <div class="register-page">
    <el-card class="register-card">
      <h2>注册接口演示</h2>
      <p class="hint">
        对应课件 POST /api/auth/register。真实后端当前未开放公开注册，有效请求会返回 403，
        这一页用于验证「能发出请求、能正确显示后端 message」。
      </p>

      <el-alert
        title="当前环境未开放公开注册。Mock 模式可在 .env.development 中把 VUE_APP_ALLOW_REGISTER 改成 true 体验成功分支。"
        type="info"
        :closable="false"
        class="alert"
      />
      <el-alert v-if="errorText" :title="errorText" type="error" :closable="false" class="alert" />

      <el-form
        ref="registerFormRef"
        :model="form"
        :rules="rules"
        :disabled="loading"
        label-width="84px"
        @submit.prevent
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" maxlength="100" placeholder="选填" />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model.trim="form.account" maxlength="100" placeholder="必填" />
        </el-form-item>
        <el-form-item label="密码" prop="passwd">
          <el-input v-model="form.passwd" type="password" show-password maxlength="100" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPasswd">
          <el-input v-model="form.confirmPasswd" type="password" show-password maxlength="100" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="register">提交注册请求</el-button>
          <el-button :disabled="loading" @click="$router.push('/login')">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { registerApi } from '../api/auth'

export default {
  name: 'AccountRegister',
  data() {
    return {
      loading: false,
      errorText: '',
      form: { name: '', account: '', passwd: '', confirmPasswd: '' },
      rules: {
        name: [{ max: 100, message: '姓名最多 100 个字符', trigger: 'blur' }],
        account: [
          { required: true, whitespace: true, message: '请输入账号', trigger: 'blur' },
          { max: 100, message: '账号最多 100 个字符', trigger: 'blur' }
        ],
        passwd: [
          { required: true, whitespace: true, message: '请输入密码', trigger: 'blur' },
          { max: 100, message: '密码最多 100 个字符', trigger: 'blur' }
        ],
        confirmPasswd: [
          {
            validator: (rule, value, done) => {
              if (!value || value !== this.form.passwd) done(new Error('两次密码必须一致'))
              else done()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async register() {
      if (this.loading) return
      this.loading = true
      this.errorText = ''
      try {
        const valid = await this.$refs.registerFormRef.validate().catch(() => false)
        if (!valid) return

        const result = await registerApi({
          name: this.form.name,
          account: this.form.account.trim(),
          passwd: this.form.passwd
        })
        this.$store.commit('setSession', result)
        this.$message.success('注册成功，已自动登录')
        await this.$router.replace('/dashboard')
      } catch (error) {
        const status = error.response && error.response.status
        this.errorText = `${status ? `HTTP ${status}：` : ''}${error.userMessage || '注册失败'}`
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--wa-bg);
}

.register-card {
  width: 100%;
  max-width: 560px;
}

h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
}

.alert {
  margin-bottom: 14px;
}

.hint {
  margin: 0 0 18px;
  color: var(--wa-text-2);
  font-size: 13px;
  line-height: 1.7;
}
</style>
