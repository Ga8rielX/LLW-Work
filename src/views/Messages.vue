<template>
  <el-card shadow="never">
    <h1 class="page-title">消息接口</h1>
    <p class="page-description">
      对应课件第 6 步：<code>POST /api/messages</code> 接收 JSON，返回 <code>text/plain</code> 纯文本。
      这个接口只做回显，后端没有消息列表和历史记录，所以页面不展示会话。
    </p>

    <el-form ref="formRef" :model="form" :rules="rules" :disabled="sending" label-position="top" @submit.prevent>
      <el-form-item label="演示消息" prop="message">
        <el-input
          v-model="form.message"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="例如：我的第一个真实接口请求"
        />
      </el-form-item>
      <el-button type="primary" :loading="sending" @click="submit">发送消息</el-button>
    </el-form>

    <div v-if="received" class="result">
      <h2>最近一次成功响应</h2>
      <p>{{ received }}</p>
    </div>
  </el-card>
</template>

<script>
import { sendMessage } from '../api/message'

export default {
  name: 'MessageInterfaceDemo',
  data() {
    return {
      sending: false,
      received: '',
      form: { message: '' },
      rules: {
        message: [{ required: true, whitespace: true, message: '请输入演示消息', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async submit() {
      if (this.sending) return
      this.sending = true
      try {
        const valid = await this.$refs.formRef.validate().catch(() => false)
        if (!valid) return
        // 成功拦截器已经返回 response.data，这里拿到的就是字符串
        this.received = await sendMessage(this.form.message)
        this.$message.success('消息接口调用成功')
      } catch {
        // 失败保留上一次成功的回显
      } finally {
        this.sending = false
      }
    }
  }
}
</script>

<style scoped>
.result {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--wa-border);
}

.result h2 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 500;
}

.result p {
  margin: 0;
  color: var(--wa-primary);
  font-size: 13px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

code {
  padding: 1px 5px;
  background: #f1f3f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
