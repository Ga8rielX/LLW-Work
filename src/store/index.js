import { createStore } from 'vuex'
import { normalizeUser } from '../utils/session'

const TOKEN_KEY = 'work-admin-token'
const USER_KEY = 'work-admin-user'

function readUserInfo() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export default createStore({
  state: {
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: readUserInfo(),
    sidebarCollapsed: false
  },
  getters: {
    isLogged: state => Boolean(state.token),
    roleCode: state => (state.userInfo && state.userInfo.roleCode) || 'member',
    permissions: state => (state.userInfo && state.userInfo.permissions) || [],
    displayName: state =>
      (state.userInfo && (state.userInfo.name || state.userInfo.account)) || '未登录'
  },
  mutations: {
    setSession(state, result) {
      state.token = result.tokenValue
      state.userInfo = normalizeUser(result.user || {})
      localStorage.setItem(TOKEN_KEY, state.token)
      localStorage.setItem(USER_KEY, JSON.stringify(state.userInfo))
    },
    setUserInfo(state, user) {
      state.userInfo = normalizeUser(user)
      localStorage.setItem(USER_KEY, JSON.stringify(state.userInfo))
    },
    setToken(state, value) {
      state.token = value
      localStorage.setItem(TOKEN_KEY, value)
    },
    clearUserInfo(state) {
      state.token = ''
      state.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    }
  }
})
