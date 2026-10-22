# work-admin 后续接口对接课件

> 2026-10-20｜按 `/Users/nzy/Desktop/名称/work-admin` 当前代码续讲。后端 `4fd4243`，地址 `http://118.25.25.164:8080`。沿用 Vue 3、JavaScript、Options API、Vuex、Element Plus。

## 目前已经做到这里

| 代码位置 | 当前进度 |
| --- | --- |
| Login.vue | 已调用真实登录，映射 account/passwd，保存 Token 后跳转 |
| request.js / store | 已有 satoken、localStorage、401 清理与跳转 |
| Layout.vue | 已调用退出接口 |
| User.vue / api/user.js | 已接列表、详情、新增、编辑、删除和翻页；搜索只是当前页 filter |
| api/auth.js | registerApi、getCurrentUser 已封装，页面尚未使用 |
| router / 页面 | 仅登录、仪表盘、用户管理；没有权限守卫、角色、菜单、群聊页面 |
| api/message.js | 仍是旧版纯文本调用，尚未接 SSE；仪表盘仍是静态教学数据 |

**下节课从第 1 节“用户后端搜索”开始。** 登录、退出、用户基础 CRUD 不再重讲。后面依次接权限与注册 → 角色 → 菜单 → 群聊；AI 暂未配密钥，放最后。

课前只需：准备可管理用户的账号（admin 使用 demo 原有密码），启动现有前端。普通 member 默认不能管理用户。讲义中 ID 均取实际返回值，操作自己创建的课堂记录。

正文按“改哪里 → 怎么改 → 验收”推进。新文件的完整代码可展开查看；已经完成的页面只写增量修改，保留原样式。

## 第 1 节：把当前页筛选改成后端搜索

### 1. 修改 src/api/user.js 的 getUserList

只替换这一行，其他四个用户方法保留：

```javascript
export const getUserList = (page = 1, keyword = '') =>
  request.get('/api/users', { params: { page, keyword } })
```

### 2. 修改 User.vue 的 loadUsers

保留现有 loading、分页回退和错误处理，只给两次查询都加上 appliedKeyword：

```javascript
async loadUsers(page = this.page) {
  this.loading = true
  try {
    let result = await getUserList(page, this.appliedKeyword)
    const lastPage = Math.max(1, result.totalPages)
    if (page > lastPage) {
      result = await getUserList(lastPage, this.appliedKeyword)
    }
    this.items = result.items
    this.page = result.page
    this.total = result.total
    return true
  } catch {
    return false
  } finally {
    this.loading = false
  }
}
```

### 3. 替换搜索和翻页方法

resetSearch 仍只重置变量，供你已有的保存/删除流程使用。重置按钮改用新方法 handleResetSearch，避免保存后重复查列表。

```javascript
handleSearch() {
  if (this.busy) return
  this.appliedKeyword = this.keyword.trim()
  this.loadUsers(1)
},
resetSearch() {
  this.keyword = ''
  this.appliedKeyword = ''
},
handleResetSearch() {
  if (this.busy) return
  this.resetSearch()
  this.loadUsers(1)
},
handlePageChange(page) {
  if (this.busy) return
  this.loadUsers(page)
}
```

### 4. 修改模板

- 删除 computed 中的 tableData，保留 busy 和 dialogTitle。
- 表格 `:data="tableData"` 改为 `:data="items"`。
- 搜索框加 `maxlength="100"`，placeholder 改为“搜索全部用户的姓名或账号”。
- 搜索按钮文字改成“搜索”，仍调用 handleSearch。
- 重置按钮改成 `@click="handleResetSearch"`。
- 提示文字改为“每页 20 条；搜索、总数和分页均由服务器返回”。空状态改成“没有符合条件的用户”。

### 验收

搜索时 Network 出现 `GET /api/users?page=1&keyword=...`；翻页保留 keyword；重置回第 1 页。即使数据库不满 20 条，也要检查请求参数，不能只看界面结果。

## 第 2 节：补权限、注册入口和用户角色绑定

按下面顺序修改共享文件。这一节完成后，才进入角色、菜单等新页面。

### 1. 改为同源开发代理

当前前端环境变量直指公网，vue.config.js 只有端口设置。后续 WS 需要同源代理，因此在现有开发环境文件中将 API_BASE_URL 改成 `/`，添加 BACKEND_TARGET；不要留下同名变量的另一份旧配置。

```dotenv
VUE_APP_API_BASE_URL=/
VUE_APP_BACKEND_TARGET=http://118.25.25.164:8080
```

<details>
<summary>vue.config.js：完整参考代码</summary>

文件：`vue.config.js`。下面是这个文件的完整内容。

```javascript
const { defineConfig } = require('@vue/cli-service')
const backend = process.env.VUE_APP_BACKEND_TARGET || 'http://118.25.25.164:8080'
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    proxy: {
      '/api': { target: backend, changeOrigin: true, timeout: 240000, proxyTimeout: 240000 },
      '/ws/chat': {
        target: backend, ws: true, changeOrigin: true,
        headers: { Origin: new URL(backend).origin }
      }
    }
  }
})
```

</details>

保存配置后重启 `npm run serve`。浏览器请求 `http://localhost:8081/api/...`，由开发服务器转到腾讯云。现有依赖够用，不再安装包。

### 2. 新增权限 API

`src/api/auth.js` 已有四个方法，继续使用，不重写。新增 access.js，后面的角色、菜单和用户绑定共用它。

<details>
<summary>src/api/access.js：完整参考代码</summary>

文件：`src/api/access.js`。下面是这个文件的完整内容。

```javascript
import request from './request'
export const getAccess = () => request.get('/api/auth/access')
export const getRoles = () => request.get('/api/roles')
export const getRoleOptions = () => request.get('/api/roles/options')
export const createRole = data => request.post('/api/roles', data)
export const updateRole = (id, data) => request.put(`/api/roles/${id}`, data)
export const deleteRole = id => request.delete(`/api/roles/${id}`)
export const getRolePermissions = id => request.get(`/api/roles/${id}/permissions`)
export const saveRolePermissions = (id, menuIds) => request.put(`/api/roles/${id}/permissions`, { menuIds })
export const getPermissionTree = () => request.get('/api/menus/permission-tree')
export const getMenus = () => request.get('/api/menus')
export const createMenu = data => request.post('/api/menus', data)
export const updateMenu = (id, data) => request.put(`/api/menus/${id}`, data)
export const deleteMenu = id => request.delete(`/api/menus/${id}`)
export const bindUserRole = (id, roleId) => request.put(`/api/users/${id}/role`, { roleId })
```

</details>

### 3. Store 获取当前用户和权限

替换 store/index.js：保留已有会话能力，增加 access、can、refreshAccess。权限来自 `/api/auth/access`，不能靠账号名判断。此版本同时迁移旧 token/userInfo 缓存，并同步其他标签页退出。

<details>
<summary>src/store/index.js：完整参考代码</summary>

文件：`src/store/index.js`。下面是这个文件的完整内容。

```javascript
import { createStore } from 'vuex'
const KEY = 'work-admin.session.v2'
function readSession() {
  try {
    const saved = localStorage.getItem(KEY)
    const value = saved === null
      ? { token: localStorage.getItem('token'), user: JSON.parse(localStorage.getItem('userInfo') || 'null') }
      : JSON.parse(saved)
    return value && typeof value.token === 'string' && value.token
      ? value : { token: '', user: null }
  } catch { return { token: '', user: null } }
}
function persist(state) {
  localStorage.setItem(KEY, JSON.stringify(state.token ? { token: state.token, user: state.userInfo } : null))
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}
const session = readSession()
const emptyAccess = () => ({ role: null, permissions: [], menus: [] })
export default createStore({
  state: { token: session.token, userInfo: session.user, access: emptyAccess() },
  getters: {
    can: state => permission => state.access.permissions.includes('*') || state.access.permissions.includes(permission)
  },
  mutations: {
    setSession(state, result) {
      state.token = result.tokenValue; state.userInfo = result.user
      state.access = emptyAccess(); persist(state)
    },
    setUserInfo(state, user) { state.userInfo = user; persist(state) },
    setAccess(state, access) { state.access = access },
    clearUserInfo(state) {
      state.token = ''; state.userInfo = null; state.access = emptyAccess(); persist(state)
    }
  },
  actions: {
    async refreshAccess({ state, commit }) {
      const token = state.token
      // 延迟导入，避免 store、request、api 初始化时相互依赖。
      const [{ getAccess }, { getCurrentUser }] = await Promise.all([import('../api/access'), import('../api/auth')])
      const [access, user] = await Promise.all([getAccess(), getCurrentUser()])
      if (token !== state.token) throw new Error('登录账号已变更')
      commit('setAccess', access); commit('setUserInfo', user)
      return access
    }
  }
})
export function installSessionSync(store) {
  const synchronize = () => {
    if (readSession().token !== store.state.token) window.location.reload()
  }
  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && (event.key === KEY || event.key === null)) synchronize()
  })
  window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload() })
}
```

</details>

### 4. 更新请求封装

替换 request.js：继续自动带 satoken，401 才清会话；403 只提示。新增 expireSession 供 SSE 共用，并拒绝旧账号请求的响应写回新会话。

<details>
<summary>src/api/request.js：完整参考代码</summary>

文件：`src/api/request.js`。下面是这个文件的完整内容。

```javascript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '../store'
let unauthorizedHandler = () => {}
export function setUnauthorizedHandler(handler) { unauthorizedHandler = handler }
export function expireSession(token) {
  if (token !== store.state.token) return
  store.commit('clearUserInfo'); unauthorizedHandler()
}
const request = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL || '/', timeout: 10000 })
request.interceptors.request.use(config => {
  config.sessionToken = store.state.token
  if (!config.skipAuth && config.sessionToken) config.headers.satoken = config.sessionToken
  return config
})
request.interceptors.response.use(response => {
  if (!response.config.skipAuth && response.config.sessionToken !== store.state.token) {
    return Promise.reject(new Error('已忽略旧账号的响应'))
  }
  return response.data
}, error => {
  const config = error.config || {}
  if (!config.skipAuth && config.sessionToken !== store.state.token) return Promise.reject(error)
  let body = error.response?.data
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
  error.userMessage = body?.message || (error.code === 'ECONNABORTED' ? '请求超时' : '')
    || (!error.response ? '网络连接失败，请检查代理与后端' : `请求失败（${error.response.status}）`)
  if (error.response?.status === 401 && !config.skipAuth) expireSession(config.sessionToken)
  else if (!config.silentError) ElMessage.error(error.userMessage)
  return Promise.reject(error)
})
export default request
```

</details>

### 5. 建立菜单树、导航和无权限页

后端菜单 path 是 HTML 地址，需要映射到已有 Vue 路由；菜单与权限树均按 parentId 组树。

<details>
<summary>src/utils/menu.js：完整参考代码</summary>

文件：`src/utils/menu.js`。下面是这个文件的完整内容。

```javascript
export function toTree(rows, parentId = null) {
  return rows.filter(row => row.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map(row => ({ ...row, children: toTree(rows, row.id) }))
}
// 后端存的是原生 HTML 页面地址，Vue 需要显式映射到已有组件。
export const pageRoutes = {
  '/users.html': '/user', '/roles.html': '/roles', '/menus.html': '/menus',
  '/chat.html': '/chat', '/': '/messages'
}
export function navigation(rows) {
  function convert(node) {
    if (node.type === 'BUTTON') return null
    const children = node.children.map(convert).filter(Boolean)
    if (node.type === 'DIRECTORY') return children.length ? { ...node, children } : null
    const route = pageRoutes[node.path]
    return route ? { ...node, route, children: [] } : null
  }
  return toTree(rows).map(convert).filter(Boolean)
}
```

</details>

<details>
<summary>src/components/NavBranch.vue：完整参考代码</summary>

文件：`src/components/NavBranch.vue`。下面是这个文件的完整内容。

```vue
<template>
  <el-sub-menu v-if="node.type === 'DIRECTORY'" :index="`dir-${node.id}`">
    <template #title>{{ node.name }}</template>
    <NavBranch v-for="child in node.children" :key="child.id" :node="child" />
  </el-sub-menu>
  <el-menu-item v-else :index="node.route">{{ node.name }}</el-menu-item>
</template>
<script>
export default { name: 'NavBranch', props: { node: { type: Object, required: true } } }
</script>
```

</details>

<details>
<summary>src/views/Forbidden.vue：完整参考代码</summary>

文件：`src/views/Forbidden.vue`。下面是这个文件的完整内容。

```vue
<template>
  <el-result icon="warning" title="页面暂时无法访问" sub-title="可能未分配权限，或权限接口暂时不可用。可刷新权限后重试。">
    <template #extra><el-button @click="$router.push('/dashboard')">返回仪表盘</el-button></template>
  </el-result>
</template>
<script>export default { name: 'AccessForbidden' }</script>
```

</details>

### 6. 新增注册页，准备其他页面占位

Register.vue 使用现有 registerApi。注册只提交 name/account/passwd，不允许 roleId；成功已返回 Token，直接 setSession。

先在 src/views 下创建 Roles.vue、Menus.vue、Chat.vue、Messages.vue，每个文件先放：

```vue
<template><el-alert title="后续步骤接入此功能" :closable="false" /></template>
<script>export default { name: 'CoursePlaceholder' }</script>
```

再添加注册页：

<details>
<summary>src/views/Register.vue：完整参考代码</summary>

文件：`src/views/Register.vue`。下面是这个文件的完整内容。

```vue
<template>
  <section style="max-width:400px;margin:60px auto">
    <h2>注册普通用户</h2>
    <el-input v-model="form.name" maxlength="100" placeholder="姓名（选填）" />
    <el-input v-model="form.account" maxlength="100" placeholder="登录账号" />
    <el-input v-model="form.passwd" maxlength="100" type="password" show-password placeholder="登录密码" />
    <el-button type="primary" :loading="busy" @click="register">注册并登录</el-button>
    <router-link to="/login">返回登录</router-link>
  </section>
</template>
<script>
import { registerApi } from '../api/auth'
export default {
  name: 'AccountRegister',
  data: () => ({ form: {name:'',account:'',passwd:''}, busy:false }),
  methods: {
    async register() {
      if(this.busy) return
      if(!this.form.account.trim() || !this.form.passwd.trim()) return this.$message.warning('请填写账号和密码')
      this.busy=true
      try {
        const result=await registerApi({...this.form,account:this.form.account.trim()})
        this.$store.commit('setSession',result)
        await this.$router.replace('/dashboard')
      } catch(error) { this.$message.error(error.userMessage || '注册失败') }
      finally { this.busy=false }
    }
  }
}
</script>
```

</details>

### 7. 替换路由与布局

路由守卫先检查 Token，再 refreshAccess；需要页面权限时调用 can。布局改成权限导航，并提供刷新权限入口。

<details>
<summary>src/router/index.js：完整参考代码</summary>

文件：`src/router/index.js`。下面是这个文件的完整内容。

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store'
import Layout from '../views/Layout.vue'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue') },
    { path: '/register', component: () => import('../views/Register.vue') },
    { path: '/', component: Layout, redirect: '/dashboard', children: [
      { path: 'dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'user', component: () => import('../views/User.vue'), meta: { permission: 'user:read' } },
      { path: 'roles', component: () => import('../views/Roles.vue'), meta: { permission: 'role:read' } },
      { path: 'menus', component: () => import('../views/Menus.vue'), meta: { permission: 'menu:read' } },
      { path: 'messages', component: () => import('../views/Messages.vue'), meta: { permission: 'message:access' } },
      { path: 'chat', component: () => import('../views/Chat.vue'), meta: { permission: 'chat:access' } },
      { path: 'forbidden', component: () => import('../views/Forbidden.vue') }
    ] },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
  ]
})
router.beforeEach(async to => {
  if (['/login','/register'].includes(to.path)) return true
  if (!store.state.token) return '/login'
  try {
    await store.dispatch('refreshAccess')
    if (to.meta.permission && !store.getters.can(to.meta.permission)) return '/forbidden'
  } catch {
    return store.state.token ? (to.path === '/forbidden' ? true : '/forbidden') : '/login'
  }
  return true
})
export default router
```

</details>

<details>
<summary>src/views/Layout.vue：完整参考代码</summary>

文件：`src/views/Layout.vue`。下面是这个文件的完整内容。

```vue
<template>
  <el-container class="layout">
    <el-aside width="220px">
      <h3>工作管理中台</h3>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/dashboard">仪表盘（教学静态数据）</el-menu-item>
        <NavBranch v-for="node in menus" :key="node.id" :node="node" />
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <span>欢迎，{{ user.name || user.account || '用户' }} · {{ $store.state.access.role?.name || '未分配角色' }}</span>
        <div><el-button :loading="refreshing" @click="refresh">刷新权限</el-button>
          <el-button :loading="leaving" @click="logout">退出登录</el-button></div>
      </el-header>
      <el-main><router-view :key="$store.state.token" /></el-main>
    </el-container>
  </el-container>
</template>
<script>
import { logoutApi } from '../api/auth'
import { navigation } from '../utils/menu'
import NavBranch from '../components/NavBranch.vue'
export default {
  name: 'AdminLayout', components: { NavBranch },
  data: () => ({ refreshing: false, leaving: false }),
  computed: {
    user() { return this.$store.state.userInfo || {} },
    menus() { return navigation(this.$store.state.access.menus) }
  },
  methods: {
    async refresh() {
      if (this.refreshing) return
      this.refreshing = true
      try {
        await this.$store.dispatch('refreshAccess')
        if (this.$route.meta.permission && !this.$store.getters.can(this.$route.meta.permission)) await this.$router.replace('/forbidden')
      } catch { /* 请求层提示错误。 */ }
      finally { this.refreshing = false }
    },
    async logout() {
      if (this.leaving) return
      this.leaving = true
      const token = this.$store.state.token
      try { await logoutApi() } catch { /* 无论网络结果如何，都退出本地会话。 */ }
      finally {
        if (token === this.$store.state.token) {
          this.$store.commit('clearUserInfo'); await this.$router.replace('/login')
        }
        this.leaving = false
      }
    }
  }
}
</script>
<style scoped>
.layout { min-height:100vh; } h3 { padding:16px; }
.el-header { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #ddd; }
.el-aside { border-right:1px solid #ddd; } .el-main { background:#f6f8fb; }
</style>
```

</details>

### 8. main.js 与 Login.vue 只做小改

main.js 将原 Store 导入改为：

```javascript
import store, { installSessionSync } from './store'
```

在 `const app = createApp(App)` 前加：

```javascript
installSessionSync(store)
```

原有 Element Plus、图标注册、setUnauthorizedHandler 和 app.use 保留。

Login.vue 的 login() 已接好，不再改。将模板中未定义的 remember checkbox 改成“登录状态保存在当前浏览器”，并在登录按钮下加注册入口：

```html
<router-link to="/register">注册新账号</router-link>
```

### 9. 在现有 User.vue 上增加角色功能

不替换已经完成的 CRUD。script 顶部新增：

```javascript
import { getRoleOptions, bindUserRole } from '../api/access'
```

data 返回对象增加：

```javascript
roleOptions: [], roleVisible: false, roleUser: null,
roleId: null, roleSaving: false
```

computed.busy 原表达式最后加 `|| this.roleSaving`。methods 新增以下方法：

```javascript
can(permission) {
  return this.$store.getters.can(permission)
},
async openRole(row) {
  if (this.busy) return
  this.loading = true
  try {
    this.roleOptions = await getRoleOptions()
    this.roleUser = row
    this.roleId = this.roleOptions.some(r => r.id === row.roleId)
      ? row.roleId : null
    this.roleVisible = true
  } catch {
    // 请求层显示错误。
  } finally {
    this.loading = false
  }
},
async saveRole() {
  if (this.busy || !this.roleId) return
  this.roleSaving = true
  try {
    const userId = this.roleUser.id
    await bindUserRole(userId, this.roleId)
    this.roleVisible = false
    this.$message.success('角色已更新')
    if (userId === this.$store.state.userInfo?.id) {
      await this.$store.dispatch('refreshAccess')
      if (!this.can('user:read')) {
        await this.$router.replace('/forbidden')
        return
      }
    }
    await this.loadUsers()
  } catch {
    // 失败保留弹窗；不显示成功。
  } finally {
    this.roleSaving = false
  }
}
```

表格增加角色列，操作列宽度调整到能容纳四个按钮：

```html
<el-table-column prop="roleName" label="角色" min-width="130" />
```

现有新增、编辑、删除按钮分别加上：

```html
v-if="can('user:create')"
v-if="can('user:update')"
v-if="can('user:delete')"
```

在操作列 `#default="{ row }"` 中新增角色按钮：

```html
<el-button v-if="can('user:assign-role')" link
  :disabled="busy" @click="openRole(row)">绑定角色</el-button>
```

在现有 el-card 内、两个原有弹窗之后新增：

```html
<el-dialog v-model="roleVisible" title="替换用户角色"
  :show-close="!roleSaving" :close-on-click-modal="!roleSaving"
  :close-on-press-escape="!roleSaving">
  <p>账号：{{ roleUser?.account }}</p>
  <el-select v-model="roleId" :disabled="roleSaving" placeholder="选择角色">
    <el-option v-for="role in roleOptions" :key="role.id"
      :label="role.name" :value="role.id" />
  </el-select>
  <template #footer>
    <el-button :disabled="roleSaving" @click="roleVisible=false">取消</el-button>
    <el-button type="primary" :loading="roleSaving" @click="saveRole">保存</el-button>
  </template>
</el-dialog>
```

新增用户先使用默认普通角色，再通过绑定弹窗调整。若要在新增表单中选初始角色，可给 addUser 的 body 加 roleId；此时还需要 user:assign-role 权限。现有编辑方法省略 roleId，继续保留原角色。

### 验收

- 管理员能看到授权菜单；普通用户不能手输 `/user` 越权进入。
- 注册后能登录，普通账号没有自动获得用户管理权限。
- 用户列表显示 roleName，绑定角色成功为 204；权限改变后刷新权限。
- 一个标签页退出后，另一个同源标签页也退出；403 不清 Token。

## 第 3 节：角色管理与权限树

1. 把 Roles.vue 占位内容替换为下方代码。
2. 先接 GET /api/roles，显示完整数组；角色筛选在前端完成。
3. 接新增、修改和删除，code 使用学号前缀避免重复。
4. 授权弹窗同时读取菜单平铺节点与角色已有菜单 ID，组树后 setCheckedKeys 回显。
5. 保存 `{menuIds:[...]}`，成功 204；后端会自动补齐祖先节点。

<details>
<summary>src/views/Roles.vue：完整参考代码</summary>

文件：`src/views/Roles.vue`。下面是这个文件的完整内容。

```vue
<template>
  <section>
    <h2>角色管理</h2>
    <el-space wrap>
      <el-input v-model="keyword" placeholder="筛选已加载的全部角色" />
      <el-button :disabled="busy" @click="load">刷新</el-button>
      <el-button v-if="can('role:create')" :disabled="busy" @click="open()">新增角色</el-button>
    </el-space>
    <el-table v-loading="busy" :data="filtered" row-key="id">
      <el-table-column prop="name" label="角色名" />
      <el-table-column prop="code" label="编码" />
      <el-table-column prop="userCount" label="绑定用户数" />
      <el-table-column label="状态"><template #default="{row}">{{ row.enabled ? '启用' : '停用' }}</template></el-table-column>
      <el-table-column label="操作" width="260"><template #default="{row}">
        <el-button v-if="can('role:update')" link :disabled="busy" @click="open(row)">编辑</el-button>
        <el-button v-if="can('role:grant')" link :disabled="busy || row.code==='super_admin'" @click="openGrant(row)">分配权限</el-button>
        <el-button v-if="can('role:delete')" link type="danger" :disabled="busy || row.builtin || row.userCount>0" @click="remove(row)">删除</el-button>
      </template></el-table-column>
    </el-table>
    <el-dialog v-model="visible" title="角色资料" :show-close="!busy">
      <el-form label-width="100px" @submit.prevent>
        <el-form-item label="角色名"><el-input v-model="form.name" maxlength="100" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="form.code" :disabled="form.builtin" maxlength="64" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" maxlength="255" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" :disabled="form.builtin" /></el-form-item>
      </el-form>
      <template #footer><el-button :loading="busy" @click="save">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="grantVisible" :title="`权限：${grantRole?.name || ''}`" :show-close="!busy">
      <p>独立勾选节点；保存后后端会补齐按钮所属页面和上级目录。空选表示清空授权。</p>
      <el-tree ref="tree" :data="tree" node-key="id" :props="{label:'name',children:'children'}"
        show-checkbox check-strictly default-expand-all />
      <template #footer><el-button :loading="busy" @click="saveGrant">保存权限</el-button></template>
    </el-dialog>
  </section>
</template>
<script>
import { getRoles, createRole, updateRole, deleteRole, getRolePermissions, saveRolePermissions, getPermissionTree } from '../api/access'
import { toTree } from '../utils/menu'
export default {
  name: 'RoleManagement',
  data: () => ({ rows: [], keyword: '', busy: false, visible: false, form: {}, grantVisible: false, grantRole: null, tree: [] }),
  computed: { filtered() { const k=this.keyword.trim().toLowerCase(); return this.rows.filter(r=>`${r.name} ${r.code}`.toLowerCase().includes(k)) } },
  created() { this.load() },
  methods: {
    can(p) { return this.$store.getters.can(p) },
    async load() { const locked=this.busy; this.busy=true; try { this.rows=await getRoles() } catch {} finally { this.busy=locked } },
    open(row) { this.form=row ? {...row} : {name:'',code:'',description:'',enabled:true}; this.visible=true },
    async refreshAccess() {
      await this.$store.dispatch('refreshAccess')
      if (!this.can('role:read')) await this.$router.replace('/forbidden')
    },
    async save() {
      if(this.busy) return
      if(!this.form.name.trim() || !/^[a-zA-Z][a-zA-Z0-9_:-]{0,63}$/.test(this.form.code)) return this.$message.warning('填写角色名；编码以英文字母开头')
      this.busy=true
      try {
        const {name,code,description,enabled}=this.form
        if(this.form.id) await updateRole(this.form.id,{name,code,description,enabled})
        else await createRole({name,code,description,enabled})
        this.visible=false; await this.load(); await this.refreshAccess()
      } catch {} finally { this.busy=false }
    },
    async remove(row) {
      if(this.busy) return
      this.busy=true
      try { await this.$confirm(`删除角色 ${row.name}？`,'提示'); await deleteRole(row.id); await this.load() }
      catch {} finally { this.busy=false }
    },
    async openGrant(row) {
      if(this.busy) return
      this.busy=true
      try {
        const [nodes,ids]=await Promise.all([getPermissionTree(),getRolePermissions(row.id)])
        this.tree=toTree(nodes); this.grantRole=row; this.grantVisible=true
        await this.$nextTick(); this.$refs.tree.setCheckedKeys(ids)
      } catch {} finally { this.busy=false }
    },
    async saveGrant() {
      if(this.busy) return
      this.busy=true
      try {
        await saveRolePermissions(this.grantRole.id,this.$refs.tree.getCheckedKeys())
        this.grantVisible=false; await this.refreshAccess(); this.$message.success('授权已保存')
      } catch {} finally { this.busy=false }
    }
  }
}
</script>
```

</details>

验收：创建“用户只读”角色，只授予 user:read，绑定到自己的测试用户；该账号可以查看，但不能新增/编辑/删除。已绑定用户的角色不能删，内置角色不能删或停用。

## 第 4 节：菜单与按钮权限

1. 把 Menus.vue 替换为下方代码，读取 GET /api/menus 平铺数组并组树。
2. 创建“目录 → 页面 → 按钮”；目录和按钮 path 为空，页面 path 使用 `/xxx.html`。
3. 页面/按钮填写唯一 permission，如 example:read；目录不填 permission。
4. 练习改名、排序、启停；删除从叶子到父节点进行。

新增菜单只增加配置，需要实际 Vue 组件、router 和 pageRoutes 映射才会出现可访问业务页。

<details>
<summary>src/views/Menus.vue：完整参考代码</summary>

文件：`src/views/Menus.vue`。下面是这个文件的完整内容。

```vue
<template>
  <section>
    <h2>菜单与按钮权限</h2>
    <el-space>
      <el-button :disabled="busy" @click="load">刷新</el-button>
      <el-button v-if="can('menu:create')" :disabled="busy" @click="open()">新增节点</el-button>
    </el-space>
    <el-table v-loading="busy" :data="tree" row-key="id" default-expand-all>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="path" label="后端页面路径" />
      <el-table-column prop="permission" label="权限标识" />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="操作" width="150"><template #default="{row}">
        <el-button v-if="can('menu:update')" link :disabled="busy" @click="open(row)">编辑</el-button>
        <el-button v-if="can('menu:delete')" link type="danger" :disabled="busy || row.builtin || row.children.length>0" @click="remove(row)">删除</el-button>
      </template></el-table-column>
    </el-table>
    <el-dialog v-model="visible" title="菜单节点" :show-close="!busy">
      <el-form label-width="110px" @submit.prevent>
        <el-form-item label="名称"><el-input v-model="form.name" maxlength="100" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.type" :disabled="form.builtin" @change="typeChanged">
          <el-option label="目录" value="DIRECTORY" /><el-option label="页面" value="MENU" /><el-option label="按钮" value="BUTTON" />
        </el-select></el-form-item>
        <el-form-item label="上级"><el-select v-model="form.parentId" clearable :disabled="form.builtin" placeholder="清空为根节点">
          <el-option v-for="m in parents" :key="m.id" :label="`${m.name}（${m.type}）`" :value="m.id" />
        </el-select></el-form-item>
        <el-form-item v-if="form.type==='MENU'" label="页面路径"><el-input v-model="form.path" :disabled="form.builtin" maxlength="200" placeholder="/example.html" /></el-form-item>
        <el-form-item v-if="form.type!=='DIRECTORY'" label="权限标识"><el-input v-model="form.permission" :disabled="form.builtin" maxlength="100" placeholder="example:read" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" :max="9999" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" :disabled="form.builtin" /></el-form-item>
      </el-form>
      <p>内置节点只支持名称、排序。新增业务菜单后仍需编写组件、映射路由和后端接口。</p>
      <template #footer><el-button :loading="busy" @click="save">保存</el-button></template>
    </el-dialog>
  </section>
</template>
<script>
import { getMenus, createMenu, updateMenu, deleteMenu } from '../api/access'
import { toTree } from '../utils/menu'
export default {
  name: 'MenuManagement',
  data: () => ({ rows: [], busy: false, visible: false, form: {} }),
  computed: {
    tree() { return toTree(this.rows) },
    parents() {
      const forbidden=new Set(this.form.id ? [this.form.id] : [])
      let previous=-1
      while(previous!==forbidden.size) {
        previous=forbidden.size
        this.rows.forEach(m=>{ if(forbidden.has(m.parentId)) forbidden.add(m.id) })
      }
      const type=this.form.type==='BUTTON' ? 'MENU' : 'DIRECTORY'
      return this.rows.filter(m=>m.type===type && !forbidden.has(m.id))
    }
  },
  created() { this.load() },
  methods: {
    can(p) { return this.$store.getters.can(p) },
    async load() { const locked=this.busy; this.busy=true; try { this.rows=await getMenus() } catch {} finally { this.busy=locked } },
    open(row) {
      this.form=row ? {...row} : {name:'',type:'DIRECTORY',parentId:null,path:null,permission:null,sortOrder:0,enabled:true}
      this.visible=true
    },
    typeChanged() { this.form.parentId=null; this.form.path=null; this.form.permission=null },
    async changed() {
      this.visible=false; await this.load(); await this.$store.dispatch('refreshAccess')
      if(!this.can('menu:read')) await this.$router.replace('/forbidden')
    },
    async save() {
      if(this.busy) return
      if(!this.form.name.trim()) return this.$message.warning('请输入节点名称')
      this.busy=true
      try {
        const {name,type,sortOrder,enabled}=this.form
        const body={name,type,sortOrder,enabled,parentId:this.form.parentId || null,
          path:type==='MENU' ? this.form.path : null,
          permission:type==='DIRECTORY' ? null : this.form.permission}
        if(this.form.id) await updateMenu(this.form.id,body); else await createMenu(body)
        await this.changed()
      } catch {} finally { this.busy=false }
    },
    async remove(row) {
      if(this.busy) return
      this.busy=true
      try { await this.$confirm(`删除 ${row.name}？关联授权也会清理。`,'提示'); await deleteMenu(row.id); await this.changed() }
      catch {} finally { this.busy=false }
    }
  }
}
</script>
```

</details>

验收：层级合法、父节点正确，根 parentId=null；有子节点不能删；内置菜单只改名称与排序。停用分支后，其业务权限同步失效。

## 第 5 节：群聊 HTTP、实时消息与保存状态

### 1. 先接四个 HTTP 接口

群列表每批最多 50 条，afterId 用最后一个群 ID；历史最多 100 条，用 nextAfterId 继续到 hasMore=false。

<details>
<summary>src/api/chat.js：完整参考代码</summary>

文件：`src/api/chat.js`。下面是这个文件的完整内容。

```javascript
import request from './request'
export const getGroups = (afterId = 0) => request.get('/api/groups', { params: { afterId } })
export const createGroup = name => request.post('/api/groups', { name })
export const joinGroup = id => request.post(`/api/groups/${id}/join`)
export const getHistory = (id, afterId = 0) => request.get(`/api/groups/${id}/messages`, { params: { afterId } })
```

</details>

### 2. 按顺序连接 WebSocket

```text
连接同源 /ws/chat → auth → ready
→ HTTP 入群（创建者已自动加入）
→ subscribe → subscribed
→ 读取历史并合并实时消息 → send
```

连接后 10 秒内发送 auth 首帧，Token 不放 URL。开发时使用第 2 节代理，不直连跨源 WS。

```json
{"type":"auth","token":"实际 tokenValue"}
{"type":"subscribe","groupId":10,"requestId":"select_10"}
{"type":"send","groupId":10,"content":"大家好","clientMessageId":"s01_msg_001","requestId":"send_001"}
```

每条 JSON 是单独一帧；groupId 取实际返回值。没有 HTTP 的 POST /api/groups/{id}/messages，发送必须使用 WS send。

### 3. 先理解状态，再放入完整页面

| 状态/事件 | 含义 |
| --- | --- |
| sending | 本地点击发送，尚未确认 |
| ack / pending | 服务端已接收，正在等待数据库保存 |
| saved | 已提交数据库，有消息 id |
| save_failed / failed | 保存重试仍失败，可以同编号重试 |

使用 `groupId + senderId + clientMessageId` 合并消息、ack、saved 和历史。保存前 id=null，不能用它去重；saved 不能被迟到的 pending 降级。

<details>
<summary>src/utils/chat.js：完整参考代码</summary>

文件：`src/utils/chat.js`。下面是这个文件的完整内容。

```javascript
let serial = 0
export const messageId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${++serial}`
export const messageKey = m => `${m.groupId}:${m.senderId}:${m.clientMessageId}`
export function mergeMessages(rows, incoming) {
  const key=messageKey(incoming), old=rows.find(m=>messageKey(m)===key)
  const rank={ sending:0, pending:1, failed:2, saved:3 }
  // 已保存状态不可被迟到的 pending/failed 覆盖。
  if(old && rank[old.deliveryStatus]>rank[incoming.deliveryStatus]) return rows
  const next=old ? rows.map(m=>messageKey(m)===key ? {...m,...incoming} : m) : [...rows,incoming]
  return next.sort((a,b)=> {
    if(a.id!=null && b.id!=null) return a.id-b.id
    if(a.id!=null) return -1
    if(b.id!=null) return 1
    return (a.sentAt || '').localeCompare(b.sentAt || '')
  })
}
```

</details>

<details>
<summary>src/views/Chat.vue：完整参考代码</summary>

文件：`src/views/Chat.vue`。下面是这个文件的完整内容。

```vue
<template>
  <section>
    <h2>群组聊天</h2>
    <el-alert :title="notice || status" :closable="false" />
    <el-space wrap>
      <el-input v-model="groupName" maxlength="100" placeholder="新群名称" />
      <el-button :disabled="groupBusy" @click="create">创建群组</el-button>
      <el-button :disabled="groupBusy" @click="loadGroups(true)">刷新群组</el-button>
      <el-button v-if="hasMoreGroups" :disabled="groupBusy" @click="loadGroups(false)">加载更多群组</el-button>
    </el-space>
    <el-select v-model="chosen" placeholder="选择群组，未加入的群会先加入" @change="choose">
      <el-option v-for="g in groups" :key="g.id" :value="g.id" :label="`${g.name} · ${g.memberCount}人 · ${g.joined ? '已加入' : '可加入'}`" />
    </el-select>
    <p v-if="historyLoading">正在补齐历史，完成后可发送…</p>
    <article v-for="m in visibleMessages" :key="keyOf(m)" class="bubble">
      <b>{{ m.senderName || m.senderId }}</b><small> · {{ m.sentAt }}</small>
      <p>{{ m.content }}</p><small>{{ labels[m.deliveryStatus] || m.deliveryStatus }}</small>
      <el-button v-if="m.senderId===userId && m.deliveryStatus==='failed'" :disabled="!canSend" @click="retry(m)">使用原编号重试</el-button>
    </article>
    <el-input v-model="input" type="textarea" :rows="3" maxlength="2000" show-word-limit placeholder="输入消息" @keydown="keydown" />
    <el-button type="primary" :disabled="!canSend || !input.trim()" @click="send">发送</el-button>
    <el-button :disabled="!selected || !ready" @click="subscribe">重新补齐当前群历史</el-button>
  </section>
</template>
<script>
import { getGroups, createGroup, joinGroup, getHistory } from '../api/chat'
import { messageId, messageKey, mergeMessages } from '../utils/chat'
import { expireSession } from '../api/request'
export default {
  name: 'GroupChat',
  data: () => ({ groups: [], cursor: 0, hasMoreGroups: true, groupBusy: false,
    groupName: '', chosen: null, selected: null, input: '', messages: [],
    ready: false, subscribed: false, historyLoading: false, status: '尚未连接', notice: '',
    labels: {sending:'发送中',pending:'已接收，正在保存',saved:'已保存',failed:'未确认或未保存成功，可重试'} }),
  computed: {
    userId() { return this.$store.state.userInfo?.id },
    visibleMessages() { return this.messages.filter(m=>m.groupId===this.selected) },
    canSend() { return this.ready && this.subscribed && !this.historyLoading && !!this.selected }
  },
  created() {
    this.ws=null; this.generation=0; this.selection=0; this.subscription=''
    this.retryCount=0; this.stopped=false; this.timers=new Map(); this.outbox=[]
    this.cacheKey=`work-admin.outbox.${this.userId}`
    try {
      const cached=JSON.parse(sessionStorage.getItem(this.cacheKey) || '[]')
      this.outbox=Array.isArray(cached) ? cached.filter(m=>m.senderId===this.userId && typeof m.content==='string').slice(-100) : []
      this.messages=this.outbox.map(m=>({...m}))
    } catch { this.outbox=[] }
    this.loadGroups(true); this.connect()
  },
  mounted() { window.addEventListener('pagehide',this.shutdown) },
  beforeUnmount() { this.shutdown(); window.removeEventListener('pagehide',this.shutdown) },
  watch: { '$store.state.token'() { this.shutdown() } },
  methods: {
    keyOf:messageKey,
    persist() {
      try { sessionStorage.setItem(this.cacheKey,JSON.stringify(this.outbox)) }
      catch { this.notice='本地缓存不可用，刷新后未确认消息可能需要手动核对' }
    },
    async loadGroups(reset=true) {
      if(this.groupBusy) return
      this.groupBusy=true
      try {
        const page=await getGroups(reset ? 0 : this.cursor)
        const map=new Map((reset ? [] : this.groups).map(g=>[g.id,g]))
        page.forEach(g=>map.set(g.id,g)); this.groups=[...map.values()]
        if(page.length) this.cursor=page[page.length-1].id; else if(reset) this.cursor=0
        this.hasMoreGroups=page.length===50
      } catch {} finally { this.groupBusy=false }
    },
    async create() {
      const name=this.groupName.trim()
      if(!name || this.groupBusy) return
      this.groupBusy=true
      try {
        const group=await createGroup(name)
        this.groups.push({...group,joined:true,memberCount:1}); this.groupName=''
        this.chosen=group.id; await this.choose(group.id)
      } catch {} finally { this.groupBusy=false }
    },
    async choose(id) {
      const selection=++this.selection
      this.selected=null; this.subscribed=false; this.historyLoading=false; this.notice=''
      try {
        const group=this.groups.find(g=>g.id===id)
        if(!group?.joined) {
          await joinGroup(id)
          if(selection!==this.selection || this.stopped) return
          if(group) { group.joined=true; group.memberCount+=1 }
        }
        if(selection!==this.selection || this.stopped) return
        this.selected=id
        if(this.ready) this.subscribe()
      } catch { if(selection===this.selection) this.notice='加入失败，请重新选择或刷新群列表' }
    },
    write(frame) {
      if(this.ws?.readyState!==WebSocket.OPEN) return false
      this.ws.send(JSON.stringify(frame)); return true
    },
    connect() {
      if(this.stopped || !this.$store.state.token) return
      const generation=++this.generation
      const url=new URL('/ws/chat',window.location.href)
      url.protocol=location.protocol==='https:' ? 'wss:' : 'ws:'
      const socket=new WebSocket(url); this.ws=socket
      this.ready=false; this.subscribed=false; this.status='连接中…'
      this.lastData=Date.now()
      const authTimer=setTimeout(()=>socket.close(),12000)
      socket.onopen=()=> {
        if(generation!==this.generation) return
        this.write({type:'auth',token:this.$store.state.token})
      }
      socket.onmessage=event=> {
        if(generation!==this.generation || this.stopped) return
        this.lastData=Date.now()
        try {
          const frame=JSON.parse(event.data)
          if(frame.type==='ready') {
            clearTimeout(authTimer); this.ready=true; this.retryCount=0; this.status='连接正常'
            clearInterval(this.heartbeat)
            this.heartbeat=setInterval(()=> {
              if(Date.now()-this.lastData>55000) socket.close()
              else this.write({type:'ping'})
            },25000)
            if(this.selected) this.subscribe()
          } else if(frame.type==='subscribed') {
            if(frame.requestId===this.subscription && frame.groupId===this.selected) {
              this.subscribed=true; this.syncHistory(frame.groupId,frame.requestId,generation)
            }
          } else if(['message','ack','saved','save_failed'].includes(frame.type)) {
            this.receive(frame.message)
          } else if(frame.type==='error') this.frameError(frame)
        } catch { this.notice='收到无效消息，请检查后端协议' }
      }
      socket.onerror=()=> { if(generation===this.generation) this.status='连接异常，等待重连' }
      socket.onclose=async event=> {
        clearTimeout(authTimer)
        if(generation!==this.generation || this.stopped) return
        clearInterval(this.heartbeat); this.ready=false; this.subscribed=false
        this.status='连接已断开'
        // 1008 可能是登录或权限失效；先向 HTTP 权限接口核实，避免无限重连。
        if(event.code===1008) {
          try { await this.$store.dispatch('refreshAccess') } catch {}
          if(generation!==this.generation || this.stopped) return
          if(!this.$store.state.token || !this.$store.getters.can('chat:access')) {
            this.notice='登录或群聊权限已失效'; this.stopped=true; return
          }
        }
        const delay=Math.min(1000*2**this.retryCount++,15000)
        this.status=`连接已断开，${delay/1000} 秒后重连`
        this.reconnect=setTimeout(()=>this.connect(),delay)
      }
    },
    subscribe() {
      if(!this.ready || !this.selected) return
      this.subscribed=false; this.historyLoading=true
      this.subscription=messageId()
      this.write({type:'subscribe',groupId:this.selected,requestId:this.subscription})
    },
    async syncHistory(groupId,requestId,generation) {
      this.historyLoading=true
      const current=()=>!this.stopped && this.selected===groupId && this.subscription===requestId && this.generation===generation
      try {
        let cursor=0, more=true
        while(more && current()) {
          const page=await getHistory(groupId,cursor)
          if(!current()) return
          page.items.forEach(m=>this.receive(m))
          if(page.hasMore && page.nextAfterId<=cursor) throw new Error('历史游标没有前进')
          cursor=page.nextAfterId; more=page.hasMore
        }
        if(!current()) return
        // 先核对历史与订阅推送，再重发仍没有确认的草稿；明确失败的草稿等手动重试。
        this.outbox.filter(m=>m.groupId===groupId && m.deliveryStatus==='sending').forEach(m=>this.transmit(m))
        this.notice=''
      } catch { if(current()) { this.subscribed=false; this.notice='历史补齐失败，请点击重新补齐当前群历史' } }
      finally { if(current()) this.historyLoading=false }
    },
    receive(message) {
      if(!message || !message.clientMessageId) return
      this.messages=mergeMessages(this.messages,message)
      const key=messageKey(message)
      clearTimeout(this.timers.get(key)); this.timers.delete(key)
      if(message.senderId===this.userId) {
        this.outbox=this.outbox.filter(m=>messageKey(m)!==key)
        const actual=this.messages.find(m=>messageKey(m)===key)
        if(actual?.deliveryStatus==='failed') this.outbox.push({...actual})
        this.persist()
      }
    },
    frameError(frame) {
      this.notice=frame.message || '消息操作失败'
      if(frame.status===401) { expireSession(this.$store.state.token); this.shutdown(); return }
      if(frame.requestId===this.subscription) { this.subscribed=false; this.historyLoading=false }
      const draft=this.outbox.find(m=>m.clientMessageId===frame.requestId)
      if(draft) this.receive({...draft,deliveryStatus:'failed'})
      if(frame.status===403) {
        this.$store.dispatch('refreshAccess').then(()=> {
          if(!this.$store.getters.can('chat:access')) this.shutdown()
        }).catch(()=>{})
      }
    },
    transmit(message) {
      if(!this.ready) return
      const key=messageKey(message)
      if(!this.write({type:'send',groupId:message.groupId,content:message.content,
        clientMessageId:message.clientMessageId,requestId:message.clientMessageId})) return
      clearTimeout(this.timers.get(key))
      this.timers.set(key,setTimeout(()=> {
        const current=this.messages.find(m=>messageKey(m)===key)
        if(current?.deliveryStatus==='sending') this.receive({...current,deliveryStatus:'failed'})
      },12000))
    },
    keydown(event) {
      if(event.key==='Enter' && !event.shiftKey && !event.isComposing && event.keyCode!==229) { event.preventDefault(); this.send() }
    },
    send() {
      const content=this.input.trim()
      if(!this.canSend || !content || content.length>2000) return
      if(this.outbox.length>=100) return this.$message.warning('请先处理未确认的消息')
      const message={id:null,groupId:this.selected,senderId:this.userId,
        senderName:this.$store.state.userInfo?.name || this.$store.state.userInfo?.account,
        content,clientMessageId:messageId(),sentAt:new Date().toISOString(),deliveryStatus:'sending'}
      this.messages=mergeMessages(this.messages,message)
      this.outbox.push(message); this.persist(); this.input=''; this.transmit(message)
    },
    retry(message) {
      if(!this.canSend) return
      const draft={...message,deliveryStatus:'sending'}
      const key=messageKey(draft)
      this.messages=this.messages.map(m=>messageKey(m)===key ? draft : m)
      this.outbox=this.outbox.filter(m=>messageKey(m)!==key); this.outbox.push(draft)
      this.persist(); this.transmit(draft)
    },
    shutdown() {
      this.stopped=true; ++this.generation; this.ready=false; this.subscribed=false
      clearTimeout(this.reconnect); clearInterval(this.heartbeat)
      this.timers.forEach(timer=>clearTimeout(timer)); this.timers.clear()
      this.ws?.close(); this.ws=null
    }
  }
}
</script>
<style scoped>
.bubble { background:white; border:1px solid #e5e7eb; margin:12px 0; padding:12px; border-radius:8px; }
p { white-space:pre-wrap; overflow-wrap:anywhere; } small { color:#777; }
.el-space, .el-select, .el-textarea { margin:8px 0; }
</style>
```

</details>

### 验收

用两个独立浏览器或浏览器配置登录不同账号：创建/加入同一群，互发、刷新、断网重连、切群；消息不重复、不串群。相同来源的新标签页共享登录态，不能用于双账号测试。

首次入群只能读此前最近 30 条和入群后的消息；历史只返回 saved。ack 不保证异常断电后不丢消息，后端待保存队列在内存。clientMessageId 最多 64 位字母/数字/下划线/短横线，重试保留编号和正文；content 非空，最多 2000 个 UTF-16 单元。

## 第 6 节：AI 对话改为 SSE（密钥配置后实测）

当前 api/message.js 是旧版纯文本调用，需要整体替换。云端暂未配置 AI_API_KEY；先完成流解析和 503 提示，密钥由教师在后端配置后再验收真实回复。

1. 新增 SSE 解析工具：缓冲半帧、按空行切事件，TextDecoder 增量解码。
2. 替换 message.js，使用 Fetch POST，JSON 请求体、satoken 和 Accept: text/event-stream, application/json。
3. Messages.vue 累加 delta；收到 done 且 status=completed 才标为完成。
4. 停止/离页 Abort；失败的半条回复不加入下一轮 history。

<details>
<summary>src/utils/sse.js：完整参考代码</summary>

文件：`src/utils/sse.js`。下面是这个文件的完整内容。

```javascript
// 缓存半条事件；一次网络 read() 可能有半条、整条或多条 SSE 事件。
export function createSseParser(onEvent) {
  let buffer = ''
  return text => {
    buffer += text
    let boundary
    while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
      const frame = buffer.slice(0, boundary.index)
      buffer = buffer.slice(boundary.index + boundary[0].length)
      let event = 'message'
      const data = []
      for (const line of frame.split(/\r?\n/)) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''))
      }
      if (data.length) onEvent(event, JSON.parse(data.join('\n')))
      // 只有冒号注释的心跳帧不触发业务回调。
    }
    if (buffer.length > 2 * 1024 * 1024) throw new Error('流式数据格式异常')
  }
}
export function buildHistory(turns, question) {
  const result = []
  let size = question.length
  const completed = turns.filter(t => t.status === 'completed').slice(-20)
  for (const turn of completed.reverse()) {
    const length = turn.question.length + turn.answer.length
    if (turn.answer.length > 32000 || size + length > 64000) break
    result.unshift({ role: 'user', content: turn.question }, { role: 'assistant', content: turn.answer })
    size += length
  }
  return result
}
```

</details>

<details>
<summary>src/api/message.js：完整参考代码</summary>

文件：`src/api/message.js`。下面是这个文件的完整内容。

```javascript
import store from '../store'
import { expireSession } from './request'
import { createSseParser } from '../utils/sse'
export async function streamMessage(body, { signal, onEvent }) {
  const token = store.state.token
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) abort()
  let timer, reader, timedOut = false, completed = false
  const resetTimer = () => {
    clearTimeout(timer)
    timer = setTimeout(() => { timedOut = true; controller.abort() }, 45000)
  }
  resetTimer()
  try {
    const base = (process.env.VUE_APP_API_BASE_URL || '/').replace(/\/$/, '')
    const response = await fetch(`${base}/api/messages`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream, application/json', satoken: token },
      body: JSON.stringify(body)
    })
    if (token !== store.state.token) throw new Error('登录账号已变更')
    if (!response.ok) {
      if (response.status === 401) expireSession(token)
      const error = await response.json().catch(() => null)
      throw new Error(error?.message || `请求失败（${response.status}）`)
    }
    if (!response.headers.get('Content-Type')?.includes('text/event-stream') || !response.body) throw new Error('后端未返回 SSE，请检查版本')
    const parse = createSseParser((event, data) => {
      if (completed) return
      if (event === 'error') throw new Error(data.message || '生成失败')
      if (event === 'done') {
        if (data.status !== 'completed') throw new Error('回复未完成')
        completed = true
      }
      onEvent(event, data)
    })
    reader = response.body.getReader()
    const decoder = new TextDecoder()
    while (!completed) {
      const { value, done } = await reader.read()
      if (token !== store.state.token) throw new Error('登录账号已变更')
      resetTimer()
      parse(done ? decoder.decode() : decoder.decode(value, { stream: true }))
      if (done) break
    }
    if (!completed) throw new Error('连接中断，回复未完成')
  } catch (error) {
    if (timedOut) throw new Error('45 秒未收到数据，请重试')
    throw error
  } finally {
    clearTimeout(timer); signal.removeEventListener('abort', abort)
    if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock() }
    controller.abort()
  }
}
```

</details>

<details>
<summary>src/views/Messages.vue：完整参考代码</summary>

文件：`src/views/Messages.vue`。下面是这个文件的完整内容。

```vue
<template>
  <section>
    <h2>AI 流式对话</h2>
    <el-alert title="实际模型由后端配置；这里只展示返回的模型标识。未完成的回答不会带入下一轮上下文。" :closable="false" />
    <article v-for="(turn,index) in turns" :key="index" class="turn">
      <b>我：</b><p>{{ turn.question }}</p>
      <b>{{ turn.model || 'AI' }}：</b><p>{{ turn.answer || '等待回复…' }}</p>
      <small>{{ turn.note }}</small>
      <el-button v-if="index===turns.length-1 && ['failed','stopped'].includes(turn.status)" :disabled="busy" @click="generate(turn)">重新生成</el-button>
    </article>
    <el-select v-model="effort" :disabled="busy">
      <el-option v-for="v in ['low','medium','high','xhigh','max']" :key="v" :label="v" :value="v" />
    </el-select>
    <el-input v-model="input" type="textarea" :rows="4" maxlength="2000" show-word-limit
      placeholder="Enter 发送，Shift + Enter 换行" @keydown="keydown" />
    <el-space>
      <el-button type="primary" :disabled="busy || !input.trim()" @click="send">发送</el-button>
      <el-button v-if="busy" @click="stop">停止生成</el-button>
      <el-button :disabled="busy" @click="turns=[]">清空对话</el-button>
    </el-space>
  </section>
</template>
<script>
import { streamMessage } from '../api/message'
import { buildHistory } from '../utils/sse'
export default {
  name: 'AiMessages',
  data: () => ({ turns: [], input: '', effort: 'medium', busy: false }),
  created() { this.controller = null },
  mounted() { window.addEventListener('pagehide', this.stop) },
  beforeUnmount() { this.stop(); window.removeEventListener('pagehide', this.stop) },
  watch: { '$store.state.token'() { this.stop() } },
  methods: {
    stop() { this.controller?.abort() },
    keydown(event) {
      if (event.key==='Enter' && !event.shiftKey && !event.isComposing && event.keyCode!==229) {
        event.preventDefault(); this.send()
      }
    },
    send() {
      const question=this.input.trim()
      if(this.busy || !question || question.length>2000) return
      const turn={ question, answer:'', status:'pending', note:'', model:'', effort:this.effort,
        history:buildHistory(this.turns, question) }
      this.turns.push(turn); this.input=''
      // 取得 Vue 数组中的响应式代理，后续增量修改才能更新视图。
      this.generate(this.turns[this.turns.length-1])
    },
    async generate(turn) {
      if(this.busy) return
      this.busy=true; turn.answer=''; turn.status='pending'; turn.note='正在连接…'
      const controller=new AbortController(); this.controller=controller
      try {
        await streamMessage({message:turn.question,history:turn.history,effort:turn.effort}, {
          signal:controller.signal,
          onEvent:(event,data)=>{
            if(event==='start') { turn.model=data.model; turn.note='AI 正在思考…' }
            if(event==='delta') {
              if(typeof data.text!=='string') throw new Error('文本增量格式错误')
              turn.answer+=data.text; turn.note='正在输出…'
            }
          }
        })
        if(!turn.answer) throw new Error('未收到文本回答')
        turn.status='completed'; turn.note='回复完成'
      } catch(error) {
        const stopped=controller.signal.aborted
        turn.status=stopped ? 'stopped' : 'failed'
        turn.note=stopped ? '已停止' : error.message
      } finally { this.controller=null; this.busy=false }
    }
  }
}
</script>
<style scoped>
.turn { background:white; margin:16px 0; padding:16px; border-radius:8px; }
p { white-space:pre-wrap; overflow-wrap:anywhere; } small { color:#777; }
.el-textarea { margin:12px 0; }
</style>
```

</details>

请求格式：

```json
{
  "message":"继续讲第二点",
  "history":[
    {"role":"user","content":"列三个重点"},
    {"role":"assistant","content":"请求、响应、状态。"}
  ],
  "effort":"medium"
}
```

history 可省略，最多 20 轮已完成问答，成对 user/assistant；当前问题最多 2000、单条历史最多 32000、合计最多 64000 个 UTF-16 单元。effort 为 low/medium/high/xhigh/max。

| SSE 事件 | 页面处理 |
| --- | --- |
| start | 开始生成 |
| delta | 追加 data.text |
| done | completed 才保存为完整问答 |
| error | 显示 data.message，保留半条回答 |

验收：有效登录且有 message:access 时，未配置密钥显示 503；配置后验证中文/表情、多轮、停止、重试。HTTP 200 不代表生成完成，不能直接把网络块当 JSON 事件。

## 待对接接口速查

已完成的登录、退出和用户五个基础接口不再展开。现有请求头仍为 satoken，响应拦截器已返回响应体，不再取 result.data。

| 方法 | 接口 | 参数/响应重点 | 权限 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | name?/account/passwd → 201 会话；不传 roleId | 公开 |
| GET | `/api/auth/me` | 当前用户，增加 roleId/roleName | 登录 |
| GET | `/api/auth/access` | role 对象、permissions 字符串数组、menus 平铺数组 | 登录 |
| PUT | `/api/users/{id}/role` | `{roleId}` → 204，替换单角色 | user:assign-role |
| GET | `/api/roles/options` | 启用角色数组 | user:assign-role |
| GET | `/api/roles` | 角色完整数组，含 userCount/builtin | role:read |
| POST | `/api/roles` | name/code/description?/enabled → 201 | role:create |
| PUT | `/api/roles/{id}` | 同新增字段 → 200 | role:update |
| DELETE | `/api/roles/{id}` | 204；绑定用户时 409 | role:delete |
| GET | `/api/roles/{id}/permissions` | 菜单 ID 数组 | role:grant |
| PUT | `/api/roles/{id}/permissions` | `{menuIds:[]}` → 204 | role:grant |
| GET | `/api/menus/permission-tree` | 目录/页面/按钮平铺数组 | role:grant |
| GET | `/api/menus` | 菜单平铺数组 | menu:read |
| POST | `/api/menus` | parentId/name/type/path/permission/sortOrder/enabled → 201 | menu:create |
| PUT | `/api/menus/{id}` | 同新增字段 → 200 | menu:update |
| DELETE | `/api/menus/{id}` | 204；有子节点时 409 | menu:delete |
| GET | `/api/groups` | afterId=0 → 群数组，含 joined | chat:access |
| POST | `/api/groups` | `{name}` → 201，返回 id/name/ownerId | chat:access |
| POST | `/api/groups/{id}/join` | 无请求体 → 200 成员/历史边界 | chat:access |
| GET | `/api/groups/{id}/messages` | afterId → items/nextAfterId/hasMore | chat:access + 群成员 |
| POST | `/api/messages` | message/history?/effort? → SSE | message:access |
| WS | `/ws/chat` | auth/ready/subscribe/subscribed/send/message/ack/saved/save_failed/error/ping/pong | Token + chat:access + 群成员 |

- roleId、menuIds 都用实际查询结果，不写死。角色编码以英文字母开头，最长 64。
- 角色 name 最长 100、description 最长 255；菜单 name 最长 100、path 最长 200、permission 最长 100，sortOrder=0～9999。
- 204 无响应体；401 才清登录，403 保留会话；409 看冲突原因；AI 503 先看配置。
- 上课排错先看 Method、URL、Payload、状态码；需要教师查日志时提供 X-Request-Id。不要把密码、Token 放进作业。

每节验收通过再提交 Git。普通 HTTP、SSE 与 WebSocket 分开处理；Dashboard 没有对应统计接口，继续保留教学静态数据。

