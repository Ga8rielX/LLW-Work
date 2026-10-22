<template>
  <el-card shadow="never" class="chat-card">
    <div class="chat-header">
      <div>
        <h1 class="page-title">群聊</h1>
        <p class="page-description">
          {{ isMock ? 'Mock 模式：用 BroadcastChannel 在同一浏览器多个标签页之间互通，开两个窗口分别登录不同账号即可演示实时收发。' : '真实模式：连接后端 WebSocket，断线后自动退避重连。' }}
        </p>
      </div>
      <el-tag :type="statusType" effect="plain">{{ statusText }}</el-tag>
    </div>

    <div ref="listRef" class="message-list">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ mine: message.account === myAccount }"
      >
        <el-avatar :size="30" class="avatar">
          {{ (message.name || message.account || '?').slice(0, 1) }}
        </el-avatar>
        <div class="bubble-wrap">
          <div class="meta">{{ message.name || message.account }} · {{ message.time }}</div>
          <div class="bubble">{{ message.content }}</div>
        </div>
      </div>
      <el-empty v-if="!messages.length" description="还没有消息，先打个招呼吧" :image-size="72" />
    </div>

    <div class="composer">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="2"
        maxlength="300"
        show-word-limit
        placeholder="Enter 发送，Shift + Enter 换行"
        @keydown.enter.exact.prevent="send"
      />
      <div class="composer-actions">
        <el-button link :disabled="!messages.length" @click="clearLocal">清空本机记录</el-button>
        <el-button type="primary" :loading="sending" :disabled="!draft.trim()" @click="send">
          发送
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { createChatClient, USE_MOCK } from '../utils/chat-client'

const STATUS_MAP = {
  connected: { text: '已连接', type: 'success' },
  connecting: { text: '连接中…', type: 'warning' },
  reconnecting: { text: '重连中…', type: 'warning' },
  closed: { text: '连接已断开', type: 'danger' },
  error: { text: '连接异常', type: 'danger' }
}

export default {
  name: 'GroupChat',
  data() {
    return {
      isMock: USE_MOCK,
      messages: [],
      draft: '',
      sending: false,
      status: 'connecting',
      client: null
    }
  },
  computed: {
    myAccount() {
      const user = this.$store.state.userInfo || {}
      return user.account || ''
    },
    statusText() {
      return (STATUS_MAP[this.status] || STATUS_MAP.connecting).text
    },
    statusType() {
      return (STATUS_MAP[this.status] || STATUS_MAP.connecting).type
    }
  },
  created() {
    this.client = createChatClient({
      user: this.$store.state.userInfo || {},
      onHistory: this.replaceHistory,
      onMessage: this.appendMessage,
      onStatus: status => {
        this.status = status
      }
    })
    this.client.connect()
  },
  beforeUnmount() {
    if (this.client) this.client.close()
  },
  methods: {
    replaceHistory(items) {
      this.messages = Array.isArray(items) ? items : []
      this.scrollToBottom()
    },
    appendMessage(message) {
      if (!message || !message.content) return
      if (this.messages.some(item => item.id === message.id)) return
      this.messages.push(message)
      this.scrollToBottom()
    },
    send() {
      const content = this.draft.trim()
      if (!content || !this.client) return

      this.sending = true
      try {
        const message = this.client.send(content)
        this.appendMessage(message)
        this.draft = ''
      } catch (error) {
        this.$message.error(error.message || '发送失败')
      } finally {
        this.sending = false
      }
    },
    clearLocal() {
      this.messages = []
      if (this.isMock) localStorage.removeItem('work-admin-chat-history')
      this.$message.success('已清空本机消息记录')
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.listRef
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.chat-card {
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.message-list {
  height: calc(100vh - 400px);
  min-height: 260px;
  padding: 16px;
  overflow-y: auto;
  background: #fafbfd;
  border: 1px solid var(--wa-border);
  border-radius: 8px;
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.message.mine {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  background: #dfe8f8;
  color: #2b6de5;
  font-size: 13px;
}

.bubble-wrap {
  max-width: 68%;
}

.meta {
  margin-bottom: 4px;
  color: var(--wa-text-3);
  font-size: 12px;
}

.message.mine .meta {
  text-align: right;
}

.bubble {
  padding: 9px 12px;
  background: #fff;
  border: 1px solid var(--wa-border);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message.mine .bubble {
  background: #eaf1fe;
  border-color: #cfe0fb;
}

.composer {
  margin-top: 14px;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}
</style>
