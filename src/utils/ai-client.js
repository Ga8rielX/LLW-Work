const USE_MOCK = process.env.VUE_APP_USE_MOCK !== 'false'
const API_BASE = process.env.VUE_APP_API_BASE_URL || ''

const MOCK_ANSWERS = [
  '这个问题的关键在「请求链路」：页面 → api 层 → axios 拦截器（带 satoken）→ 后端。排查时先看 Network 的 Request URL 和 Header，再看 HTTP 状态码。',
  '权限分两层：前端用路由 meta.roles 和 v-permission 控制「看不看得见」，后端必须再校验一次「允不允许」。前端的限制只是体验，不是安全边界。',
  'Mock 数据存在 localStorage 里，刷新不会丢；真实后端的数据在服务器上。切换方式是改 .env.development 里的 VUE_APP_USE_MOCK。'
]

function pickAnswer(question) {
  if (/权限|角色|rbac/i.test(question)) return MOCK_ANSWERS[1]
  if (/mock|数据|刷新|接口/i.test(question)) return MOCK_ANSWERS[2]
  return `你问的是「${question.slice(0, 40)}」。${MOCK_ANSWERS[0]}`
}

/**
 * AI 流式对话。
 *
 * Mock 模式：按 1～3 个字分片推送，模拟 SSE 的“一个字一个字出来”。
 * 真实模式：POST /api/ai/chat，读取 text/event-stream。
 * 返回一个取消函数，组件卸载时调用可以停止输出。
 */
export function streamChat({ message, token, onChunk, onDone, onError }) {
  if (USE_MOCK) return mockStream({ message, onChunk, onDone })

  const controller = new AbortController()

  ;(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          satoken: token || ''
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      })

      if (!response.ok || !response.body) {
        throw new Error(`AI 接口返回 ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const text = line.trim()
          if (!text.startsWith('data:')) continue
          const payload = text.slice(5).trim()
          if (!payload || payload === '[DONE]') continue
          try {
            const json = JSON.parse(payload)
            onChunk(json.content || json.delta || json.text || '')
          } catch {
            onChunk(payload)
          }
        }
      }
      onDone()
    } catch (error) {
      if (error.name === 'AbortError') return
      onError(error)
    }
  })()

  return () => controller.abort()
}

function mockStream({ message, onChunk, onDone }) {
  const answer = pickAnswer(message)
  let index = 0
  let cancelled = false
  let timer = null

  const tick = () => {
    if (cancelled) return
    const step = 1 + Math.floor(Math.random() * 3)
    onChunk(answer.slice(index, index + step))
    index += step
    if (index >= answer.length) {
      onDone()
      return
    }
    timer = setTimeout(tick, 24)
  }

  timer = setTimeout(tick, 320)

  return () => {
    cancelled = true
    clearTimeout(timer)
  }
}
