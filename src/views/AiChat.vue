<template>
  <el-card shadow="never">
    <h1 class="page-title">AI 助手</h1>
    <p class="page-description">
      {{ isMock ? 'Mock 模式：按 1～3 个字分片推送，模拟 SSE 的流式输出效果。' : '真实模式：POST /api/ai/chat 并读取 text/event-stream。' }}
      真实后端尚未配置模型密钥，因此默认走本地模拟；接口可用时把 .env 的 VUE_APP_USE_MOCK 改成 false 即可切换。
    </p>

    <div ref="listRef" class="chat-list">
      <div v-if="!messages.length" class="empty">
        <p>试着问：这个项目的权限是怎么做的？接口 401 怎么排查？</p>
        <div class="suggestions">
          <el-tag v-for="item in suggestions" :key="item" class="suggestion" @click="ask(item)">
            {{ item }}
          </el-tag>
        </div>
      </div>

      <div v-for="(message, index) in messages" :key="index" class="row" :class="message.role">
        <div class="role">{{ message.role === 'user' ? '我' : 'AI' }}</div>
        <div class="content">{{ message.content }}<span v-if="streaming && index === messages.length - 1" class="caret">▌</span></div>
      </div>
    </div>

    <div class="composer">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="2"
        maxlength="500"
        show-word-limit
        placeholder="Enter 发送，Shift + Enter 换行"
        :disabled="streaming"
        @keydown.enter.exact.prevent="send"
      />
      <div class="composer-actions">
        <el-button v-if="streaming" @click="stop">停止生成</el-button>
        <el-button type="primary" :disabled="!draft.trim() || streaming" @click="send">发送</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { streamChat } from '../utils/ai-client'
import { USE_MOCK } from '../api/request'

export default {
  name: 'AiAssistant',
  data() {
    return {
      isMock: USE_MOCK,
      messages: [],
      draft: '',
      streaming: false,
      cancel: null,
      suggestions: ['权限是怎么做的？', '401 要怎么排查？', 'Mock 数据刷新会丢吗？']
    }
  },
  beforeUnmount() {
    this.stop()
  },
  methods: {
    ask(text) {
      this.draft = text
      this.send()
    },
    send() {
      const content = this.draft.trim()
      if (!content || this.streaming) return

      this.messages.push({ role: 'user', content })
      this.messages.push({ role: 'assistant', content: '' })
      this.draft = ''
      this.streaming = true
      this.scrollToBottom()

      const last = this.messages.length - 1
      this.cancel = streamChat({
        message: content,
        token: this.$store.state.token,
        onChunk: chunk => {
          this.messages[last].content += chunk
          this.scrollToBottom()
        },
        onDone: () => {
          this.streaming = false
          this.cancel = null
        },
        onError: error => {
          this.streaming = false
          this.cancel = null
          this.messages[last].content = `请求失败：${error.message}`
        }
      })
    },
    stop() {
      if (this.cancel) this.cancel()
      this.cancel = null
      this.streaming = false
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
.chat-list {
  height: calc(100vh - 420px);
  min-height: 240px;
  padding: 16px;
  overflow-y: auto;
  background: #fafbfd;
  border: 1px solid var(--wa-border);
  border-radius: 8px;
}

.empty {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--wa-text-3);
  font-size: 13px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.suggestion {
  cursor: pointer;
}

.row {
  margin-bottom: 16px;
}

.role {
  margin-bottom: 4px;
  color: var(--wa-text-3);
  font-size: 12px;
}

.row.user .content {
  padding: 9px 12px;
  background: #eaf1fe;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
}

.row.assistant .content {
  padding: 9px 12px;
  background: #fff;
  border: 1px solid var(--wa-border);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
}

.caret {
  color: var(--wa-primary);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.composer {
  margin-top: 14px;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
