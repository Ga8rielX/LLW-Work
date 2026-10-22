import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store'
import { getCurrentUser } from '../api/auth'
import { normalizeUser } from '../utils/session'
import Layout from '../views/Layout.vue'
import { layoutChildren } from './routes'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { public: true, title: '注册' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: layoutChildren
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/Forbidden.vue'),
    meta: { public: true, title: '无访问权限' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { public: true, title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

/**
 * 全局前置守卫（课件第 3 课 + 第 9 课）：
 * 1. 没有 Token → 回登录页，并记住来源地址
 * 2. 有 Token 但没有用户信息（刷新页面）→ 用 /api/auth/me 换回来
 * 3. 角色不在 meta.roles 里 → 403
 *
 * 注意：这里只做“界面级”拦截，真正的越权请求必须由后端拒绝。
 */
router.beforeEach(async to => {
  document.title = to.meta.title ? `${to.meta.title} · work-admin` : 'work-admin'

  const token = store.state.token

  if (to.meta.public) {
    // 已登录再访问登录页就直接进后台；注册演示页允许随时查看
    if (token && to.path === '/login') return '/dashboard'
    return true
  }

  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (!store.state.userInfo) {
    try {
      const user = await getCurrentUser()
      store.commit('setUserInfo', normalizeUser(user))
    } catch {
      store.commit('clearUserInfo')
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  const roles = to.meta.roles
  if (roles && !roles.includes(store.getters.roleCode)) {
    return '/403'
  }

  return true
})

export default router
