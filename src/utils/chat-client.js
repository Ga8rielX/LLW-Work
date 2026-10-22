const USE_MOCK = process.env.VUE_APP_USE_MOCK !== 'false'
const WS_BASE = process.env.VUE_APP_WS_BASE_URL || 'ws://127.0.0.1:8080'

const CHANNEL_NAME = 'work-admin-chat'
const HISTORY_KEY = 'work-admin-chat-history'
const MAX_HISTORY = 100

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function writeHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(-MAX_HISTORY)))
}

function buildMessage(user, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    account: user.account,
    name: user.name || user.account,
    content,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
  }
}

/**
 * Mock 群聊：用 BroadcastChannel 在同一浏览器的多个标签页之间互通。
 * 打开两个窗口、分别用 admin / member 登录，就能演示“实时收到别人消息”。
 */
function createMockClient({ user, onMessage, onHistory, onStatus }) {
  let channel = null
  const seen = new Set()

  return {
    connect() {
      onHistory(readHistory())
      onStatus('connected')
      if (typeof BroadcastChannel === 'undefined') return
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = event => {
        const message = event.data
        if (!message || seen.has(message.id)) return
        seen.add(message.id)
        onMessage(message)
      }
    },
    send(content) {
      const message = buildMessage(user, content)
      seen.add(message.id)
      writeHistory([...readHistory(), message])
      if (channel) channel.postMessage(message)
      return message
    },
    close() {
      if (channel) channel.close()
      channel = null
    }
  }
}

/**
 * 真实 WebSocket 群聊：连不上就退避重连，不阻塞页面。
 * 协议约定：服务端推送 {type:'history', items:[...]} 或单条消息对象。
 */
function createWsClient({ user, onMessage, onHistory, onStatus }) {
  let socket = null
  let stopped = false
  let retry = 0
  let timer = null

  function scheduleReconnect() {
    if (stopped) return
    retry += 1
    const delay = Math.min(3000 * retry, 15000)
    onStatus('reconnecting')
    timer = setTimeout(connect, delay)
  }

  function connect() {
    onStatus('connecting')
    const token = localStorage.getItem('work-admin-token') || ''
    try {
      socket = new WebSocket(`${WS_BASE}/ws/chat?satoken=${encodeURIComponent(token)}`)
    } catch {
      onStatus('error')
      return
    }

    socket.onopen = () => {
      retry = 0
      onStatus('connected')
    }
    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data)
        if (data && data.type === 'history') {
          onHistory(Array.isArray(data.items) ? data.items : [])
          return
        }
        if (data && data.content) onMessage(data)
      } catch {
        /* 忽略非 JSON 帧 */
      }
    }
    socket.onerror = () => onStatus('error')
    socket.onclose = () => {
      onStatus('closed')
      scheduleReconnect()
    }
  }

  return {
    connect,
    send(content) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket 未连接，消息未发送')
      }
      socket.send(JSON.stringify({ content, from: user.account }))
      return buildMessage(user, content)
    },
    close() {
      stopped = true
      clearTimeout(timer)
      if (socket) socket.close()
    }
  }
}

export function createChatClient(handlers) {
  const options = {
    user: handlers.user,
    onMessage: handlers.onMessage || (() => {}),
    onHistory: handlers.onHistory || (() => {}),
    onStatus: handlers.onStatus || (() => {})
  }
  return USE_MOCK ? createMockClient(options) : createWsClient(options)
}

export { USE_MOCK }
