import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '../store'
import mockServer from '../mock/server'

let unauthorizedHandler = () => {}
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

const USE_MOCK = process.env.VUE_APP_USE_MOCK !== 'false'

const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
})

/**
 * Mock 适配器：把请求交给 src/mock/server.js 处理。
 *
 * 为什么不用 MockJS 的 XHR 拦截：MockJS 只能返回 200 的响应体，无法表达
 * 400/401/403/409 这些课件里必须验证的状态码。所以这里改用 axios 自定义
 * adapter，仍然用 MockJS 的 Random 生成种子数据，行为与真实后端一致。
 * 想接课件里的真实后端，把 .env.development 的 VUE_APP_USE_MOCK 改成 false 即可。
 */
function mockAdapter(config) {
  return mockServer(config).then(({ status = 200, data = null }) => {
    // 演示用：Mock 请求不会出现在 Network 面板，这里打到 Console，方便讲解请求链路
    if (process.env.NODE_ENV !== 'production') {
      const method = String(config.method || 'get').toUpperCase()
      const params = config.params && Object.keys(config.params).length
        ? ` ${JSON.stringify(config.params)}`
        : ''
      console.debug(`[mock] ${method} ${config.url}${params} → ${status}`)
    }

    const response = {
      data,
      status,
      statusText: String(status),
      headers: {},
      config,
      request: {}
    }
    if (status >= 200 && status < 300) return response

    const error = new axios.AxiosError(
      `Request failed with status code ${status}`,
      status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
      config,
      {},
      response
    )
    throw error
  })
}

if (USE_MOCK) request.defaults.adapter = mockAdapter

request.interceptors.request.use(config => {
  config.sessionToken = store.state.token
  if (!config.skipAuth && config.sessionToken) {
    // 课件约定：认证头是 satoken，值为 tokenValue，不加 Bearer
    if (typeof config.headers.set === 'function') {
      config.headers.set('satoken', config.sessionToken)
    } else {
      config.headers.satoken = config.sessionToken
    }
  }
  return config
})

function errorMessage(error) {
  let data = error.response && error.response.data
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      data = null
    }
  }
  return (
    (data && (data.message || data.msg)) ||
    (error.code === 'ECONNABORTED' ? '请求超时，请重试' : '') ||
    (!error.response ? '网络连接失败，请检查接口地址' : '') ||
    `请求失败（${error.response && error.response.status}）`
  )
}

request.interceptors.response.use(
  response => response.data,
  error => {
    const status = error.response && error.response.status
    error.userMessage = errorMessage(error)

    if (status === 401 && !(error.config && error.config.skipAuth)) {
      // 旧请求的 401 不能清掉后来重新登录拿到的新 Token
      if (error.config && error.config.sessionToken === store.state.token) {
        if (store.state.token) ElMessage.error('登录已失效，请重新登录')
        store.commit('clearUserInfo')
        unauthorizedHandler()
      }
    } else if (!(error.config && error.config.silentError)) {
      ElMessage.error(error.userMessage)
    }
    return Promise.reject(error)
  }
)

export { USE_MOCK }
export default request
