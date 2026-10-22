# work-admin：现有项目接口对接步骤

> 对接项目：`/Users/nzy/Desktop/名称/work-admin/`  
> 后端：`http://118.25.25.164:8080`  
> 核对日期：2026-10-14。沿用项目已有的 Vue 3、Options API、JavaScript、Vuex、Vue Router、Element Plus。

这份文档按你的现有代码安排修改顺序。每一步写明文件、操作和验证方法，最终覆盖后端全部 **10 个接口**。

## 先看当前项目

| 当前文件 | 已有内容 | 本次操作 |
| --- | --- | --- |
| `src/views/Login.vue` | admin / 123456 模拟登录、模拟 Token | 保留页面样式，替换登录逻辑 |
| `src/views/Layout.vue` | 仪表盘、用户管理菜单、本地退出 | 增加 me 请求、真实退出和消息菜单 |
| `src/views/Dashboard.vue` | 任务、趋势、角色等演示数据 | 标注演示数据；这些图表没有对应的后端接口 |
| `src/store/index.js` | Token 和用户信息缓存 | 增加保存真实登录结果的 mutation |
| `src/router/index.js` | 只有登录和仪表盘路由 | 增加用户、消息、注册路由和登录守卫 |
| `src/main.js` | Element Plus、全部图标已注册 | 接入 401 失效跳转 |
| `src/api/` | 尚不存在 | 新增 4 个请求文件 |
| 用户、注册、消息页面 | 尚不存在 | 新增 User.vue、Register.vue、Messages.vue |

**先完成第 1～11 步，再启动验证。** 路由、页面和请求文件互相引用，中途缺少文件会出现 Module not found。

## 本次要对上的接口

| 序号 | 方法与路径 | 前端位置 | 正常结果 |
| --- | --- | --- | --- |
| 1 | POST `/api/auth/login` | Login.vue 登录按钮 | 200，返回 Token 和用户 |
| 2 | GET `/api/auth/me` | Layout.vue 初始化、刷新当前用户 | 200，返回当前用户 |
| 3 | POST `/api/auth/logout` | Layout.vue 退出按钮 | 204，无响应体 |
| 4 | POST `/api/auth/register` | Register.vue 注册按钮 | 当前云端有效请求返回 403；开放时返回 201 |
| 5 | GET `/api/users?page=1` | User.vue 表格与分页 | 200，分页对象 |
| 6 | GET `/api/users/{id}` | User.vue 详情、编辑回填 | 200，用户对象 |
| 7 | POST `/api/users` | User.vue 新增保存 | 201，用户对象 |
| 8 | PUT `/api/users/{id}` | User.vue 编辑保存 | 200，用户对象 |
| 9 | DELETE `/api/users/{id}` | User.vue 删除确认 | 204，无响应体 |
| 10 | POST `/api/messages` | Messages.vue 发送按钮 | 200，纯文本 |

后端成功响应直接返回对象、字符串或空体，没有统一的 `{ code, data }` 包装。认证请求头是 **satoken**，值为真实登录返回的 **tokenValue**，不加 Bearer。

## 第 1 步：安装 Axios，确定接口地址和开发端口

在项目目录打开终端：

```bash
cd /Users/nzy/Desktop/名称/work-admin
pnpm add axios@1.20.0
```

Vue Router、Vuex、Element Plus 已在 package.json 中，不需要再次安装。此命令会更新 package.json 和 pnpm-lock.yaml。

**新增** `/Users/nzy/Desktop/名称/work-admin/.env`。这个变量会用于开发和生产构建；内容只有公开的接口地址。

```env
VUE_APP_API_BASE_URL=http://118.25.25.164:8080
```

**替换** `/Users/nzy/Desktop/名称/work-admin/vue.config.js`：

```js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081
  }
})
```

课堂统一使用 `http://127.0.0.1:8081/`，当前云端允许这个开发来源。8081 被占用时，停止占用它的开发服务后再启动，避免自动换端口后跨域失败。修改环境变量要重启前端。

## 第 2 步：新增公共请求和接口函数

### 2.1 新增 src/api/request.js

路径：`/Users/nzy/Desktop/名称/work-admin/src/api/request.js`。

它负责接口地址、超时、附带 Token、返回响应内容，以及统一处理错误。失效跳转由 main.js 注入，避免 request.js 与 router 相互导入。

```js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '../store'

let unauthorizedHandler = () => {}
export function setUnauthorizedHandler(handler) { unauthorizedHandler = handler }

const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
})

request.interceptors.request.use(config => {
  config.sessionToken = store.state.token
  if (!config.skipAuth && config.sessionToken) {
    config.headers.satoken = config.sessionToken
  }
  return config
})

function errorMessage(error) {
  let data = error.response?.data
  // messages 使用 text 响应模式；错误响应仍可能是 JSON 字符串。
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { data = null }
  }
  return data?.message
    || (error.code === 'ECONNABORTED' ? '请求超时，请重试' : '')
    || (!error.response ? '网络连接失败，请检查接口地址与跨域配置' : '')
    || `请求失败（${error.response?.status}）`
}

request.interceptors.response.use(
  response => response.data,
  error => {
    const status = error.response?.status
    error.userMessage = errorMessage(error)
    if (status === 401 && !error.config?.skipAuth) {
      // 旧请求的 401 不清除后来重新登录获得的新 Token。
      if (error.config?.sessionToken === store.state.token) {
        if (store.state.token) ElMessage.error('登录已失效，请重新登录')
        store.commit('clearUserInfo')
        unauthorizedHandler()
      }
    } else if (!error.config?.silentError) {
      ElMessage.error(error.userMessage)
    }
    return Promise.reject(error)
  }
)

export default request
```

`skipAuth`、`silentError` 是这个项目自定义的 Axios 配置：登录和注册不带旧 Token，错误交给表单显示；其他接口失败统一提示。

成功拦截器已经返回 `response.data`，页面拿到结果后不要再次读取 `.data`。

### 2.2 新增 src/api/auth.js

路径：`/Users/nzy/Desktop/名称/work-admin/src/api/auth.js`。包含 4 个认证接口。

```js
import request from './request'

export const loginApi = data => request.post('/api/auth/login', data, {
  skipAuth: true, silentError: true
})
export const registerApi = data => request.post('/api/auth/register', data, {
  skipAuth: true, silentError: true
})
export const getCurrentUser = () => request.get('/api/auth/me')
export const logoutApi = () => request.post('/api/auth/logout')
```

### 2.3 新增 src/api/user.js

路径：`/Users/nzy/Desktop/名称/work-admin/src/api/user.js`。包含用户管理的 5 个接口。

```js
import request from './request'

export const getUserList = (page = 1) => request.get('/api/users', { params: { page } })
export const getUser = id => request.get(`/api/users/${id}`)
export const addUser = data => request.post('/api/users', data)
export const editUser = (id, data) => request.put(`/api/users/${id}`, data)
export const deleteUser = id => request.delete(`/api/users/${id}`)
```

### 2.4 新增 src/api/message.js

路径：`/Users/nzy/Desktop/名称/work-admin/src/api/message.js`。

```js
import request from './request'

export const sendMessage = message => request.post('/api/messages', { message }, {
  responseType: 'text',
  headers: { Accept: 'text/plain' }
})
```

消息请求发送 JSON `{ message }`，响应为 text/plain。因此显式设置 `responseType: 'text'`，页面直接显示字符串。

## 第 3 步：让 Vuex 保存真实登录结果

**替换** `/Users/nzy/Desktop/名称/work-admin/src/store/index.js`：

```js
import { createStore } from 'vuex'

function readUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('userInfo')) || null
  } catch {
    localStorage.removeItem('userInfo')
    return null
  }
}

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: readUserInfo()
  },
  mutations: {
    setSession(state, result) {
      state.token = result.tokenValue
      state.userInfo = result.user
      localStorage.setItem('token', result.tokenValue)
      localStorage.setItem('userInfo', JSON.stringify(result.user))
    },
    setToken(state, val) {
      state.token = val
      localStorage.setItem('token', val)
    },
    setUserInfo(state, val) {
      state.userInfo = val
      localStorage.setItem('userInfo', JSON.stringify(val))
    },
    clearUserInfo(state) {
      state.token = ''
      state.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
```

登录返回的结构如下。示例中的 Token 为占位文字，实际使用接口返回值：

```json
{
  "tokenName": "satoken",
  "tokenValue": "实际登录返回的Token",
  "user": {
    "id": 1,
    "name": "教学管理员",
    "account": "admin"
  }
}
```

以后登录成功统一调用 `this.$store.commit('setSession', result)`。用户字段是 id、name、account，原来的 username 并不存在于后端返回中。

## 第 4 步：替换 Login.vue 的模拟登录

文件：`/Users/nzy/Desktop/名称/work-admin/src/views/Login.vue`。

### 4.1 保留 template 和 style，替换整个 script

现有表单依然使用 username、password，在提交时映射成后端要求的 account、passwd。

```vue
<script>
import { loginApi } from '../api/auth'

export default {
  name: 'AdminLogin',
  data() {
    return {
      loading: false,
      loginForm: { username: '', password: '' },
      rules: {
        username: [
          { required: true, whitespace: true, message: '请输入账号', trigger: 'blur' },
          { max: 100, message: '账号最多 100 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, whitespace: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async login() {
      if (this.loading) return
      this.loading = true
      try {
        const valid = await this.$refs.loginFormRef.validate().catch(() => false)
        if (!valid) return
        const result = await loginApi({
          account: this.loginForm.username.trim(),
          passwd: this.loginForm.password
        })
        this.$store.commit('setSession', result)
        this.$message.success('登录成功')
        await this.$router.replace('/dashboard')
      } catch (error) {
        this.$message.error(error.userMessage || '登录失败，请重试')
      } finally {
        this.loading = false
      }
    },
    onForgot() {
      this.$message.info('请联系管理员重置密码')
    }
  }
}
</script>
```

原来的 setTimeout、admin / 123456 条件、固定 admin-token-001 和打印表单的 console.log 都随旧 script 一起移除。密码按原样发送，不做 trim 或前端 MD5。原先“至少 6 位”是模拟登录页的规则，后端登录要求密码非空。

### 4.2 替换 template 中的 login-options 区域

原来的“记住我”没有接入存储策略，本次会话统一由 Vuex 存入 localStorage。替换原来的 `<div class="login-options">...</div>`：

```vue
<div class="login-options">
  <router-link to="/register" class="link">注册接口演示</router-link>
  <a class="link" @click="onForgot">忘记密码？</a>
</div>
```

**本步验证：** 全部文件完成并启动后，用老师分配的真实教学账号登录。在 Network 中看到 POST /api/auth/login，body 为 account、passwd，成功状态为 200。模拟密码 123456 不作为云端有效密码。

## 第 5 步：新增用户管理页面，对接全部 5 个用户接口

当前项目只有 `/user` 菜单，没有 User.vue。**新增** `/Users/nzy/Desktop/名称/work-admin/src/views/User.vue`，填入下面的页面。

本页作为本节课的单文件 CRUD 演示，集中查看请求与界面更新；组件封装可安排在后续课程。

讲解和操作顺序：

1. `loadUsers()`：列表与分页，表格读取 items，分页总数读取 total。
2. `openDetail()`：点击详情时 GET 单条用户。
3. `openAddDialog()` → `submitForm()`：新增时 POST，成功 201 后重新请求第一页。
4. `openEditDialog()` → `submitForm()`：先 GET 回填，再 PUT 保存。
5. `handleDelete()`：确认后 DELETE，成功 204 后刷新；取消不发请求。

```vue
<script>
import { getUserList, getUser, addUser, editUser, deleteUser } from '../api/user'

export default {
  name: 'UserManagement',
  data() {
    return {
      items: [], page: 1, total: 0,
      keyword: '', appliedKeyword: '',
      loading: false, saving: false, deletingId: null, confirmingDelete: false,
      detailVisible: false, detailUser: null,
      dialogVisible: false,
      form: { id: null, name: '', account: '', passwd: '' }
    }
  },
  computed: {
    tableData() {
      const keyword = this.appliedKeyword.toLowerCase()
      return this.items.filter(user =>
        `${user.name || ''} ${user.account}`.toLowerCase().includes(keyword)
      )
    },
    busy() {
      return this.loading || this.saving || this.deletingId !== null || this.confirmingDelete
    },
    dialogTitle() {
      return this.form.id === null ? '新增用户' : '编辑用户'
    },
    rules() {
      return {
        name: [{ max: 100, message: '姓名最多 100 个字符', trigger: 'blur' }],
        account: [
          { required: true, whitespace: true, message: '请输入账号', trigger: 'blur' },
          { max: 100, message: '账号最多 100 个字符', trigger: 'blur' }
        ],
        passwd: [
          { max: 100, message: '密码最多 100 个字符', trigger: 'blur' },
          { validator: (_, value, done) => {
            if (this.form.id === null && !value?.trim()) done(new Error('新增用户必须填写密码'))
            else done()
          }, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadUsers()
  },
  methods: {
    async loadUsers(page = this.page) {
      this.loading = true
      try {
        let result = await getUserList(page)
        // 删除最后一页的最后一条记录后，回到仍然存在的页码。
        const lastPage = Math.max(1, result.totalPages)
        if (page > lastPage) result = await getUserList(lastPage)
        this.items = result.items
        this.page = result.page
        this.total = result.total
        return true
      } catch {
        return false
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.appliedKeyword = this.keyword.trim()
    },
    resetSearch() {
      this.keyword = ''
      this.appliedKeyword = ''
    },
    handlePageChange(page) {
      if (this.busy) return
      this.resetSearch()
      this.loadUsers(page)
    },
    async openAddDialog() {
      if (this.busy) return
      this.form = { id: null, name: '', account: '', passwd: '' }
      this.dialogVisible = true
      await this.$nextTick()
      this.$refs.userFormRef.clearValidate()
    },
    async openDetail(row) {
      if (this.busy) return
      this.loading = true
      try {
        this.detailUser = await getUser(row.id)
        this.detailVisible = true
      } catch {
        // 查询失败时不展示旧详情。
      } finally {
        this.loading = false
      }
    },
    async openEditDialog(row) {
      if (this.busy) return
      this.loading = true
      try {
        const user = await getUser(row.id)
        this.form = { id: user.id, name: user.name || '', account: user.account, passwd: '' }
        this.dialogVisible = true
        await this.$nextTick()
        this.$refs.userFormRef.clearValidate()
      } catch {
        // 详情请求失败时不打开弹窗。
      } finally {
        this.loading = false
      }
    },
    async submitForm() {
      if (this.saving) return
      this.saving = true
      try {
        const valid = await this.$refs.userFormRef.validate().catch(() => false)
        if (!valid) return
        const editing = this.form.id !== null
        const data = { name: this.form.name, account: this.form.account.trim() }
        if (!editing || this.form.passwd.trim()) data.passwd = this.form.passwd
        const user = editing
          ? await editUser(this.form.id, data)
          : await addUser(data)
        this.dialogVisible = false
        const editingSelf = editing && user.id === this.$store.state.userInfo?.id
        if (editingSelf && data.passwd) {
          this.$store.commit('clearUserInfo')
          this.$message.success('密码已修改，请重新登录')
          await this.$router.replace('/login')
          return
        }
        if (editingSelf) this.$store.commit('setUserInfo', user)
        this.$message.success(editing ? '修改成功' : '新增成功')
        this.resetSearch()
        // 保存接口成功和列表刷新成功是两件事，刷新失败仍可手动重试。
        await this.loadUsers(editing ? this.page : 1)
      } catch {
        // 保存失败保留弹窗和输入内容；请求封装已提示原因。
      } finally {
        this.saving = false
      }
    },
    async handleDelete(row) {
      if (this.busy) return
      if (row.id === this.$store.state.userInfo?.id) {
        this.$message.warning('课堂练习请保留当前登录账号')
        return
      }
      this.confirmingDelete = true
      try {
        await this.$confirm(`确定删除账号“${row.account}”吗？`, '删除确认', {
          confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
        })
      } catch {
        return
      } finally {
        this.confirmingDelete = false
      }
      this.deletingId = row.id
      try {
        await deleteUser(row.id)
        this.$message.success('删除成功')
        this.resetSearch()
        await this.loadUsers()
      } catch {
        // 请求失败和取消确认分开处理，避免把错误当作取消。
      } finally {
        this.deletingId = null
      }
    }
  }
}
</script>

<template>
  <el-card>
    <h1 class="page-title">用户管理</h1>
    <p class="page-description">列表、详情、新增、编辑和删除均调用真实接口。课堂练习只修改本人创建的记录。</p>
    <div class="toolbar">
      <el-input v-model="keyword" class="search-input" clearable placeholder="筛选当前页姓名或账号" @keyup.enter="handleSearch" />
      <el-button :disabled="busy" @click="handleSearch">当前页筛选</el-button>
      <el-button :disabled="busy" @click="resetSearch">重置筛选</el-button>
      <el-button :disabled="busy" @click="loadUsers()">刷新列表</el-button>
      <el-button type="primary" :disabled="busy" @click="openAddDialog">新增用户</el-button>
    </div>
    <p class="hint">每页 20 条；筛选只作用于当前页，分页总数来自服务器。</p>
    <el-table v-loading="loading" :data="tableData" row-key="id" border stripe empty-text="当前页没有匹配用户">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="姓名"><template #default="{ row }">{{ row.name || '未填写' }}</template></el-table-column>
      <el-table-column prop="account" label="账号" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button link :disabled="busy" @click="openDetail(row)">详情</el-button>
          <el-button link type="primary" :disabled="busy" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" :disabled="busy" :loading="deletingId === row.id" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" :current-page="page" :page-size="20" :total="total" :disabled="busy" layout="total, prev, pager, next" @update:current-page="handlePageChange" />
    <el-dialog v-model="detailVisible" title="用户详情" width="480px">
      <el-descriptions v-if="detailUser" :column="1" border>
        <el-descriptions-item label="ID">{{ detailUser.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detailUser.name || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ detailUser.account }}</el-descriptions-item>
      </el-descriptions>
      <p class="hint">来自 GET /api/users/{id}。后端不返回密码。</p>
    </el-dialog>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <el-form ref="userFormRef" :model="form" :rules="rules" :disabled="saving" label-width="80px" @submit.prevent>
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" maxlength="100" /></el-form-item>
        <el-form-item label="账号" prop="account"><el-input v-model.trim="form.account" maxlength="100" /></el-form-item>
        <el-form-item label="密码" prop="passwd"><el-input v-model="form.passwd" type="password" show-password maxlength="100" :placeholder="form.id === null ? '新增时必填' : '留空保留原密码'" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.search-input { width: 240px; }
.hint { color: #606266; font-size: 13px; }
.pagination { margin-top: 16px; }
</style>
```

### 用户接口必须讲清楚的 5 个细节

- **分页：** 后端每页固定 20 条，页码从 1 开始，只支持 page；不要发送 pageSize，也不要用 items.length 代替 total。
- **筛选：** 上面的“当前页筛选”只过滤当前 items，不是全库搜索接口，服务器 total 保持不变。
- **编辑：** 后端不返回密码，弹窗密码为空；留空保留原密码。PUT 必须带 account，并带上当前 name，否则省略 name 会清空姓名。
- **密码变更：** 修改某用户密码会撤销该用户所有登录态。代码修改自己的密码后清理会话并要求重新登录。
- **失败：** 409 表示账号重复，保留弹窗和输入；删除最后一页最后一条时，loadUsers 会回到有效页码。

**本步验证：** 用“班级_学号_序号”创建自己的练习记录，依次详情、编辑、删除，在 Network 中看到五种请求。只操作自己的练习记录，保留教学账号。

## 第 6 步：新增消息接口页面

**新增** `/Users/nzy/Desktop/名称/work-admin/src/views/Messages.vue`：

```vue
<script>
import { sendMessage } from '../api/message'
export default {
  name: 'MessageInterfaceDemo',
  data() {
    return {
      sending: false, form: { message: '' }, received: '',
      rules: { message: [{ required: true, whitespace: true, message: '请输入演示消息', trigger: 'blur' }] }
    }
  },
  methods: {
    async submitMessage() {
      if (this.sending) return
      this.sending = true
      try {
        const valid = await this.$refs.messageFormRef.validate().catch(() => false)
        if (!valid) return
        this.received = await sendMessage(this.form.message)
        this.$message.success('消息接口调用成功')
      } catch {
        // 请求封装统一显示错误，失败时保留最近一次成功回显。
      } finally { this.sending = false }
    }
  }
}
</script>
<template>
  <el-card>
    <h1 class="page-title">消息接口演示</h1>
    <p class="page-description">POST /api/messages 接收 JSON，返回 text/plain 文本。此接口用于回显演示，后端没有消息列表或消息持久化接口。</p>
    <el-form ref="messageFormRef" :model="form" :rules="rules" :disabled="sending" label-position="top" @submit.prevent>
      <el-form-item label="演示消息" prop="message"><el-input v-model="form.message" type="textarea" :rows="4" placeholder="例如：我的第一个真实接口请求" /></el-form-item>
      <el-button type="primary" :loading="sending" @click="submitMessage">发送消息</el-button>
    </el-form>
    <div v-if="received" class="message-result"><h2>最近一次成功响应</h2><p>{{ received }}</p></div>
  </el-card>
</template>
<style scoped>
.message-result { margin-top: 26px; padding-top: 20px; border-top: 1px solid #dce3ed; }
.message-result h2 { font-size: 16px; }
.message-result p { white-space: pre-wrap; overflow-wrap: anywhere; color: #2b65c9; }
</style>
```

**本步验证：** 发送“我的第一个接口请求”，Network 为 POST /api/messages，Request Payload 是 JSON，Response 是“已接收到我的第一个接口请求”。使用文字插值显示响应；此接口只做回显，没有消息列表或保存历史接口。

## 第 7 步：新增注册接口演示页面

**新增** `/Users/nzy/Desktop/名称/work-admin/src/views/Register.vue`：

```vue
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
        confirmPasswd: [{
          validator: (_, value, done) => {
            if (!value || value !== this.form.passwd) done(new Error('两次密码必须一致'))
            else done()
          },
          trigger: 'blur'
        }]
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
        const status = error.response?.status
        this.errorText = `${status ? `HTTP ${status}：` : ''}${error.userMessage || '注册失败'}`
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div class="register-page">
    <el-card class="register-card">
      <h2>注册接口演示</h2>
      <el-alert title="当前云端未开放公开注册，有效请求会返回 403。" type="info" :closable="false" />
      <el-alert v-if="errorText" :title="errorText" type="error" :closable="false" />
      <el-form ref="registerFormRef" :model="form" :rules="rules" :disabled="loading" label-width="80px" @submit.prevent>
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" maxlength="100" /></el-form-item>
        <el-form-item label="账号" prop="account"><el-input v-model.trim="form.account" maxlength="100" /></el-form-item>
        <el-form-item label="密码" prop="passwd"><el-input v-model="form.passwd" type="password" show-password maxlength="100" /></el-form-item>
        <el-form-item label="确认密码" prop="confirmPasswd"><el-input v-model="form.confirmPasswd" type="password" show-password maxlength="100" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" @click="register">提交注册请求</el-button></el-form-item>
      </el-form>
      <router-link to="/login">返回登录</router-link>
      <router-link v-if="$store.state.token" to="/dashboard" class="back-link">返回后台</router-link>
    </el-card>
  </div>
</template>

<style scoped>
.register-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f5f7fa; }
.register-card { width: 100%; max-width: 520px; }
h2, .el-alert { margin-bottom: 16px; }
.back-link { margin-left: 20px; }
</style>
```

**本步验证：** 从登录页打开“注册接口演示”，填写有效账号、密码，点击提交，Network 为 POST /api/auth/register，云端返回 403，并显示后端 message。缺少必填字段可能先返回 400，不能用缺参数的请求验证注册关闭。

当前云端关闭注册，403 表示正常执行了环境限制，页面对接仍然完成。输入和已有会话不会因此被清空。如果老师另行启用注册，成功响应为 201，结构与登录相同，上面的成功分支会自动保存新会话并进入后台。confirmPasswd 仅用于前端校验，不发送给后端。

## 第 8 步：补齐路由和登录守卫

**替换** `/Users/nzy/Desktop/名称/work-admin/src/router/index.js`：

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store'
import Layout from '../views/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import User from '../views/User.vue'
import Messages from '../views/Messages.vue'
import Register from '../views/Register.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'user', component: User },
      { path: 'messages', component: Messages }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(to => {
  if (to.meta.requiresAuth && !store.state.token) return '/login'
})

export default router
```

沿用当前项目的 Hash 路由。访问页面的完整地址是 `http://127.0.0.1:8081/#/user`，不是后端的 `/api/users`。

守卫只检查本地有没有 Token，Token 是否仍有效由后端接口校验；缓存着过期 Token 时，后续 401 仍会退回登录。

## 第 9 步：在 main.js 接入 401 跳转

**替换** `/Users/nzy/Desktop/名称/work-admin/src/main.js`。保留原来的 Element Plus 与图标注册逻辑，新增公共请求模块的回调：

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { setUnauthorizedHandler } from './api/request'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

setUnauthorizedHandler(() => {
  if (router.currentRoute.value.path !== '/login') router.replace('/login')
})

app.use(store).use(router).use(ElementPlus).mount('#app')
```

受保护请求返回 401 时：request.js 清除 Vuex 和 localStorage → 调用这个回调 → 返回登录页。登录本身返回 401 时留在登录页提示错误。

`src/App.vue` 已经包含根 router-view，本次不需要修改。

## 第 10 步：修改 Layout.vue，对接 me 和退出

文件：`/Users/nzy/Desktop/名称/work-admin/src/views/Layout.vue`。

### 10.1 在现有菜单中追加“消息接口”

放在用户管理菜单后、`</el-menu>` 前：

```vue
<el-menu-item index="/messages">
  <el-icon><ChatDotRound /></el-icon>
  <span>消息接口</span>
</el-menu-item>
```

现有用户管理菜单的 index="/user" 已正确，不需要修改。

### 10.2 替换整个 el-header 区域

将原来的 username 显示改成 name 或 account：

```vue
<el-header class="header">
  <div>欢迎，{{ $store.state.userInfo?.name || $store.state.userInfo?.account || '用户' }}</div>
  <div>
    <el-button link :loading="userLoading" :disabled="loggingOut" @click="loadCurrentUser">刷新当前用户</el-button>
    <el-button link :loading="loggingOut" @click="handleLogout">退出登录</el-button>
  </div>
</el-header>
```

### 10.3 替换整个 script，保留原来的 style

```vue
<script>
import { getCurrentUser, logoutApi } from '../api/auth'

export default {
  name: 'AdminLayout',
  data() {
    return { userLoading: false, loggingOut: false }
  },
  created() {
    this.loadCurrentUser()
  },
  methods: {
    async loadCurrentUser() {
      if (this.userLoading || this.loggingOut) return
      const token = this.$store.state.token
      if (!token) return
      this.userLoading = true
      try {
        const user = await getCurrentUser()
        if (token === this.$store.state.token) this.$store.commit('setUserInfo', user)
      } catch {
        // 请求封装已提示错误；401 时自动返回登录。
      } finally {
        this.userLoading = false
      }
    },
    async handleLogout() {
      if (this.loggingOut) return
      this.loggingOut = true
      try {
        await logoutApi()
      } catch {
        // 网络失败也清理本地会话，错误由公共请求模块提示。
      } finally {
        this.$store.commit('clearUserInfo')
        this.loggingOut = false
        await this.$router.replace('/login')
      }
    }
  }
}
</script>
```

**本步验证：** 登录进入后台时 GET /api/auth/me 返回 id、name、account；点击“刷新当前用户”再发一次 me。退出时 POST /api/auth/logout 返回 204，本地 Token 清除，返回登录页。

204 没有业务响应体，不要判断 `result.code`。如果退出请求因网络失败，本地仍退出，但不能认定云端 Token 已被注销。

## 第 11 步：标明仪表盘当前仍是演示数据

文件：`/Users/nzy/Desktop/名称/work-admin/src/views/Dashboard.vue`。

在现有 `<div class="dash">` 内最上方增加：

```vue
<el-alert
  title="本页任务、趋势、角色和统计卡片为演示数据，真实用户数据请到用户管理查看。"
  type="info"
  :closable="false"
  style="margin-bottom: 16px"
/>
```

这份后端没有任务、趋势、角色、未读消息等接口。仪表盘原来的静态数据和模拟刷新可以保留用于展示，真实用户总数以用户管理页的 total 为准。后端 10 个已有接口已分别安排到登录、布局、注册、用户管理和消息页面。

## 第 12 步：启动，并按顺序验收

### 12.1 启动项目

```bash
cd /Users/nzy/Desktop/名称/work-admin
pnpm run serve
```

打开 `http://127.0.0.1:8081/#/login`。

### 12.2 清掉旧模拟登录状态

打开浏览器开发者工具 → Application → Local Storage，在 `http://127.0.0.1:8081` 来源下删除 token、userInfo，然后刷新；没有这些键时直接继续。不同端口、localhost 与 127.0.0.1 的存储相互独立。

再打开开发者工具 Network，使用老师分配的真实教学账号。

### 12.3 全部接口验收清单

| 顺序 | 操作 | Network 检查 |
| --- | --- | --- |
| 1 | 正确账号登录；再用错误密码验证失败 | POST /api/auth/login：200；错误密码 401，留在登录页 |
| 2 | 进入后台，点击刷新当前用户 | GET /api/auth/me：200，欢迎栏读取 name/account |
| 3 | 点击用户管理、切换页码 | GET /api/users?page=N：200，items、total、固定 pageSize=20 |
| 4 | 新增自己的练习用户 | POST /api/users：201，刷新后仍存在 |
| 5 | 点击详情、点击编辑 | GET /api/users/{id}：200，密码不返回、不回填 |
| 6 | 修改姓名，密码留空 | PUT /api/users/{id}：200，提交 name/account，原密码保留 |
| 7 | 删除自己的练习记录；另试一次取消 | DELETE /api/users/{id}：204；取消时没有 DELETE 请求 |
| 8 | 消息接口发送普通文字 | POST /api/messages：200，JSON 请求、纯文本响应 |
| 9 | 注册演示提交有效参数 | POST /api/auth/register：云端 403，显示后端说明 |
| 10 | 点击退出登录 | POST /api/auth/logout：204；之后直接访问 #/user 跳回登录 |

额外验证：

- [ ] 新增重复账号时返回 409，弹窗与输入保留。
- [ ] 在专用测试账号上改密码，旧 Token 随后访问受保护接口返回 401；使用新密码重新登录。
- [ ] 删除末页最后一条后自动回到有效页码。
- [ ] 未登录直接访问 `#/messages`，跳回登录页。

课堂只修改或删除本人新建的数据。当前后端没有角色权限隔离，每个已登录账号都能管理用户，分组练习时要按约定操作。

### 12.4 出错时按这个顺序检查

1. **Request URL：** 是否为 `http://118.25.25.164:8080/api/...`。
2. **Method / 参数：** 登录字段 account/passwd，分页 page 放 query，id 放 URL，表单放 JSON body。
3. **Header：** 受保护请求是否有 satoken，是否来自真实登录。
4. **HTTP 状态：** 400 参数错误；401 登录失败或会话失效；403 注册未开放；404 用户不存在；409 账号重复。
5. **响应结构：** 登录是 tokenValue/user，列表是 items/total，消息是字符串，删除和退出为空体。
6. **Network Error：** 检查云端可用性、地址、开发端口是否自动变成了 8082、Origin 是否在允许列表。

## 本节完成后的文件变化

新增：.env，src/api/request.js、auth.js、user.js、message.js，src/views/User.vue、Register.vue、Messages.vue。

修改：vue.config.js、src/store/index.js、src/views/Login.vue、src/views/Layout.vue、src/views/Dashboard.vue、src/router/index.js、src/main.js。pnpm add 会同时更新 package.json 和 pnpm-lock.yaml。

完成验证后再提交本次改动。这个项目原本已有未提交修改，先通过 git status 和 git diff 核对提交内容。

## 核对依据

接口方法、字段和响应类型已与 `/Users/nzy/Desktop/名称/stu/` 的 AuthController、UserController、MessageController 及 DTO 核对。当前云端注册关闭的 403 行为已通过实际请求验证。

库用法可查：[Axios 拦截器](https://axios-http.com/docs/interceptors)、[Axios 请求配置](https://axios-http.com/docs/req_config)、[Vue Router 导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)、[Element Plus 表单](https://element-plus.org/en-US/component/form.html)、[Vue CLI 环境变量](https://cli.vuejs.org/guide/mode-and-env.html)。

