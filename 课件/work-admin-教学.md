# Vue3 + Element Plus 工作中台项目教学文档

> 面向大三学生前端项目课 · WorkBuddy 实操教学
> 项目名称：**work-admin 工作管理中台**

**技术栈**：Vue3（选项式 API，纯 JavaScript，不使用 TS）+ Element Plus + Vuex + VueRouter + Axios + MockJS

**项目功能**：登录、中台布局、侧边菜单、仪表盘、用户管理 CRUD、登录状态持久化、路由权限守卫、模拟后端接口、项目打包

> 📌 本文档为**增强版**：每课新增「本课目标 / 原理讲解 / 代码拆解 / 常见报错与调试 / 本课小结」，并新增第 6～10 课（组件封装、ECharts、文件上传与批量删除、角色权限、生产部署与优化）。

---

## 课程总览

| 课时 | 主题 | 核心知识点 | 建议课时 |
|---|---|---|---|
| 第 0 课 | 前置环境准备 | Node/npm、vue create 选项含义、目录结构 | 2 |
| 第 1 课 | ElementPlus 引入 + 中台布局 | 嵌套路由、flex 布局、Vuex、localStorage 持久化 | 4 |
| 第 2 课 | 用户管理 CRUD | el-table、el-dialog、el-form、数组响应式 | 4 |
| 第 3 课 | 路由全局守卫 | beforeEach、next、token 校验、白名单 | 2 |
| 第 4 课 | Axios 封装 + MockJS | 拦截器、接口分层、Mock 原理、接口改造 | 4 |
| 第 5 课 | 项目打包与本地预览 | npm run build、dist 结构、静态服务器预览 | 2 |
| 第 6 课 | 公共组件封装 | props / emit、自定义 v-model、组件复用 | 4 |
| 第 7 课 | ECharts 数据可视化 | 图表初始化、resize、按需引入 | 4 |
| 第 8 课 | 文件上传 + 批量删除 | el-upload、多选表格、selection-change | 4 |
| 第 9 课 | 角色权限控制 | meta.roles、动态菜单、自定义指令 | 4 |
| 第 10 课 | 生产部署与打包优化 | 环境变量、代理、Nginx、路由懒加载 | 4 |

**总学习目标**：独立完成一个具备「登录鉴权 → 中台布局 → 数据增删改查 → 图表可视化 → 打包部署」完整闭环的前端中台项目，并理解每一步背后的原理。

---

# 前置环境准备（第 0 课）

**本课目标**：把开发环境一次性配好，理解 Vue 项目是怎么被创建出来的。

## 0.1 工具软件

### 1. Node.js 推荐 v18.x

**为什么是 18.x？** Vue CLI 5 与 Element Plus 都要求 Node ≥ 14，而 16 以下已停止维护。18 是长期支持版（LTS），生态兼容性最好。

安装完成，打开终端验证版本：

```bash
node -v
npm -v
```

输出版本号代表安装成功。（如显示 `command not found`，说明环境变量没配好，重装时勾选 "Add to PATH"。）

> 💡 **进阶建议**：装一个 **nvm**（Node 版本管理器），可以一条命令在多个项目间切换 Node 版本：
> ```bash
> nvm install 18
> nvm use 18
> ```

### 2. VS Code

推荐插件：

- **Volar**（Vue3 语法高亮与类型提示，注意：Vue3 项目要**禁用**旧的 Vetur 插件）
- **Element Plus Snippets**（Element 组件代码片段，打 `el-table` 自动补全）

### 3. Chrome 浏览器

调试必备，装好后熟悉 **F12** 开发者工具的三个面板：

- **Console**：看报错
- **Network**：看接口请求（第 4 课 Mock 调试全靠它）
- **Application → Local Storage**：看登录状态是否写入（第 1 课要用）

## 0.2 创建 Vue3 项目

```bash
# 全局安装 vue 脚手架
npm install -g @vue/cli

# 创建项目（可以在任意你喜欢的工作目录执行）
vue create work-admin
```

**配置选项逐条解释**（这是学生最容易懵的一步）：

| 选项 | 我们的选择 | 为什么 |
|---|---|---|
| Please pick a preset | **Manually select features** | 手动选，避免装一堆用不上的东西 |
| Check the features | 勾选 **Babel、Router、Vuex** | Babel 做语法降级；Router 路由；Vuex 状态管理 |
| TypeScript | **不勾选** | 本课程用纯 JS，降低学习门槛 |
| Vue version | **3.x** | 项目基于 Vue3 |
| Use history mode for router? | **n** | 用哈希模式（URL 带 `#`），部署时不需要服务端额外配置，减少踩坑 |
| Where do you prefer placing config? | **In package.json** | 配置集中在一个文件里，方便查看 |
| Save this as a preset? | **n** | 不保存，下次重新选就行 |

等待依赖安装完成，然后：

```bash
# 进入项目目录
cd work-admin

# 安装 Element Plus
npm install element-plus --save

# 安装 Element Plus 图标库（必须单独装，否则第 1 课图标报错）
npm install @element-plus/icons-vue --save

# 启动开发服务
npm run serve
```

访问地址：http://localhost:8080

> ⚠️ **常见报错**：`npm install` 卡住或超时 → 切换淘宝镜像源：
> ```bash
> npm config set registry https://registry.npmmirror.com
> ```

## 0.3 项目目录结构详解【新增】

创建完成后先别急着写代码，把目录看懂，后面才不会"文件放哪儿都靠猜"。

```text
work-admin/
├── public/
│   └── index.html          # 唯一的 HTML 页面（SPA 只有一个页面！）
├── src/
│   ├── assets/             # 静态资源（图片、全局样式）
│   ├── components/         # 公共组件（第 6 课会大量用到）
│   ├── router/
│   │   └── index.js        # 路由配置（第 1、3 课）
│   ├── store/
│   │   └── index.js        # Vuex 状态管理（第 1 课）
│   ├── views/              # 页面级组件（登录、布局、仪表盘、用户管理）
│   ├── App.vue             # 根组件，只放 <router-view/>
│   └── main.js             # 入口文件：创建应用、注册插件、挂载
├── package.json            # 依赖清单 + npm 脚本
└── vue.config.js           # 可选，Webpack 配置与代理（第 10 课）
```

**关键认知**：这是一个 **SPA（单页应用）**。`public/index.html` 只有一个 `<div id="app">`，所有页面切换都是 JS 在替换内容，**不会真的跳转新页面**。这也是为什么 URL 改用 `#` 哈希模式后部署那么省心。

## 0.4 本课小结

- Vue CLI 帮我们生成了一整套 Webpack 配置，不用手写打包规则
- 一个 Vue 项目 = `index.html`（壳）+ `main.js`（入口）+ `App.vue`（根组件）+ 一堆页面组件
- 图标库要单独安装

---

# 第 1 课：ElementPlus 引入 + 中台基础布局搭建

**本课目标**：跑通「登录 → 进中台 → 布局框架成型」的最小闭环。

**知识点**：嵌套路由、Element Plus 基础组件、flex 布局、Vuex、localStorage

## 1.1 修改 `src/main.js`

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//element图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
//批量注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(store).use(router).use(ElementPlus).mount('#app')
```

### 原理讲解

Vue3 用 `createApp(App)` **创建一个应用实例**，而不是像 Vue2 那样直接 `new Vue()`。返回的 `app` 对象上挂着一串方法：

- `app.use(插件)` —— 注册插件，支持链式调用
- `app.component(名字, 组件)` —— 注册全局组件
- `app.mount('#app')` —— 把应用挂载到 `index.html` 里的 `<div id="app">` 上

**为什么图标要循环注册？** 因为 `@element-plus/icons-vue` 导出了几百个图标组件。逐个 `app.component` 太啰嗦，`Object.entries()` 转成 `[名字, 组件]` 数组后一次循环全部注册，之后任何页面都能直接写 `<el-icon><House /></el-icon>`，无需再 import。

> 📌 **注意**：`app.use(ElementPlus)` 之后，Element 会自动给每个组件实例挂上 `this.$message`、`this.$confirm`、`this.$notify` 这些方法。这就是后面能用 `this.$message.success()` 的原因——不需要任何 import。

## 1.2 新建布局组件 `src/views/Layout.vue`

```vue
<template>
  <div class="layout">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="aside">
      <div class="logo">
        <span>工作管理中台</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧整体容器 -->
    <div class="main-wrap">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div>欢迎，{{ $store.state.userInfo?.username }}</div>
        <el-button link @click="handleLogout">退出登录</el-button>
      </el-header>
      <!-- 主内容区域，子路由渲染在这里 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script>
export default {
  name: "Layout",
  methods: {
    handleLogout() {
      //清空登录信息，跳转到登录页
      this.$store.commit("clearUserInfo")
      this.$router.push("/login")
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  border-bottom: 1px solid #434a50;
}
.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  background: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
```

### 原理讲解：flex 布局撑出「经典中台骨架」

这是所有后台系统都在用的布局结构，理解它比记住 CSS 更重要：

```text
.layout  (display:flex, height:100vh)     ← 横向两栏
├── .aside   (固定 220px)                 ← 左侧菜单，宽度写死
└── .main-wrap (flex:1)                   ← 右侧占满剩余空间
    ├── .header  (高度 60px)              ← 顶部栏
    └── .content (flex:1, overflow-y:auto)← 内容区，这里才能滚动
```

三个关键点：

1. **`height: 100vh` + `overflow: hidden`**：整个页面正好一屏高，且**外层永不滚动**，避免出现两条滚动条。
2. **`flex: 1`**：右侧自动吃掉左边剩下的宽度，所以左侧菜单改宽改窄，右边都不用动。
3. **`flex-direction: column` + 内容区 `flex:1`**：让 `.content` 撑满 header 下方的剩余高度，滚动只发生在内容区内部——这就是"顶栏和菜单固定、只有内容滚动"效果的原理。

### 原理讲解：`el-menu` 的三个关键属性

```vue
<el-menu
  :default-active="$route.path"   <!-- ① 高亮谁 -->
  router                          <!-- ② 点了自动跳转 -->
  background-color="#304156"      <!-- ③ 配色 -->
>
```

- `:default-active="$route.path"`：菜单高亮项由**当前路由路径**决定。`$route.path` 是响应式的，所以地址一变高亮自动跟着变，不需要手动写逻辑。
- `router`（不带冒号，是布尔属性）：开启后 `el-menu-item` 的 `index` 会被当作路由地址直接跳转，相当于内置了 `router.push`。
- 所以 `index="/dashboard"` 这个值，**必须**和路由配置里的路径一致，否则亮不起来也跳不过去。

> 🔧 **改进点说明**：原文档写的是 `<el-button text>`，`{{$store.state.userInfo.username}}`。新版 Element Plus 建议用 `link` 属性表示文本按钮（`text` 已废弃会在控制台告警）；同时 `userInfo` 在极端情况下可能为 `null`，加可选链 `?.` 可以避免"刷新后页面白屏报错"。

## 1.3 新建登录页面 `src/views/Login.vue`

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 style="text-align:center;margin-bottom:20px">工作中台登录</h2>
      <el-form ref="loginFormRef" :model="loginForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" style="width:100%">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      }
    }
  },
  methods: {
    login() {
      //模拟账号密码校验
      if (this.loginForm.username === "admin" && this.loginForm.password === "123456") {
        //调用vuex保存登录信息
        this.$store.commit("setUserInfo", { username: "admin" })
        this.$store.commit("setToken", "admin-token-001")
        this.$message.success("登录成功！")
        this.$router.push("/dashboard")
      } else {
        this.$message.error("账号或密码错误！")
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.login-card {
  width: 420px;
}
</style>
```

### 原理讲解：`v-model` 到底做了什么

`<el-input v-model="loginForm.username">` 其实是语法糖，等价于：

```vue
<el-input
  :model-value="loginForm.username"
  @update:model-value="val => loginForm.username = val"
/>
```

一句话：**输入框的值"绑"在 data 上，用户每敲一个字 data 就同步更新**。这就是"双向绑定"。

### 原理讲解：登录逻辑的四步套路

```text
① 校验账号密码（本项目先用 if 硬编码模拟）
② 把登录凭证存起来  → Vuex + localStorage
③ 给用户一个成功反馈 → this.$message.success
④ 跳转到首页        → this.$router.push('/dashboard')
```

> ⚠️ 真实项目中第 ① 步是"发请求给后端校验"，第 ② 步存的 token 由后端返回。本课程第 4 课会把这里改造成真实接口流程。

## 1.4 仪表盘首页 `src/views/Dashboard.vue`

```vue
<template>
  <div>
    <el-card>
      <h3>仪表盘首页</h3>
      <p>欢迎进入工作中台，展示统计数据</p>
      <el-row :gutter="20" style="margin-top:20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">用户总数：136</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">待办任务：18</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">已完成任务：421</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">系统消息：6</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Dashboard"
}
</script>

<style scoped>
.num-card {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
```

### 原理讲解：`el-row` / `el-col` 栅格系统

Element 把一行分成 **24 份**，`el-col :span="6"` 表示占 6/24，正好四列平分。`:gutter="20"` 是列之间的间距（但**不包含最外侧**）。改动 span 就能快速调整比例，比手写 flex 快得多。

> ⚠️ 注意：`:span` 前有冒号，代表传的是**数字 6**；如果写成 `span="6"` 传的是**字符串**。Element 内部能容错，但这是一个要养成的习惯——**属性名带冒号 = 传 JS 表达式**。

## 1.5 路由配置 `src/router/index.js`

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
```

### 原理讲解：嵌套路由（本项目最核心的概念）

配置里出现了**两层**组件：

```text
path: '/'        → component: Layout      ← 父级：永远存在的骨架
  children:
    path: 'dashboard' → component: Dashboard ← 子级：骨架里的内容
```

对应到 Layout.vue 里那个 `<router-view />`：

```text
点击「仪表盘」
    ↓
路由器发现要渲染 /dashboard
    ↓
先把 Layout 渲染出来（骨架）
    ↓
再把子路由的 Dashboard 塞进 Layout 的 <router-view /> 里
```

**所以 Layout 里的 `<router-view />` 就是"内容插槽"**。以后新增页面，只要往 `children` 里加一条，页面就会自动出现在右侧内容区，左侧菜单栏保持不变，不会重新渲染。

### 原理讲解：哈希模式 vs 历史模式

```js
createWebHashHistory()      // 地址：http://localhost:8080/#/dashboard
createWebHistory()          // 地址：http://localhost:8080/dashboard
```

| | 哈希模式 (`#`) | 历史模式 (无 `#`) |
|---|---|---|
| 原理 | `#` 后面的内容**浏览器不会发给服务器**，纯前端解析 | 用 `history.pushState` 改地址，看起来像真跳转 |
| 刷新页面 | 永远正常 | 服务器没配 `try_files` 就 **404** |
| 部署难度 | 低，扔上去就能跑 | 需要 Nginx 额外配置（第 10 课讲） |

**本课程选哈希模式**：学生第一次部署时几乎必然遇到"刷新就 404"的问题，先用哈希模式避开，把注意力放在业务上；第 10 课再专门讲怎么解决历史模式的 404。

### 原理讲解：子路由 path 为什么不写斜杠

```js
{ path: 'dashboard' }   // ✅ 相对路径，最终拼成 /dashboard
{ path: '/dashboard' }  // ❌ 会被当成绝对路径，失去父子关系
```

子路由的 `path` **不要**加开头斜杠，路由器会自动把父路径和子路径拼起来。

## 1.6 修改 App.vue

```vue
<template>
  <router-view/>
</template>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}
html,body{
  height:100%;
}
</style>
```

### 原理讲解

`App.vue` 是根组件，它里面的 `<router-view />` 是**最外层**的出口，决定"当前是登录页还是布局页"。所以这里只有一个空壳。

那几行全局 CSS 是**样式重置**，缺一不可：

- `margin:0; padding:0`：干掉浏览器给 `body` 的默认 8px 外边距，否则页面四周会有白边
- `box-sizing:border-box`：让 `width` 包含内边距和边框，避免布局算错（这是全前端最重要的 CSS 属性之一）
- `height:100%`：让 `html`/`body` 撑满屏幕，上面 `100vh` 才能正常生效

> 💡 注意 `<style>` **没有 scoped**——没有 scoped 才是全局样式，这是故意的。

## 1.7 Vuex 状态管理 `src/store/index.js`

```js
import { createStore } from 'vuex'

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null
  },
  mutations: {
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
  },
  actions: {
  },
  getters: {
  }
})
```

### 原理讲解：Vuex 五个概念到底怎么分工

| 概念 | 作用 | 本项目用法 |
|---|---|---|
| **state** | 存数据（相当于"全局 data"） | `token`、`userInfo` |
| **mutations** | **唯一**能改 state 的地方，必须同步 | `setToken`、`setUserInfo`、`clearUserInfo` |
| **actions** | 处理异步，然后 `commit` 调用 mutation | 本项目暂未用（登录已经是同步模拟） |
| **getters** | 派生数据（相当于"全局 computed"） | 本项目暂未用 |
| **modules** | 把 store 拆分成多个模块 | 项目变大后使用 |

**为什么必须通过 mutation 改 state？** 因为 Vuex 需要在每次修改时通知所有依赖它的组件更新。绕过 mutation 直接改，DevTools 就追踪不到数据变化了。

调用方式：`this.$store.commit("setUserInfo", { username: "admin" })`

### 原理讲解：为什么要写 localStorage（登录状态持久化）

Vuex 的数据存在**内存**里。**刷新一次页面，内存清空，token 就没了**，用户会被踢回登录页——体验极差。

解决方案是"**双写**"：

```text
写入时：state 和 localStorage 同时写（见 mutations）
读取时：创建 store 时先从 localStorage 里捞回来，作为初始值
```

对应代码就是 state 的初始值写法：

```js
token: localStorage.getItem('token') || ''
userInfo: JSON.parse(localStorage.getItem('userInfo')) || null
```

注意 `userInfo` 是**对象**，存进去要 `JSON.stringify`（序列化成字符串），取出来要 `JSON.parse`（还原成对象）——这是 localStorage 只能存字符串导致的。

### 🔍 调试技巧

打开 **F12 → Application → Local Storage → http://localhost:8080**，登录后应该能看到 `token` 和 `userInfo` 两条记录。**这是验证持久化是否生效最直接的方式**，第 3 课的守卫演示也要在这里清数据。

## 1.8 本课测试

```bash
npm run serve
```

访问 http://localhost:8080/#/login ，账号 `admin`，密码 `123456`。

**验收清单**：

- [ ] 登录成功有绿色提示，并跳到仪表盘
- [ ] 地址栏变成 `#/dashboard`
- [ ] 左侧菜单「仪表盘」高亮，点击「用户管理」能切换（此时还是空白页，第 2 课才建）
- [ ] 顶栏显示"欢迎，admin"
- [ ] 点「退出登录」回到登录页
- [ ] **刷新页面**后登录状态仍在，没有被踢回登录页 ← 持久化成功

## 1.9 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 页面全白，Console 报 `Failed to resolve component: House` | 图标没注册，或漏装 `@element-plus/icons-vue` | 按 1.1 循环注册；确认已 `npm install @element-plus/icons-vue` |
| 菜单点击无反应 | `el-menu-item` 的 `index` 和路由 path 不一致 | 两边都写成 `/dashboard`、`/user` |
| 右内容区不滚动 / 出现两条滚动条 | `.layout` 漏了 `overflow:hidden`，或 `.content` 漏了 `overflow-y:auto` | 按 1.2 完整复制样式 |
| 页面四周有白边 | `App.vue` 的全局重置样式没生效 | 确认 `<style>` 没加 scoped |
| 控制台告警 `text is deprecated` | 用了旧属性 `text` | 改成 `link` |

## 1.10 本课小结

- Vue3 应用 = `createApp` → `use` 插件 → `mount`
- 中台骨架靠 **flex** 撑：左侧固定、右侧 `flex:1`、内容区独立滚动
- **嵌套路由**让 Layout 当骨架、子路由当内容
- Vuex 管全局状态，`state` 配 `localStorage` 实现刷新不丢登录

---

# 第 2 课：用户管理页面（Table、搜索、新增、编辑、删除弹窗）

**本课目标**：完成中台最典型的"表格 + 搜索 + 弹窗表单"CRUD 页面。

**知识点**：`el-table`、`el-dialog`、`el-form`、数组响应式、数组浅拷贝

## 2.1 新建 `src/views/User.vue`

```vue
<template>
  <el-card>
    <!-- 搜索区域 -->
    <div class="search-box">
      <el-input v-model="query.keyword" placeholder="搜索用户名" style="width:220px" />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openAddDialog">新增用户</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="tableData" border stripe style="margin-top:15px">
      <el-table-column label="ID" prop="id" />
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="角色" prop="role" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width:100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "User",
  data() {
    return {
      query: {
        keyword: ""
      },
      //模拟表格数据
      tableData: [
        { id: 1, username: "张三", phone: "13800138000", role: "admin" },
        { id: 2, username: "李四", phone: "13900139000", role: "user" }
      ],
      dialogVisible: false,
      dialogTitle: "新增用户",
      form: {
        id: "",
        username: "",
        phone: "",
        role: ""
      },
      //原始数据，用于搜索重置
      originData: []
    }
  },
  created() {
    //页面加载保存原始数据
    this.originData = [...this.tableData]
  },
  methods: {
    //搜索
    handleSearch() {
      if (!this.query.keyword) {
        this.tableData = [...this.originData]
        return
      }
      this.tableData = this.originData.filter(item => item.username.includes(this.query.keyword))
    },
    //打开新增弹窗
    openAddDialog() {
      this.dialogTitle = "新增用户"
      this.dialogVisible = true
      this.form = { id: "", username: "", phone: "", role: "" }
    },
    //打开编辑弹窗
    openEditDialog(row) {
      this.dialogTitle = "编辑用户"
      this.dialogVisible = true
      this.form = { ...row }
    },
    //提交保存
    submitForm() {
      if (this.form.id) {
        //编辑
        const index = this.tableData.findIndex(item => item.id === this.form.id)
        this.tableData[index] = { ...this.form }
        this.originData = [...this.tableData]
      } else {
        //新增
        const newId = Math.max(...this.tableData.map(i => i.id)) + 1
        this.tableData.push({ ...this.form, id: newId })
        this.originData = [...this.tableData]
      }
      this.dialogVisible = false
      this.$message.success("保存成功")
    },
    //删除
    handleDelete(row) {
      this.$confirm("确定删除该用户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const idx = this.tableData.findIndex(item => item.id === row.id)
        this.tableData.splice(idx, 1)
        this.originData = [...this.tableData]
        this.$message.success("删除成功")
      }).catch(() => {
        //取消删除，不做操作
      })
    }
  }
}
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
```

> 🔧 **已修正**：原文档写 `<el-button type="text" danger>`。`danger` 单独写不是有效属性，红色不会生效。正确写法是 `<el-button link type="danger">`（`link` = 文本按钮样式，`type="danger"` = 红色）。

## 2.2 路由添加 User 页面

修改 `src/router/index.js`：

**① 顶部导入**

```js
import User from '../views/User.vue'
```

**② children 数组添加子路由**

```js
{
  path: 'user',
  component: User
}
```

## 2.3 原理讲解：`el-table` 是怎么渲染出来的

```vue
<el-table :data="tableData">
  <el-table-column label="用户名" prop="username" />
```

- `:data` 是数据源数组，一个元素 = 一行
- `prop="username"` 告诉列"从每行对象里取 `username` 字段显示"
- `label` 是表头文字
- `border` 加边框、`stripe` 斑马纹（隔行变色），都是布尔属性

**列顺序 = 标签书写顺序**，改顺序只要挪动 `<el-table-column>` 的位置。

### 原理讲解：操作列为什么要用 `#default="scope"`

固定数据显示用 `prop` 就够了，但"操作"列里是**按钮**，需要知道当前行是哪条数据才能传参。这时候要用**作用域插槽**：

```vue
<el-table-column label="操作">
  <template #default="scope">
    <el-button @click="openEditDialog(scope.row)">编辑</el-button>
  </template>
</el-table-column>
```

`scope.row` 就是**当前这一行的完整数据对象**。所以点击"编辑"时，传进去的正是那一行的 `{ id, username, phone, role }`。

换个更易读的写法（Vue3 支持解构）：

```vue
<template #default="{ row }">
  <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
</template>
```

## 2.4 原理讲解：`originData` 到底是干嘛的

这是本课最容易被忽略、但面试常问的设计。

**问题**：搜索时如果把 `tableData` 直接过滤掉，那"清空搜索"后数据就再也回不来了——因为原始数据已经被覆盖了。

**解法**：准备两份数据。

```text
originData  ← 永不修改的"全量备份"，只在 created 时拍一次快照
tableData   ← 界面上真正显示的，搜索/增删改都在它身上操作
```

于是搜索逻辑就很清晰了：

```js
handleSearch() {
  if (!this.query.keyword) {
    this.tableData = [...this.originData]   // 清空关键字 → 还原全量
    return
  }
  this.tableData = this.originData.filter(item =>
    item.username.includes(this.query.keyword)
  )
}
```

而且每次增删改之后都要补一句 `this.originData = [...this.tableData]`，让备份跟上最新状态。

### 原理讲解：为什么到处都在用 `[...xxx]`（浅拷贝）

```js
this.tableData = [...this.originData]   // 生成一个"新数组"，元素还是同一批对象
```

如果写成 `this.tableData = this.originData`，两者就指向**同一个数组**了。之后 `tableData.push(...)` 会连带把 `originData` 也改了，备份就失效了。

`[...arr]` 会创建一个**新数组**，所以后续的 push/splice 只影响 `tableData`。这叫**浅拷贝**（数组是新的，里面的对象还是共用的）。

同理，编辑弹窗里写 `this.form = { ...row }`——如果不拷贝，改表单就等于**直接改了表格里的那行数据**，用户点"取消"也回不去了。

> 💡 **进阶**：`[...arr]` 和 `{...obj}` 都是浅拷贝。如果对象里嵌套了对象，需要深拷贝，可以用 `structuredClone(obj)`（现代浏览器原生支持）。

## 2.5 原理讲解：新增和编辑为什么能复用同一个弹窗

看 `submitForm` 的分支判断：

```js
if (this.form.id) {
  // 有 id → 编辑：找到原位置替换
} else {
  // 没有 id → 新增：生成新 id 后 push
}
```

**靠 `id` 是否存在来区分模式**，这是中台开发的经典套路。配套的两个入口方法也对称：

| | 打开时做的事 |
|---|---|
| `openAddDialog` | 标题改为"新增"、`form` **重置成空对象**（`id` 为空），自动走新增分支 |
| `openEditDialog(row)` | 标题改为"编辑"、`form` 拷贝该行数据（带 `id`），自动走编辑分支 |

**为什么新增必须重置 form？** 因为 `form` 是复用的。如果上次编辑时留了 `id`，这次点新增就会被误判成编辑。

### 生成新 ID 的写法拆解

```js
const newId = Math.max(...this.tableData.map(i => i.id)) + 1
```

1. `map(i => i.id)` → 把每行对象映射成 id 数组，比如 `[1, 2]`
2. `Math.max(...[1, 2])` → 展开运算符把数组拆成参数，等于 `Math.max(1, 2)`
3. `+ 1` → 取最大值加一，得到 `3`

> ⚠️ **真实项目不会这么做**：ID 由后端数据库生成。第 4 课改成接口后，新增只需要把数据发给后端，前端不关心 ID。

## 2.6 原理讲解：删除为什么要用 `$confirm` + `.catch`

```js
this.$confirm("确定删除该用户吗？", "提示", {
  confirmButtonText: "确定",
  cancelButtonText: "取消",
  type: "warning"
}).then(() => {
  // 用户点了"确定"
}).catch(() => {
  // 用户点了"取消"或关闭
})
```

`$confirm` 返回的是一个 **Promise**：

- 点确定 → resolve → 走 `.then`，执行真正的删除
- 点取消/关闭 → reject → 走 `.catch`

**删除是危险操作，必须二次确认**，这是产品规范，不是可选项。

> ⚠️ **常见报错**：只写 `.then` 不写 `.catch`，用户点"取消"时控制台会抛出 `Uncaught (in promise) cancel` 红色错误。虽然不影响功能，但很不专业。**`$confirm` 一定要配 `.catch`**。

## 2.7 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 表格一片空白 | `:data` 写成了 `data`（丢了冒号） | 写成 `:data="tableData"` |
| 列显示不出内容 | `prop` 名字和数据字段不一致（大小写也算） | 对齐 `prop="username"` 与数据里的 `username` |
| 点"编辑"弹出的是上一次的数据 | 忘了 `this.form = { ...row }` | 按 2.4 加拷贝 |
| 编辑取消后表格数据却被改了 | 同样是没有浅拷贝，改到了原对象 | 同上 |
| 控制台 `Uncaught (in promise) cancel` | `$confirm` 缺 `.catch` | 补 `.catch(() => {})` |
| `danger` 属性加了但按钮不红 | `danger` 不是有效属性 | 用 `<el-button link type="danger">` |

### 🔍 调试技巧

在 `submitForm` 里加一行 `console.log(this.form)`，能在 Console 看到保存瞬间表单的真实内容——**判断"是新增还是编辑"的分支是否走对了**，一眼就能看出来。

## 2.8 本课小结

- 一个标准 CRUD 页面 = 搜索区 + 表格 + 弹窗表单
- 操作列要用**作用域插槽**拿到 `scope.row`
- **双数组**（`originData` / `tableData`）+ **浅拷贝**，是搜索结果能复原的关键
- 新增/编辑靠 `form.id` 是否存在来分流，弹窗可以完全复用

---

# 第 3 课：路由全局守卫（登录权限拦截）

**本课目标**：没登录的人，输什么地址都进不去中台。

## 3.1 代码

在 `src/router/index.js` 中，`export default router` **之前**追加：

```js
//全局路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  //去往登录页直接放行
  if (to.path === "/login") {
    next()
  } else {
    //有token放行，没有跳登录
    if (token) {
      next()
    } else {
      next("/login")
    }
  }
})
```

> 📌 原文档写的是"在文件末尾追加"。写在 `export default` 之后**也能运行**（同一模块的代码依然会执行），但放在 export 之前更符合阅读习惯。

## 3.2 原理讲解：守卫是什么、什么时候执行

**路由守卫 = 在跳转真正发生之前，插一段检查逻辑。**

`beforeEach` 的执行时机：

```text
用户点击菜单 / 手输地址 / router.push()
        ↓
🚧 beforeEach 被调用      ← 检查在这里
        ↓
next() 放行 → 渲染组件
next(false) 拦截 → 原地不动
next('/login') 改道 → 跳去登录页
```

三个参数：

| 参数 | 含义 |
|---|---|
| `to` | 即将要去的路由对象（`to.path` 是目标路径） |
| `from` | 当前所在的路由对象 |
| `next` | **放行函数**，必须调用，否则导航会永远卡住 |

### 原理讲解：为什么要从 localStorage 读而不是从 Vuex 读

```js
const token = localStorage.getItem("token")
```

守卫写在 `router/index.js` 里，**这个文件访问不到组件实例，也就用不了 `this.$store`**。而 Vuex 的初始值正是从 localStorage 读的，两者数据一致，所以直接读 localStorage 最省事。

（另一种写法是 `import store from '../store'` 然后 `store.state.token`，效果相同。）

### 原理讲解：为什么登录页要单独放行

```js
if (to.path === "/login") { next() }
```

如果不放行，会和另一个分支形成**死循环**：

```text
用户访问 /dashboard → 没 token → next('/login')
→ 又要去 /login → 又被守卫拦下 → 又 next('/login') → ……
浏览器报错：Maximum call stack size exceeded
```

所以**登录页必须无条件放行**，这是所有权限守门的固定套路。

## 3.3 演示效果

1. 登录后能正常访问 `#/dashboard`
2. 打开 **F12 → Application → Local Storage**，删除 `token` 和 `userInfo`
3. 手动把地址改成 `http://localhost:8080/#/dashboard` 回车
4. **预期**：瞬间被弹回 `#/login`

## 3.4 进阶写法：白名单（推荐掌握）

现在只有"登录页"一个豁免，用 `if` 就够了。但如果以后要加"注册页""忘记密码页"，`if` 会越写越长。更优雅的写法是**白名单数组**：

```js
// 无需登录就能访问的路径
const whiteList = ["/login", "/register", "/404"]

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  if (token) {
    // 已登录：还要去登录页 → 直接送去首页，避免重复登录
    if (to.path === "/login") {
      next("/dashboard")
    } else {
      next()
    }
  } else {
    // 未登录：在白名单里放行，否则去登录页
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next("/login")
    }
  }
})
```

多出来的一个细节：**已登录用户访问登录页时，直接送去仪表盘**，避免"已经登录了还能看到登录框"的怪异体验。

## 3.5 进阶写法：顶部进度条（提升质感）

中台页面加载时顶部有一条蓝色进度条，会让等待感明显降低。安装：

```bash
npm install nprogress --save
```

在 `router/index.js` 引入：

```js
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

router.beforeEach((to, from, next) => {
  NProgress.start()
  // …原有鉴权逻辑…
})

router.afterEach(() => {
  NProgress.done()
})
```

之后每次路由跳转，顶部都会自动出现进度条。

## 3.6 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 页面卡死不动、白屏 | 某个分支忘了调用 `next()` | 保证每条路径最终都会执行 `next` |
| `Maximum call stack size exceeded`（栈溢出） | 登录页没放行，和重定向形成死循环 | 加 `to.path === '/login'` 判断 |
| 登录成功却还是被弹回登录页 | `setToken` 没执行 / key 名写错 | Console 里执行 `localStorage.getItem('token')` 确认 |
| 守卫代码写了但完全没生效 | 写在了 `export default router` 之后另一个文件里，或改完没重启 | 确认在 `router/index.js` 内，并重启 `npm run serve` |

> ⚠️ **陷阱**：`npm run serve` 是热更新的，但**改 `router/index.js`、`store/index.js`、`vue.config.js` 这类配置文件后，建议手动重启**，否则可能出现"代码明明改对了却不生效"的假象。

## 3.7 本课小结

- 守卫的本质是"跳转前的检查点"，`next` 是放行开关
- 登录页必须无条件放行，否则死循环
- 用**白名单数组**代替一串 `if`，扩展性更好
- `NProgress` 一行代码换来明显的体验提升

---

# 第 4 课：Axios 封装 + MockJS 模拟后端接口

**本课目标**：把"写死在页面里的假数据"换成"像真项目一样发请求拿数据"。

**知识点**：Axios 实例、请求/响应拦截器、接口分层、MockJS 拦截原理

## 4.1 安装依赖

```bash
npm install axios mockjs --save
```

## 4.2 创建请求封装 `src/api/request.js`

```js
import axios from 'axios'

const service = axios.create({
  baseURL: "/api",
  timeout: 5000
})

//请求拦截器，自动带上token
service.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.token = token
  }
  return config
})

//响应拦截器
service.interceptors.response.use(res => {
  return res.data
}, err => {
  return Promise.reject(err)
})

export default service
```

## 4.3 接口文件 `src/api/user.js`

```js
import request from './request'

//获取用户列表
export function getUserList(params) {
  return request({
    url: "/user/list",
    method: "get",
    params
  })
}

//新增用户
export function addUser(data) {
  return request({
    url: "/user/add",
    method: "post",
    data
  })
}

//编辑用户
export function editUser(data) {
  return request({
    url: "/user/edit",
    method: "post",
    data
  })
}

//删除用户
export function delUser(id) {
  return request({
    url: "/user/delete",
    method: "post",
    data: { id }
  })
}
```

## 4.4 Mock 模拟后端 `src/mock/index.js`

```js
import Mock from 'mockjs'

//用户列表接口（用正则匹配，兼容带查询参数的 URL，详见 4.6）
Mock.mock(/\/api\/user\/list/, "get", () => {
  return {
    code: 200,
    data: [
      { id: 1, username: "张三", phone: "13800138000", role: "admin" },
      { id: 2, username: "李四", phone: "13900139000", role: "user" }
    ]
  }
})

Mock.mock("/api/user/add", "post", () => {
  return { code: 200, msg: "新增成功" }
})

Mock.mock("/api/user/edit", "post", () => {
  return { code: 200, msg: "编辑成功" }
})

Mock.mock("/api/user/delete", "post", () => {
  return { code: 200, msg: "删除成功" }
})

export default Mock
```

## 4.5 在 `main.js` 引入 mock

```js
import './mock'
```

## 4.6 原理讲解：为什么要封装 axios（而不是到处 `axios.get`）

**问题**：项目里有 50 个接口，如果每个页面都写一遍 `axios.get('http://xxx/api/...', { headers: { token } })`，会有三个后果：

1. 域名变了要改 50 处
2. 每个请求都要手动塞 token，总有人忘
3. 后端返回的结构要每处都解析一遍

**解法：抽成一个公共实例**，只配置一次，全局复用。

```text
     页面/组件
        ↓ 调用 getUserList()（业务语义）
   src/api/user.js     ← 只写"接口地址和参数"
        ↓ 调用 request()
   src/api/request.js  ← 只写"公共配置和拦截器"
        ↓
      axios → 后端
```

这就是**接口分层**：组件不关心 URL，`api` 层不关心 token，`request` 层不关心业务。**改动一处，全局生效**。

### 原理讲解：`baseURL` 让接口地址变短

```js
baseURL: "/api"     // 统一前缀
url: "/user/list"   // 各接口只写后半截
```
实际请求地址 = `/api` + `/user/list` = **`/api/user/list`**。

用相对路径（不带 `http://localhost:3000`）的好处：开发时走代理、上线时走同域，**不用改代码**。

### 原理讲解：请求拦截器（自动带 token）

```js
service.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.token = token
  }
  return config
})
```

**拦截器 = 请求发出前的统一加工站。** 这里做了两件事：

1. 从 localStorage 取 token
2. 塞进请求头 `config.headers.token`，然后 `return config` 放行

以后所有请求都会自动带上 token，业务代码里完全不用管。**真实项目还会在这里统一处理 401（token 过期跳登录）。**

### 原理讲解：响应拦截器（剥掉一层 `res.data`）

```js
service.interceptors.response.use(res => {
  return res.data          // ← 关键
}, err => {
  return Promise.reject(err)
})
```

axios 返回的完整响应对象长这样：

```js
{
  data: { code: 200, data: [...] },  // 后端真正返回的内容
  status: 200,
  headers: {...},
  config: {...}
}
```

真正的业务数据藏在 **`res.data`** 里。拦截器直接 `return res.data`，于是：

- **不封装时**：`const res = await axios.get(...)`，要用 `res.data.data` 才能拿到列表
- **封装后**：`const res = await getUserList()`，`res` 就已经是 `{ code: 200, data: [...] }`

```js
// 页面里最终这样写，干净很多
const res = await getUserList({ keyword: this.query.keyword })
this.tableData = res.data
```

## 4.7 原理讲解：MockJS 怎么"骗"过 axios 的

这是本课最值得讲清的一点：

```text
MockJS 加载时，悄悄替换了浏览器原生的 XMLHttpRequest 对象
        ↓
axios 在浏览器里默认就是用 XMLHttpRequest 发请求
        ↓
axios 以为自己发出了请求，实际被 MockJS 拦下来了
        ↓
MockJS 匹配到规则 → 直接返回事先写好的假数据
        ↓
所以 Network 面板里根本看不到真实的服务器请求
```

**三个必须知道的点**：

1. **不需要后端**，前端就能独立跑通完整的数据流
2. **后端接口一上线，删掉 `import './mock'` 即可切到真接口**，业务代码一行不用改——这就是接口分层的价值
3. **MockJS 只认精确匹配**：`Mock.mock("/api/user/list", ...)` 只能匹配**完全等于**这个字符串的 URL

### ⚠️ 坑点：带查询参数时匹配不上

看看这个真实场景：

```js
// 接口层
getUserList({ keyword: "张" })
// axios 实际请求的地址会变成：
// /api/user/list?keyword=%E5%BC%A0     ← 带了查询参数
```

而 Mock 规则写的是字符串 `"/api/user/list"`，**两者不相等，匹配失败**。现象是：请求发出去了，但返回的是 MockJS 的默认随机数据，或者干脆报错。

**两种解法**（推荐第二种）：

```js
// 解法一：用正则匹配（推荐，本课程采用）
Mock.mock(/\/api\/user\/list/, "get", () => ({ code: 200, data: [] }))

// 解法二：MockJS 允许在 rurl 里用占位，但不如正则直观
```

正则 `/\/api\/user\/list/` 的意思是"URL 里**包含**这段字符串就匹配"，所以带不带 `?keyword=xxx` 都能命中。

> 💡 **调试技巧**：Mock 请求在 Network 面板里是**看不到的**。想确认 Mock 是否命中，直接在 `src/mock/index.js` 的返回函数里加 `console.log('Mock 命中')`，能打印就说明匹配成功了。

## 4.8 完整改造：让 User.vue 走接口（重点）

原文档这里只写了"拓展：改造 User.vue"，现在给出**完整可用代码**，这是本课的高潮——把前面学的东西全部串起来。

```vue
<template>
  <el-card>
    <!-- 搜索区域 -->
    <div class="search-box">
      <el-input
        v-model="query.keyword"
        placeholder="搜索用户名"
        style="width:220px"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openAddDialog">新增用户</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table v-loading="loading" :data="tableData" border stripe style="margin-top:15px">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="角色" prop="role">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width:100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
// 引入接口
import { getUserList, addUser, editUser, delUser } from '../api/user'

export default {
  name: "User",
  data() {
    return {
      query: { keyword: "" },
      tableData: [],
      loading: false,      // 表格加载状态
      submitting: false,   // 提交按钮加载状态
      dialogVisible: false,
      dialogTitle: "新增用户",
      form: { id: "", username: "", phone: "", role: "" }
    }
  },
  created() {
    // 页面加载即拉取列表（原来是 this.originData = [...this.tableData]）
    this.fetchList()
  },
  methods: {
    // ========== 统一的获取列表方法 ==========
    async fetchList() {
      this.loading = true
      try {
        const res = await getUserList({ keyword: this.query.keyword })
        if (res.code === 200) {
          this.tableData = res.data
        }
      } catch (e) {
        this.$message.error("获取列表失败")
        console.error(e)
      } finally {
        this.loading = false   // 无论成功失败都要关掉 loading
      }
    },

    // 搜索：直接重新请求接口，不再需要 originData 手动过滤
    handleSearch() {
      this.fetchList()
    },

    // 打开新增弹窗
    openAddDialog() {
      this.dialogTitle = "新增用户"
      this.form = { id: "", username: "", phone: "", role: "" }
      this.dialogVisible = true
    },

    // 打开编辑弹窗
    openEditDialog(row) {
      this.dialogTitle = "编辑用户"
      this.form = { ...row }
      this.dialogVisible = true
    },

    // 提交保存（新增 / 编辑分流）
    async submitForm() {
      this.submitting = true
      try {
        let res
        if (this.form.id) {
          res = await editUser(this.form)     // 有 id → 编辑
        } else {
          res = await addUser(this.form)      // 无 id → 新增
        }
        if (res.code === 200) {
          this.$message.success(res.msg || "保存成功")
          this.dialogVisible = false
          this.fetchList()                    // 重新拉取列表，保证和数据源一致
        }
      } catch (e) {
        this.$message.error("保存失败")
      } finally {
        this.submitting = false
      }
    },

    // 删除
    handleDelete(row) {
      this.$confirm(`确定删除用户「${row.username}」吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        const res = await delUser(row.id)
        if (res.code === 200) {
          this.$message.success("删除成功")
          this.fetchList()
        }
      }).catch(() => {
        // 取消删除，不做操作
      })
    }
  }
}
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
```

### 改造带来了哪些变化（对比第 2 课）

| 对比项 | 第 2 课（静态数据） | 第 4 课（接口版） |
|---|---|---|
| 数据来源 | `data()` 里写死 | `created` 里 `fetchList()` 拉取 |
| 搜索方式 | 本地 `filter` 过滤 | 把 keyword 传给后端查询 |
| `originData` | **需要**（用来还原） | **删掉了**！数据源在后端，重查即可 |
| ID 生成 | 前端 `Math.max + 1` | 后端生成，前端不管 |
| 用户体验 | 无 | 加了 `v-loading` 表格遮罩、按钮 loading |
| 错误处理 | 基本没有 | `try/catch` + 友好提示 |

### 原理讲解：`async / await` 与 `try / catch / finally`

```js
async fetchList() {
  this.loading = true
  try {
    const res = await getUserList(...)   // 等接口返回
    this.tableData = res.data
  } catch (e) {
    this.$message.error("获取列表失败")   // 接口挂了走这里
  } finally {
    this.loading = false                 // 成功失败都会执行
  }
}
```

- `async` 标记方法内可以使用 `await`
- `await` 会**暂停**在这一行，等请求返回再往下走（写起来像同步，实际是异步）
- `try` 里放正常逻辑，`catch` 兜住异常（网络错误、接口 500 等）
- `finally` 里的代码**无论成败都执行**——所以 `loading = false` 必须放这里，否则接口一报错 loading 就永远转下去

### 原理讲解：`v-loading` 为什么能覆盖整张表格

```vue
<el-table v-loading="loading" :data="tableData">
```

`v-loading` 是 Element 的**自定义指令**，`loading` 为 `true` 时会在绑定的元素上盖一层半透明遮罩 + 转圈动画。这是**自定义指令**的典型用法，第 9 课我们还会自己写一个。

## 4.9 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 请求地址变成 `/user/list`（丢了 `/api`） | 接口文件里的 `url` 写成了绝对地址，或没走 `request` | `url` 只写 `/user/list`，交给 `baseURL` 拼 |
| 带查询参数后 Mock 不生效，返回乱码数据 | Mock 用了字符串精确匹配 | 改成正则 `/\/api\/user\/list/` |
| `res.data` 是 `undefined` | 忘记在响应拦截器里 `return res.data`，或漏了 return | 检查 `request.js` |
| 列表请求发了但页面空 | Mock 接口名和 `api/user.js` 里的 `url` 不一致 | 两处必须完全一致 |
| `Module not found: Error: Can't resolve '../api/user'` | 文件建的路径不对，或忘了 `import` | 确认 `src/api/user.js` 存在，路径是 `../api/user` |
| 打包上线后接口全 404 | Mock 只适合开发；真接口需要配置代理 | 第 10 课讲 `devServer.proxy` |
| `Uncaught (in promise)` 报错 | `try/catch` 漏了，或 `$confirm` 缺 `.catch` | 补全异常处理 |

### 🔍 调试技巧（重要）

1. **看请求有没有发出去**：F12 → Network 面板。注意 **MockJS 拦截的请求在 Network 里是看不到的**，这一点新手极容易困惑——"明明没请求，数据怎么来的？"
2. **验证 Mock 命中**：在 mock 返回函数里打 `console.log`。
3. **直接测接口层**：在组件里 `getUserList().then(res => console.log(res))`，先确认接口通不通，再接 UI。

## 4.10 本课小结

- **接口分层**：组件 → `api/user.js` → `api/request.js` → axios
- **拦截器**统一做两件事：请求前塞 token，响应后剥 `res.data`
- **MockJS 通过替换 XMLHttpRequest** 实现零后端联调，**带参数时要用正则匹配**
- 改造成接口版后，本地的 `originData` 过滤逻辑可以整个删掉——**数据源应该只有一个**
- `async/await` + `try/catch/finally` 是处理异步请求的标准姿势

---

# 第 5 课：项目打包与本地预览

**本课目标**：理解 `npm run build` 到底做了什么，并能在本地把打包产物跑起来验证。

**知识点**：构建产物结构、静态资源路径、`serve` 本地预览

## 5.1 打包命令

```bash
npm run build
```

打包后生成 `dist` 静态资源文件夹。

## 5.2 原理讲解：`npm run serve` 和 `npm run build` 的区别

| | 开发模式 `npm run serve` | 生产模式 `npm run build` |
|---|---|---|
| 产物 | **不生成文件**，代码跑在内存里 | 生成 `dist/` 文件夹 |
| 速度 | 秒级启动，热更新 | 慢（要压缩、抽离、优化） |
| 代码 | 保留注释、不压缩、含 source map | 压缩混淆、体积最小 |
| 用途 | 写代码时用 | **部署到服务器时用** |

一句话：**开发时用 serve 图快，上线前用 build 图小。**

## 5.3 原理讲解：dist 目录里都有什么

```text
dist/
├── index.html            # 唯一入口页，里面会自动注入下面两个文件的引用
├── favicon.ico
├── css/
│   └── app.xxxxxx.css    # 样式（xxxxxx 是内容哈希）
└── js/
    ├── chunk-vendors.xxxxxx.js   # 第三方库（Vue、Element Plus 等）
    └── app.xxxxxx.js             # 我们自己写的业务代码
```

三个要点：

1. **`chunk-vendors` 和 `app` 是分开的**：Webpack 把"改动不频繁的第三方库"和"天天改的业务代码"拆开，这样用户改版后只需重新下载 `app.js`，第三方库走缓存即可——**加载更快**。
2. **文件名里的 `xxxxxx` 是内容哈希**：内容一变哈希就变，文件名就变。这样浏览器不会用旧缓存，属于**缓存失效**的标准做法。
3. **`dist` 是纯静态文件**：不需要 Node、不需要数据库，扔给任意静态服务器就能跑。

## 5.4 本地预览打包产物

打包后的文件不能直接双击 `index.html` 打开（会因 `file://` 协议导致路径错误、白屏）。要用一个静态服务器模拟线上环境：

```bash
# 全局安装轻量静态服务器
npm install -g serve

# 在项目根目录执行，-s 表示支持 SPA 路由回退
serve -s dist
```

浏览器打开命令行提示的地址（一般是 http://localhost:3000 ），能看到完整项目说明打包成功。

> 💡 **不装全局包也可以**：`npx serve -s dist` 会临时下载并执行。

### 原理讲解：`-s` 参数是什么

`-s` = `--single`，表示**所有找不到的路径都回退到 `index.html`**。这正是 SPA 的需求：用户直接访问 `/user` 时，服务器上并不存在 `user` 这个文件，需要把 `index.html` 返回给浏览器，再由前端路由解析地址。

**记住这个概念，第 10 课配 Nginx 时会再遇到一次（`try_files`）。**

## 5.5 打包白屏怎么办（必踩坑）

如果 `dist` 部署到子目录后白屏，F12 报一堆 `404 xxx/css/app.js`，原因是资源引用的路径不对。修改 `vue.config.js`：

```js
module.exports = {
  // 部署在域名根目录用 '/'，部署在子目录（如 /work-admin/）改成 '/work-admin/'
  publicPath: './'
}
```

`publicPath: './'` 表示**用相对路径引用资源**，放在哪一级目录都能跑，是学生作业最省心的配置。

## 5.6 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 打包报错 `ERROR in xxx` | 代码里有语法错误或未使用的变量被 ESLint 拦下 | 按报错信息定位到具体文件行号 |
| `dist` 打开白屏，Console 报 404 | 直接双击打开了 `index.html`，或 `publicPath` 不对 | 用 `serve -s dist` 起服务；配合 `publicPath: './'` |
| 部署后刷新 404 | 用了历史模式且服务器没做回退 | 本课程用哈希模式不存在此问题；历史模式见第 10 课 |
| 打包很慢 / 内存溢出 | 依赖过多或 Node 内存不足 | 加 `NODE_OPTIONS=--max-old-space-size=4096` |

## 5.7 本课小结

- `build` 产出纯静态 `dist`，与开发环境无关
- 产物按 `vendors` / `app` 拆分 + 内容哈希，为了更快的加载和更准的缓存
- **`dist` 必须用服务器访问**，不能双击打开
- SPA 的服务器都需要"找不到路径就回退 `index.html`"

---

# 第 6 课：公共组件封装【新增】

**本课目标**：把 User.vue 里重复的弹窗表单抽成独立组件，掌握 Vue3 组件通信与自定义 `v-model`。

**知识点**：`props` / `$emit`、自定义 `v-model`、组件复用

## 6.1 原理讲解：为什么要封装组件

观察第 4 课改造后的 User.vue，它已经 130 多行。接下来要做「任务管理」页面，需要一模一样的"新增/编辑弹窗"——是不是又要复制粘贴 60 行？而且以后要统一给所有弹窗加校验、改按钮文案，就得逐个文件改。

**封装的目标只有一个：让重复的东西只存在一份。**

抽出来之后：

```text
src/components/
└── UserFormDialog.vue    ← 弹窗 + 表单，只写一次
src/views/
├── User.vue              ← 引入组件，传数据进去
└── Task.vue              ← 同样引入，复用
```

### 原理讲解：父子组件通信的两个方向

```text
父组件 (User.vue)
    │  ① props 向下传数据（"你要显示什么"）
    ↓
子组件 (UserFormDialog.vue)
    │  ② $emit 向上发事件（"用户点了保存，数据给你"）
    ↑
父组件 监听事件，执行业务逻辑
```

记住八个字：**数据向下，事件向上。**

## 6.2 封装弹窗组件 `src/components/UserFormDialog.vue`

```vue
<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="500px"
    @update:model-value="handleVisibleChange"
    @closed="handleClosed"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.role" style="width:100%">
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleVisibleChange(false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "UserFormDialog",
  // ① 接收父组件传下来的数据
  props: {
    // 控制显隐：v-model 的本质就是这个 modelValue
    modelValue: {
      type: Boolean,
      default: false
    },
    // 弹窗标题
    title: {
      type: String,
      default: "新增用户"
    },
    // 父组件传进来的"要编辑的那一行数据"
    rowData: {
      type: Object,
      default: () => ({})
    },
    // 提交按钮的 loading，由父组件控制
    submitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 组件内部的表单副本，避免直接修改 props 里的对象
      form: {
        id: "",
        username: "",
        phone: "",
        role: ""
      }
    }
  },
  watch: {
    // 监听 rowData 变化：父组件每次打开弹窗都会传新数据进来
    rowData: {
      immediate: true,
      handler(val) {
        this.form = val && val.id
          ? { ...val }                                        // 有 id → 编辑
          : { id: "", username: "", phone: "", role: "" }      // 无 id → 新增
      }
    }
  },
  methods: {
    // ② 显隐变化时，通知父组件更新 v-model
    handleVisibleChange(val) {
      this.$emit("update:modelValue", val)
    },
    // 关闭动画结束后，通知父组件"弹窗已关"
    handleClosed() {
      this.$emit("closed")
    },
    // 提交：把表单数据发给父组件，由父组件决定是新增还是编辑
    handleSubmit() {
      this.$emit("submit", { ...this.form })
    }
  }
}
</script>
```

## 6.3 原理讲解：自定义 `v-model` 到底是怎么回事

在**原生表单元素**上，`v-model` 是"绑定 value + 监听 input 事件"的语法糖。

在**自定义组件**上，Vue3 的 `v-model` 规则是固定的：

```vue
<!-- 父组件这样写 -->
<UserFormDialog v-model="dialogVisible" />

<!-- 完全等价于 -->
<UserFormDialog
  :model-value="dialogVisible"
  @update:model-value="val => dialogVisible = val"
/>
```

所以子组件要做的就两件事：

1. **声明一个叫 `modelValue` 的 prop**（接收父组件传进来的值）
2. 需要改值时 **`this.$emit("update:modelValue", 新值)`**（通知父组件去改）

```js
handleVisibleChange(val) {
  this.$emit("update:modelValue", val)   // ← 这一句就是"双向绑定"的另一半
}
```

**为什么不能直接改 `this.modelValue = false`？** 因为 Vue 有**单向数据流**约束：子组件不能直接修改 props。父组件的值只能由父组件自己改，子组件只能"申请修改"——这就是 `$emit` 存在的意义。

> ⚠️ **常见报错**：`Avoid mutating a prop directly`。看到这个警告，说明你直接给 props 赋值了，改成 `$emit`。

### 原理讲解：为什么内部要维护一份 `form` 副本

```js
data() {
  return { form: { id: "", username: "", phone: "", role: "" } }
}
```

**不能直接 `v-model="rowData.username"`**，原因有两个：

1. 违反单向数据流（会报同样的警告），因为 `rowData` 是 props
2. 更严重的是**用户体验问题**：用户在弹窗里改了名字，还没点保存就直接点了"取消"，如果直接绑在 `rowData` 上，表格里的数据**已经被改掉了**，点取消也回不来

所以标准做法是：**拷贝一份副本，用户改副本；点保存时才通过事件把副本交出去；点取消则直接丢弃副本。**

### 原理讲解：`watch` 的 `immediate` 有什么用

```js
watch: {
  rowData: {
    immediate: true,       // ← 关键
    handler(val) { this.form = ... }
  }
}
```

- 默认 `watch` 只在**值发生变化时**触发
- 加 `immediate: true` 后，组件**初始化时就立即执行一次**

为什么需要？因为父组件每次打开弹窗都会传入新的 `rowData`，子组件必须马上把这份新数据同步到自己的 `form` 里。少了 `immediate`，第一次打开弹窗时表单会是空的。

## 6.4 在 User.vue 中使用封装好的组件

```vue
<template>
  <el-card>
    <div class="search-box">
      <el-input v-model="query.keyword" placeholder="搜索用户名" style="width:220px" />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openAddDialog">新增用户</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe style="margin-top:15px">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="角色" prop="role" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ③ 使用封装好的弹窗组件 -->
    <UserFormDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :row-data="currentRow"
      :submitting="submitting"
      @submit="submitForm"
    />
  </el-card>
</template>

<script>
import { getUserList, addUser, editUser, delUser } from '../api/user'
import UserFormDialog from '../components/UserFormDialog.vue'

export default {
  name: "User",
  components: { UserFormDialog },   // ② 注册组件
  data() {
    return {
      query: { keyword: "" },
      tableData: [],
      loading: false,
      submitting: false,
      dialogVisible: false,
      dialogTitle: "新增用户",
      currentRow: {}    // 传给弹窗的那一行数据
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await getUserList({ keyword: this.query.keyword })
        if (res.code === 200) this.tableData = res.data
      } catch (e) {
        this.$message.error("获取列表失败")
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.fetchList()
    },
    // 新增：currentRow 传空对象
    openAddDialog() {
      this.dialogTitle = "新增用户"
      this.currentRow = {}
      this.dialogVisible = true
    },
    // 编辑：currentRow 传该行数据
    openEditDialog(row) {
      this.dialogTitle = "编辑用户"
      this.currentRow = { ...row }
      this.dialogVisible = true
    },
    // 接收弹窗抛上来的表单数据
    async submitForm(form) {
      this.submitting = true
      try {
        const res = form.id ? await editUser(form) : await addUser(form)
        if (res.code === 200) {
          this.$message.success(res.msg || "保存成功")
          this.dialogVisible = false
          this.fetchList()
        }
      } catch (e) {
        this.$message.error("保存失败")
      } finally {
        this.submitting = false
      }
    },
    handleDelete(row) {
      this.$confirm(`确定删除用户「${row.username}」吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        const res = await delUser(row.id)
        if (res.code === 200) {
          this.$message.success("删除成功")
          this.fetchList()
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.search-box { display: flex; gap: 10px; align-items: center; }
</style>
```

### 对比：封装前后的职责划分

| | 封装前（第 4 课） | 封装后（第 6 课） |
|---|---|---|
| User.vue 代码量 | 约 130 行 | 约 90 行（弹窗部分全删） |
| 弹窗表单 | 写在页面里 | `components/UserFormDialog.vue` 独立 |
| 新增任务页时 | 复制 60 行 | `import` 一行即可复用 |
| 职责 | 页面既管列表又管表单 | **页面管列表，组件管表单** |

> 💡 **命名提示**：`rowData` 在 template 里写成 `:row-data`（短横线），在 props 里声明成 `rowData`（驼峰）。**HTML 属性不区分大小写，所以 Vue 规定用短横线形式**，这是新手最容易搞混的一处。

## 6.5 进阶：把搜索栏也封装掉

同样的思路，可以把"输入框 + 查询按钮 + 新增按钮"抽成 `SearchBar`：

```vue
<!-- src/components/SearchBar.vue -->
<template>
  <div class="search-box">
    <el-input
      :model-value="modelValue"
      :placeholder="placeholder"
      style="width:220px"
      @update:model-value="$emit('update:modelValue', $event)"
      @keyup.enter="$emit('search')"
    />
    <el-button type="primary" @click="$emit('search')">查询</el-button>
    <el-button type="success" @click="$emit('add')">新增</el-button>
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "请输入关键字" }
  },
  emits: ["update:modelValue", "search", "add"]
}
</script>

<style scoped>
.search-box { display: flex; gap: 10px; align-items: center; }
</style>
```

页面里使用：

```vue
<SearchBar v-model="query.keyword" placeholder="搜索用户名" @search="handleSearch" @add="openAddDialog" />
```

## 6.6 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 弹窗打不开 | 子组件没声明 `modelValue` prop，或没 emit `update:modelValue` | 按 6.3 检查两处 |
| 控制台警告 `Avoid mutating a prop directly` | 子组件直接给 props 赋值（如 `v-model="rowData.username"`） | 改为内部 `form` 副本 + `$emit` |
| 第一次打开弹窗表单是空的 | `watch` 少了 `immediate: true` | 加上 |
| 传了 `rowData` 但子组件收到的是 `undefined` | template 里写成了 `:rowData`（大小写不匹配） | 改成 `:row-data` |
| `[Vue warn]: Failed to resolve component: UserFormDialog` | 忘记在 `components` 里注册，或路径写错 | 补 `components: { UserFormDialog }` |
| 点"取消"后表格数据被改了 | 没有 `{...row}` 拷贝，直接传了原对象引用 | 按 6.4 用 `{ ...row }` |

### 🔍 调试技巧

在子组件里打 `console.log(this.rowData)`，在父组件里打 `console.log(this.currentRow)`。**如果子组件收到的和父组件传的不一样，问题一定在 prop 名字的短横线写法上。**

## 6.7 本课小结

- 组件通信铁律：**props 向下传数据，$emit 向上发事件**
- 自定义 `v-model` = `modelValue` prop + `update:modelValue` 事件
- **子组件内部要维护数据副本**，不能直接改 props（既违规又会引发"取消后数据被改"的 bug）
- `watch` 加 `immediate: true` 才能在初始化时同步一次数据
- 封装一次，所有 CRUD 页面都能复用

---

# 第 7 课：ECharts 数据可视化【新增】

**本课目标**：给仪表盘接上真实的统计图表，掌握 ECharts 在 Vue3 中的正确集成方式。

**知识点**：ECharts 初始化、`ref` 引用 DOM、响应式 resize、按需引入

## 7.1 安装

```bash
npm install echarts --save
```

## 7.2 原理讲解：ECharts 在 Vue 里怎么工作

ECharts **不是 Vue 组件**，它只是一个普通的 JS 图表库。所以它不需要"Vue 的配合"，只需要**两件东西**：

```text
① 一个 DOM 容器（必须有明确的宽高）
        +
② 用 JS 调用 echarts.init(容器)，然后 setOption(配置)
```

生命周期的对应关系：

| 时机 | 要做什么 |
|---|---|
| 组件挂载完成 `mounted` | 容器 DOM 已存在 → `echarts.init()` + `setOption()` |
| 窗口大小变化 | `chart.resize()`，否则图表不会跟着变宽 |
| 组件销毁 `beforeUnmount` | `chart.dispose()` 释放内存，防泄漏 |

## 7.3 改造 Dashboard.vue

```vue
<template>
  <div>
    <el-card>
      <h3>仪表盘首页</h3>
      <p>欢迎进入工作中台，展示统计数据</p>

      <el-row :gutter="20" style="margin-top:20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">用户总数：136</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">待办任务：18</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">已完成任务：421</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="num-card">系统消息：6</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>月度任务完成情况</template>
          <!-- 必须有高度，否则图表高度为 0 看不到 -->
          <div ref="barRef" class="chart" style="height:320px"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>用户角色分布</template>
          <div ref="pieRef" class="chart" style="height:320px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: "Dashboard",
  data() {
    return {
      barChart: null,   // 保存图表实例，供 resize / dispose 使用
      pieChart: null
    }
  },
  mounted() {
    // DOM 已经渲染完成，可以初始化图表了
    this.initBarChart()
    this.initPieChart()
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    // 清理，防止内存泄漏与报错
    window.removeEventListener('resize', this.handleResize)
    this.barChart && this.barChart.dispose()
    this.pieChart && this.pieChart.dispose()
  },
  methods: {
    initBarChart() {
      // ① 初始化实例，绑定到 ref 拿到的 DOM
      this.barChart = echarts.init(this.$refs.barRef)
      // ② 配置图表
      this.barChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['已完成', '待办'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '已完成',
            type: 'bar',
            data: [120, 200, 150, 80, 70, 110],
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '待办',
            type: 'bar',
            data: [20, 32, 18, 30, 25, 12],
            itemStyle: { color: '#E6A23C' }
          }
        ]
      })
    },
    initPieChart() {
      this.pieChart = echarts.init(this.$refs.pieRef)
      this.pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [
          {
            name: '角色分布',
            type: 'pie',
            radius: ['45%', '65%'],   // 环形图
            center: ['50%', '45%'],
            data: [
              { value: 26, name: '管理员' },
              { value: 110, name: '普通用户' }
            ]
          }
        ]
      })
    },
    handleResize() {
      this.barChart && this.barChart.resize()
      this.pieChart && this.pieChart.resize()
    }
  }
}
</script>

<style scoped>
.num-card {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.chart {
  width: 100%;
}
</style>
```

## 7.4 原理讲解：为什么必须用 `ref` 拿到 DOM

Vue 的数据驱动模式里，我们一般不碰 DOM。但 ECharts 需要一个**真实的 DOM 节点**作为画布，所以要用 Vue 提供的"后门"——`ref`：

```vue
<div ref="barRef"></div>
```

```js
echarts.init(this.$refs.barRef)   // 通过 $refs 拿到真实 DOM 元素
```

**记住两个绑定关系**：

- template 里写 `ref="barRef"`（字符串）
- JS 里读 `this.$refs.barRef`（对象）

### ⚠️ 三个必踩的坑

**坑 1：容器没有高度，图表不可见**

ECharts 容器的宽高**必须由 CSS 决定**。如果容器高度是 0，图表渲染出来就是一片空白，而且**不报任何错**。

```vue
<!-- ✅ 必须有高度 -->
<div ref="barRef" style="height:320px"></div>

<!-- ❌ 高度为 0，白屏 -->
<div ref="barRef"></div>
```

**坑 2：在 `created` 里初始化会失败**

`created` 阶段**DOM 还没渲染出来**，`this.$refs.barRef` 是 `undefined`，会报 `Cannot read properties of undefined`。**必须写成 `mounted`。**

**坑 3：窗口缩放后图表没跟着变**

ECharts 在初始化时"记住"了容器尺寸，之后窗口变大变小它**不会自动重算**。所以必须监听 resize 手动调用 `chart.resize()`：

```js
window.addEventListener('resize', this.handleResize)

// 组件销毁时一定要移除监听，否则会内存泄漏 + 报错
beforeUnmount() {
  window.removeEventListener('resize', this.handleResize)
}
```

> 💡 **进阶**：如果第 8 课做了"侧边菜单折叠"，折叠后容器宽度变了但窗口没变，`window.resize` 不会触发。这时要在折叠的 `watch` 里也调用一次 `chart.resize()`。

## 7.5 原理讲解：`dispose` 和内存泄漏

```js
beforeUnmount() {
  this.barChart && this.barChart.dispose()
}
```

ECharts 实例内部会持有 DOM 引用、定时器、事件监听。**不销毁的后果**：在仪表盘和其他页面之间反复切换几十次后，内存占用越来越高，页面变卡——这就是**内存泄漏**。

`dispose()` 会把这个实例彻底销毁、释放资源。**这是 Vue 组件里使用第三方 DOM 库的通用收尾动作。**

## 7.6 进阶：按需引入（明显减小打包体积）

`import * as echarts from 'echarts'` 会把**所有图表类型**（折线、雷达、地图、3D……）全部打进包里，通常让包体积增加 900KB 以上。如果只用了柱状图和饼图，可以按需引入：

```js
// 只引入需要的模块
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册用到的模块
echarts.use([
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
])
```

其余代码完全不用改。**打包体积能减少一半以上**，这是真实项目里的标准做法。

## 7.7 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 图表区域一片空白，**无任何报错** | 容器没有高度 | 给容器加 `height: 320px` |
| `Cannot read properties of undefined (reading 'init')` | 在 `created` 里初始化，`$refs` 还是 undefined | 改到 `mounted` |
| 图表显示但很窄 / 挤在一侧 | 容器宽度为 0（父级用了 `display:none` 或未撑开） | 给容器 `width: 100%` |
| 缩放窗口后图表变形 | 没监听 resize | 加 `window.addEventListener('resize', ...)` |
| 切换页面报错、内存持续增长 | 没有 `dispose()` | 在 `beforeUnmount` 里销毁 |
| 打包体积突然涨了 1MB | 全量引入了 echarts | 按 7.6 按需引入 |

### 🔍 调试技巧

图表不显示时，**第一步永远是打开 F12 选中那个 div，看它的宽高是不是 0**。这个问题占了图表问题的九成。

## 7.8 本课小结

- ECharts 不是 Vue 组件，需要 `ref` 拿到真实 DOM 才能初始化
- **初始化必须在 `mounted`**，因为要等 DOM 渲染完
- 容器**必须有高度**，否则静默白屏（最坑）
- 窗口变化要手动 `resize()`，组件销毁要 `dispose()`
- 生产项目用**按需引入**控制包体积

---

# 第 8 课：文件上传 + 批量删除【新增】

**本课目标**：实现头像上传和表格多选批量删除，补齐中台常见的交互能力。

**知识点**：`el-upload`、`before-upload` 校验、多选表格、`selection-change`

## 8.1 原理讲解：`el-upload` 的两种工作模式

Element 的上传组件有两种用法，选错会绕很多弯路：

| 模式 | 谁负责发请求 | 适用场景 |
|---|---|---|
| **自动上传** | 组件自己发（配 `action` 地址） | 后端有标准上传接口，拿来即用 |
| **手动上传** | 我们自己发（配 `:auto-upload="false"`） | 需要自定义参数、走封装好的 axios、走 Mock |

**本课程用第二种**，因为它和我们已经封装好的 `request.js` 能打通，也更贴近真实项目的做法。

## 8.2 头像上传（图片预览）

新建 `src/components/AvatarUpload.vue`：

```vue
<template>
  <div>
    <el-upload
      class="avatar-uploader"
      action="#"
      :show-file-list="false"
      :auto-upload="false"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      accept="image/*"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <div class="tip">仅支持 jpg / png，大小不超过 2MB</div>
  </div>
</template>

<script>
export default {
  name: "AvatarUpload",
  data() {
    return {
      imageUrl: ""
    }
  },
  methods: {
    // 上传前校验（返回 false 会阻止上传）
    beforeUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error("只能上传 jpg / png 格式的图片")
        return false
      }
      if (!isLt2M) {
        this.$message.error("图片大小不能超过 2MB")
        return false
      }
      return true
    },
    // 选中文件后，本地生成预览地址
    handleChange(file) {
      // URL.createObjectURL 直接读取本地文件，不需要请求服务器
      this.imageUrl = URL.createObjectURL(file.raw)
      this.$emit("change", file.raw)
    }
  }
}
</script>

<style scoped>
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color .3s;
}
.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}
.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
```

### 原理讲解：`before-upload` 是"守门员"

```js
beforeUpload(file) {
  if (不合法) return false   // 阻止上传
  return true                // 放行
}
```

**返回 `false` 会直接阻止上传**。校验内容通常是两项：

- **文件类型**：`file.type`（如 `image/png`）
- **文件大小**：`file.size` 是**字节**，除以 `1024` 得 KB，再除 `1024` 得 MB

**为什么要在前端校验？** 一是省流量、省用户等待时间；二是给用户即时反馈。但**后端也必须再校验一次**——前端校验只是体验优化，绕过它太容易了。

### 原理讲解：`URL.createObjectURL` 与 `:deep()`

**`URL.createObjectURL(file.raw)`**：浏览器提供的能力，直接在内存里为这个本地文件生成一个临时地址（形如 `blob:http://localhost:8080/xxx`），`img` 的 `src` 可以立刻显示，**完全不需要上传到服务器**。这就是"选完图片马上就能看到预览"的原理。

> 用完建议释放：`URL.revokeObjectURL(this.imageUrl)`，避免内存占用。

**`:deep()`**：`<style scoped>` 的样式**只会作用于本组件的元素**，但 `el-upload` 内部的 DOM 是 Element 渲染的、不属于本组件，直接写 `.el-upload {}` 不生效。`:deep(.el-upload)` 就是"**穿透 scoped 限制，去改子组件内部的样式**"。

## 8.3 批量删除

### 第一步：表格加上多选列

```vue
<el-table
  ref="tableRef"
  v-loading="loading"
  :data="tableData"
  border
  stripe
  @selection-change="handleSelectionChange"
>
  <!-- type="selection" 会渲染成一列复选框 -->
  <el-table-column type="selection" width="55" />
  <el-table-column label="ID" prop="id" width="80" />
  <el-table-column label="用户名" prop="username" />
  <el-table-column label="手机号" prop="phone" />
  <el-table-column label="角色" prop="role" />
  <el-table-column label="操作" width="150">
    <template #default="{ row }">
      <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
      <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
    </template>
  </el-table-column>
</el-table>

<!-- 批量删除按钮：放在表格上方 -->
<el-button
  type="danger"
  :disabled="selectedRows.length === 0"
  @click="handleBatchDelete"
>
  批量删除（已选 {{ selectedRows.length }} 项）
</el-button>
```

### 第二步：JS 逻辑

```js
data() {
  return {
    // ...
    selectedRows: []    // 当前勾选的行
  }
},
methods: {
  // 勾选变化时触发，参数就是所有被选中行的数组
  handleSelectionChange(rows) {
    this.selectedRows = rows
  },

  // 批量删除
  handleBatchDelete() {
    if (this.selectedRows.length === 0) {
      this.$message.warning("请先勾选要删除的用户")
      return
    }

    this.$confirm(`确定删除选中的 ${this.selectedRows.length} 个用户吗？`, "批量删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(async () => {
      const ids = this.selectedRows.map(item => item.id)

      // 方式一：循环调用单个删除接口
      for (const id of ids) {
        await delUser(id)
      }
      // 方式二（真实项目推荐）：调用批量删除接口 delUserBatch(ids)
      // await delUserBatch(ids)

      this.$message.success(`成功删除 ${ids.length} 条数据`)
      this.selectedRows = []
      this.fetchList()
    }).catch(() => {})
  },

  // 单行删除后，要清掉表格的勾选状态
  clearSelection() {
    this.$refs.tableRef.clearSelection()
  }
}
```

### 原理讲解：`selection-change` 是怎么工作的

```vue
<el-table @selection-change="handleSelectionChange">
<el-table-column type="selection" />
```

- `type="selection"` 让这一列变成**复选框列**
- 用户勾选/取消/全选时，`el-table` 会**自动触发** `selection-change` 事件
- 事件的回调参数就是**当前所有被选中行的数组**（行对象数组，不是 id 数组）

所以我们只需要把它存起来，用的时候再 `map` 出 id：

```js
const ids = this.selectedRows.map(item => item.id)   // [1, 3, 5]
```

### 原理讲解：`ref` + `clearSelection()` 两个易错点

**易错点 1：删除后复选框还勾着**

删除并重新 `fetchList()` 后，表格数据变了，但**勾选状态还残留在组件内部**。用户会看到"数据没了，勾还在"。解决：

```js
this.$refs.tableRef.clearSelection()
```

（注意：`clearSelection` 是挂在 `el-table` 实例上的方法，所以表格标签上必须有 `ref="tableRef"`。）

**易错点 2：批量删除期间用户可能重复点击**

`for...of` + `await` 是**串行**执行，10 条数据要发 10 个请求、等 10 次响应，很慢。真实项目应该：

1. 让后端提供**批量删除接口**（一次请求删多条）
2. 或者用 `Promise.all(ids.map(id => delUser(id)))` **并行**发送

```js
// 并行版本（注意：后端需支持并发，否则可能引发锁表）
await Promise.all(ids.map(id => delUser(id)))
```

> ⚠️ **接口层补充**：如果要用批量删除，在 `src/api/user.js` 和 `src/mock/index.js` 里加一个：
> ```js
> // api/user.js
> export function delUserBatch(ids) {
>   return request({ url: "/user/deleteBatch", method: "post", data: { ids } })
> }
> ```
> ```js
> // mock/index.js
> Mock.mock("/api/user/deleteBatch", "post", () => ({ code: 200, msg: "批量删除成功" }))
> ```

## 8.4 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| `el-upload` 图标不显示 | 图标未注册（第 1 课循环注册漏了） | 确认 `main.js` 里注册了图标 |
| 选完文件没反应 | 写了 `:auto-upload="false"` 但没有 `:on-change` 处理 | 加 `on-change` |
| `before-upload` 校验不生效 | 用了 `auto-upload=false` 时，`before-upload` 可能不触发 | 校验逻辑改到 `on-change` 里 |
| 上传框样式改不动 | scoped 样式无法穿透子组件 | 用 `:deep(.el-upload)` |
| 批量删除按钮一直是禁用 | 忘了 `@selection-change` 绑定 | 补上事件 |
| `this.$refs.tableRef` 是 undefined | 表格标签上没有 `ref="tableRef"` | 补上 ref 属性 |
| 删除后勾选框还在 | 没调 `clearSelection()` | 删除成功后调用 |

### 🔍 调试技巧

在 `handleSelectionChange` 里打 `console.log(rows)`，勾选不同数量的复选框，观察参数变化——能直观理解"**参数是整行对象数组**"这个关键点。

## 8.5 本课小结

- `el-upload` 用 `:auto-upload="false"` + `on-change`，可以完全接进自己封装的 axios
- `before-upload` 是文件守门员，**类型 + 大小**两项必校验
- `URL.createObjectURL` 实现零请求的本地图片预览
- **`:deep()` 是 scoped 样式穿透子组件的唯一方式**
- 批量删除 = `type="selection"` 列 + `@selection-change` + `ref` + `clearSelection()`
- 批量操作优先让后端提供**批量接口**，而不是前端循环调用

---

# 第 9 课：角色权限控制【新增】

**本课目标**：让不同角色的用户看到不同的菜单和按钮，理解前端权限体系。

**知识点**：`meta` 路由元信息、动态菜单、自定义指令

## 9.1 原理讲解：前端权限控制的三个层次

```text
第 1 层  菜单级   —— 没权限的菜单根本不显示
第 2 层  路由级   —— 就算手输地址也进不去页面
第 3 层  按钮级   —— 页面能进，但某些按钮看不到/点不了
```

三个层次缺一不可。为什么？因为**前端权限只是"体验优化"，不是安全边界**。用户可以改 localStorage、可以直接调接口绕过所有前端限制。

> ⚠️ **必须明确告诉学生**：**真正的权限校验必须在后端做**。前端做的只是"不让用户看到用不了的入口"。

## 9.2 第 1 步：给路由加 `meta` 元信息

修改 `src/router/index.js`：

```js
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘', roles: ['admin', 'user'] }   // 两种角色都能看
      },
      {
        path: 'user',
        name: 'User',
        component: User,
        meta: { title: '用户管理', roles: ['admin'] }          // 只有 admin 能看
      }
    ]
  }
]
```

### 原理讲解：`meta` 是什么

`meta` 是路由对象上的一个**自定义字段**，Vue Router 本身不关心它的内容，**完全由我们自己定义和读取**。它的价值在于：**把"页面相关的配置"和"路由配置"放在一起**，不用维护两套对照表。

在组件里可以通过 `this.$route.meta.title` 读到它，常用于设置页面标题或面包屑。

## 9.3 第 2 步：守卫里校验角色（路由级）

修改守卫，在原有 token 检查之后追加角色判断：

```js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const whiteList = ["/login"]

  // 未登录
  if (!token) {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next("/login")
    }
    return
  }

  // 已登录
  if (to.path === "/login") {
    next("/dashboard")
    return
  }

  // === 角色权限校验 ===
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}")
  const role = userInfo.role || "user"
  const allowRoles = to.meta && to.meta.roles

  // 如果该页面声明了 roles 限制，且当前角色不在允许列表里
  if (allowRoles && !allowRoles.includes(role)) {
    Message.warning("您没有权限访问该页面")   // 需在文件顶部 import { ElMessage as Message } from 'element-plus'
    next(from.path || "/dashboard")            // 留在原地
    return
  }

  next()
})
```

> ⚠️ 守卫文件里用不了 `this.$message`（没有组件实例），需要**按需引入**：
> ```js
> import { ElMessage } from 'element-plus'
> ```

### 原理讲解：为什么用 `next(from.path)` 而不是 `next(false)`

- `next(false)`：**中断导航**，浏览器地址栏会回退到上一页。但如果用户是直接在地址栏输入 URL 进来的，`from.path` 可能是 `/`，体验很怪。
- `next(from.path || '/dashboard')`：**明确跳回一个合理的位置**，用户不会看到空白页。

另外 `to.meta && to.meta.roles` 这个判断不能省——**登录页没有 `meta`**，直接访问 `to.meta.roles` 会报错。

## 9.4 第 3 步：动态侧边菜单（菜单级）

让没有权限的菜单**根本不显示**。改造 `Layout.vue`：

```vue
<template>
  <div class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo"><span>工作管理中台</span></div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 改为循环渲染，只显示有权限的菜单 -->
        <el-menu-item
          v-for="item in menuList"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <div class="main-wrap">
      <el-header class="header">
        <div>
          欢迎，{{ $store.state.userInfo?.username }}
          <el-tag size="small" style="margin-left:8px">
            {{ roleText }}
          </el-tag>
        </div>
        <el-button link @click="handleLogout">退出登录</el-button>
      </el-header>
      <el-main class="content">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script>
export default {
  name: "Layout",
  computed: {
    // 当前用户角色
    userRole() {
      return this.$store.state.userInfo?.role || "user"
    },
    roleText() {
      return this.userRole === "admin" ? "管理员" : "普通用户"
    },
    // 根据角色过滤菜单
    menuList() {
      const allMenus = [
        { path: "/dashboard", title: "仪表盘", icon: "House", roles: ["admin", "user"] },
        { path: "/user", title: "用户管理", icon: "User", roles: ["admin"] },
        { path: "/task", title: "任务管理", icon: "Tickets", roles: ["admin", "user"] }
      ]
      return allMenus.filter(menu => menu.roles.includes(this.userRole))
    }
  },
  methods: {
    handleLogout() {
      this.$store.commit("clearUserInfo")
      this.$router.push("/login")
    }
  }
}
</script>
```

（样式沿用第 1 课）

### 原理讲解：`<component :is="xxx" />` 动态组件

```vue
<el-icon><component :is="item.icon" /></el-icon>
```

`<component :is="组件名">` 是 Vue 的**动态组件**语法：`:is` 传入什么名字，就渲染哪个组件。因为第 1 课我们已经**把所有图标注册成了全局组件**，所以这里可以直接用字符串 `"House"`、`"User"` 当组件名用。

**这就是第 1 课那个循环注册的回报**——如果当初没全局注册，这里就得写一堆 import。

### 原理讲解：为什么用 `computed` 而不是 `methods`

```js
computed: {
  menuList() { ... }
}
```

`computed` 有**缓存**：只要依赖的 `userRole` 没变，多次访问 `menuList` 不会重复计算。而 `methods` 每次渲染都会重新执行。**凡是"由现有数据推导出来的数据"，就应该用 computed。**

## 9.5 第 4 步：按钮级权限（自定义指令）

现在问题来了：管理员和普通用户都能进"用户管理"页（假设），但**只有管理员能看到"删除"按钮**。这时菜单过滤和路由守卫都帮不上忙，需要**自定义指令**。

新建 `src/directives/permission.js`：

```js
// 按钮级权限指令：v-permission="'user:delete'"
export default {
  mounted(el, binding) {
    // binding.value 是传给指令的值，比如 'user:delete'
    const needPermission = binding.value
    // 当前用户的权限列表
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const permissions = userInfo.permissions || []

    // 如果没有这个权限，就把这个元素从 DOM 里移除
    if (needPermission && !permissions.includes(needPermission)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
```

在 `main.js` 中注册：

```js
import permission from './directives/permission'
app.directive('permission', permission)
```

在页面里使用：

```vue
<template #default="{ row }">
  <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>

  <!-- 只有拥有 user:delete 权限的人能看到这个按钮 -->
  <el-button v-permission="'user:delete'" link type="danger" @click="handleDelete(row)">
    删除
  </el-button>
</template>
```

同时在 Mock 的登录返回里给 admin 配上权限列表（改造 `store` 的 `setUserInfo` 调用处）：

```js
this.$store.commit("setUserInfo", {
  username: "admin",
  role: "admin",
  permissions: ["user:add", "user:edit", "user:delete"]
})
```

### 原理讲解：自定义指令的 `mounted` 钩子

```js
export default {
  mounted(el, binding) { ... }
}
```

自定义指令的对象里，键名是**生命周期钩子**：

| 钩子 | 触发时机 |
|---|---|
| `created` | 元素属性设置前（此时还没插入 DOM） |
| **`mounted`** | **元素已插入 DOM，最常用** |
| `updated` | 元素更新时 |
| `unmounted` | 元素移除时 |

参数说明：

- `el`：指令绑定的**真实 DOM 元素**
- `binding.value`：指令的值，即 `v-permission="'user:delete'"` 里的 `'user:delete'`

**注意引号**：`v-permission="'user:delete'"` 是**字符串**（先双引号包属性值，内层单引号包字符串）；如果写成 `v-permission="user:delete"`，Vue 会把它当成一个**变量表达式**去作用域里找 `user` 变量，直接报错。

### 原理讲解：`removeChild` 与 `v-if` 的区别

这里用 `removeChild` 把元素**真正从 DOM 里删掉**。相比"加个样式隐藏"，好处是**用户用开发者工具也看不到这个按钮的代码**（虽然仍能绕过，但提高了门槛）。

> 💡 **更优雅的写法**：在 `mounted` 和 `updated` 两个钩子里都判断一次，因为元素可能在挂载后动态更新。

## 9.6 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| `Cannot read properties of undefined (reading 'roles')` | 目标路由没有 `meta` | 判断前加 `to.meta &&` |
| 守卫里用 `this.$message` 报错 | 守卫文件没有组件实例 | `import { ElMessage } from 'element-plus'` |
| 菜单全部消失 | `menuList` 过滤后为空，通常是 `userRole` 取不到 | Console 打印 `userRole`，检查 `userInfo` 是否存了 `role` |
| `v-permission` 报 `user is not defined` | 指令值忘了加引号 | 写成 `v-permission="'user:delete'"` |
| 图标不显示 | 图标名拼错（Element 图标是首字母大写的 PascalCase） | 核对 `House` / `User` / `Tickets` 的拼写 |
| 切换账号后菜单没变 | `userInfo` 没有重新写入，或页面没刷新 | 登录时 commit 新数据；必要时 `location.reload()` |

### 🔍 调试技巧

直接用 Console 手动造数据，能快速验证权限逻辑：

```js
// 伪造一个普通用户
localStorage.setItem('userInfo', JSON.stringify({ username: 'test', role: 'user', permissions: [] }))
// 然后刷新页面，看菜单和按钮是否按预期消失
```

**这是演示权限效果最快的方式**，不用真的做两套账号体系。

## 9.7 本课小结

- 前端权限分三层：**菜单级 / 路由级 / 按钮级**，三层要配合使用
- 路由 `meta.roles` + 守卫判断 = 路由级
- `computed` 过滤菜单 + `<component :is>` 动态图标 = 菜单级
- 自定义指令 `v-permission` + `removeChild` = 按钮级
- **前端权限只是体验优化，真正的安全边界必须在后端**

---

# 第 10 课：生产部署与打包优化【新增】

**本课目标**：把项目真正部署到服务器，并解决上线后常见的 404、白屏、加载慢问题。

**知识点**：环境变量、`devServer.proxy`、Nginx 配置、路由懒加载

## 10.1 原理讲解：开发环境和生产环境的差异

| | 开发环境 | 生产环境 |
|---|---|---|
| 接口地址 | MockJS 拦截，或走代理 | 真实服务器地址 |
| 代码 | 不压缩、带 source map | 压缩混淆 |
| 文件 | 在内存里 | `dist` 静态文件 |
| 服务器 | `npm run serve` | Nginx / 静态托管 |

**问题**：接口地址在两套环境里不一样，难道要改代码？当然不。这就引出**环境变量**。

## 10.2 第 1 步：配置环境变量

Vue CLI 的环境变量有两条硬规则（**和 Vite 完全不同，别记混**）：

1. 文件放在**项目根目录**，命名固定为 `.env.development` / `.env.production`
2. 变量名**必须以 `VUE_APP_` 开头**才会被注入，代码里用 `process.env.VUE_APP_XXX` 读取

**`.env.development`**：

```text
VUE_APP_BASE_API=/api
VUE_APP_TITLE=工作管理中台（开发）
```

**`.env.production`**：

```text
VUE_APP_BASE_API=/api
VUE_APP_TITLE=工作管理中台
```

改造 `src/api/request.js`：

```js
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,   // 从环境变量读取
  timeout: 5000
})
```

> ⚠️ **改完必须重启 `npm run serve`**，环境变量只在启动时注入一次，热更新不会生效。
>
> ⚠️ **安全性**：`VUE_APP_` 开头的变量**会被打包进前端代码，任何人都能看到**。**永远不要在这里放密钥、数据库密码。**

## 10.3 第 2 步：配置开发代理（解决跨域）

本地开发时前端跑在 `8080`，后端可能跑在 `3000`，直接请求就是**跨域**。Vue CLI 提供了代理，把请求"转发"给后端（**请求由 Node 服务器发出，所以不受浏览器同源策略限制**）。

新建 `vue.config.js`（**项目根目录，与 package.json 同级**）：

```js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // 静态资源路径：'./' 表示相对路径，部署到子目录也不会白屏
  publicPath: './',

  // 开发环境代理
  devServer: {
    port: 8080,
    proxy: {
      // 所有以 /api 开头的请求
      '/api': {
        target: 'http://localhost:3000',   // 后端真实地址
        changeOrigin: true,                // 伪装请求来源，绕过 Origin 校验
        pathRewrite: {
          '^/api': ''                      // 去掉 /api 前缀后再转发
        }
      }
    }
  }
})
```

### 原理讲解：代理解决跨域的完整链路

```text
浏览器请求 /api/user/list
        ↓
Vue CLI 的 dev-server（Node 进程）收到，发现匹配 /api 规则
        ↓
转发到 http://localhost:3000/user/list（已经去掉 /api）
        ↓
Node 进程拿到响应，返回给浏览器
        ↓
浏览器认为"我一直是在和 8080 通信"，同源，没有跨域
```

**关键点**：浏览器只允许同源请求，但**服务器之间互相请求不受限制**（同源策略是浏览器行为）。所以用一个同源的 Node 中间人转发，就绕开了限制。

**`pathRewrite` 要不要写？** 取决于后端接口有没有 `/api` 前缀：

- 后端地址是 `http://localhost:3000/user/list` → 需要 `pathRewrite: { '^/api': '' }`
- 后端地址是 `http://localhost:3000/api/user/list` → **不需要** `pathRewrite`

**写错了的典型现象**：接口 404，Network 里看到请求地址是 `/user/list`（少了一段）或 `/api/api/user/list`（多了一段）。

## 10.4 第 3 步：路由懒加载（明显提速首屏）

再看现在的路由配置：

```js
import User from '../views/User.vue'          // 直接引入
```

**问题**：这样写会让**所有页面在首屏一次性全部下载**。用户只是想看登录页，却要先下载用户管理、任务管理、ECharts……首屏加载非常慢。

**改成懒加载**：

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    // 用函数形式，只有真正访问该路由时才去下载对应文件
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', roles: ['admin', 'user'] }
      },
      {
        path: 'user',
        component: () => import('../views/User.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      }
    ]
  }
]
```

### 原理讲解：`() => import()` 是怎么实现按需加载的

```js
component: User                    // 打包时就进入主包，首屏必须下载
component: () => import('../views/User.vue')   // 打包时单独切出一个文件，访问时才下载
```

Webpack 看到 `import()` **函数调用**（而不是顶部的 `import ... from`），就会把这个文件**单独打包成一个 chunk**。打包后你会看到：

```text
dist/js/
├── chunk-vendors.xxx.js     # 第三方库
├── app.xxx.js               # 主包（含 Layout、登录页）
├── dashboard.xxx.js         # ← 访问仪表盘时才下载
└── user.xxx.js              # ← 访问用户管理时才下载
```

**`Layout.vue` 不适合懒加载**：它是所有子路由的骨架，任何页面都要先渲染它，懒加载反而多一次请求。**这一条判断规则很重要——首屏必经的组件不要懒加载。**

## 10.5 第 4 步：打包并检查体积

```bash
npm run build
```

如果包体积偏大（比如引入了 ECharts 之后），可以用官方分析工具看看到底是谁占了大头：

```bash
npm install --save-dev webpack-bundle-analyzer
```

在 `vue.config.js` 里加：

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = defineConfig({
  // ...
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',   // 打包后自动打开一个可视化页面
        openAnalyzer: true
      })
    ]
  }
})
```

### 原理讲解：体积优化三板斧

按收益从高到低：

**① ECharts 按需引入**（第 7 课已讲）：省 500KB 以上

**② 路由懒加载**（本节已讲）：首屏体积直接砍半

**③ 把大库挂 CDN**（进阶）：让 Vue、Element Plus 不打包进 `dist`，而是从 CDN 加载：

```js
// vue.config.js
module.exports = defineConfig({
  configureWebpack: {
    externals: {
      // 告诉 Webpack：遇到 vue 不要打包，直接用全局变量 Vue
      vue: 'Vue',
      'element-plus': 'ElementPlus',
      'echarts': 'echarts'
    }
  }
})
```

然后在 `public/index.html` 的 `<head>` 里加 CDN 引用：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css" />
<script src="https://unpkg.com/element-plus"></script>
<script src="https://unpkg.com/echarts/dist/echarts.min.js"></script>
```

> ⚠️ **注意**：走 externals 后，`main.js` 里的 `import ElementPlus from 'element-plus'` **依然要保留**（Webpack 会用它对应到全局变量 `ElementPlus`），但**需要删掉** `import 'element-plus/dist/index.css'`，因为 CSS 已经由 CDN 提供，否则会重复引入。

## 10.6 第 5 步：Nginx 部署

把 `dist` 文件夹上传到服务器（例如 `/usr/share/nginx/html`），然后配置 Nginx：

```nginx
server {
    listen       80;
    server_name  localhost;

    # dist 上传的目录
    root  /usr/share/nginx/html;
    index index.html;

    # === 核心：SPA 路由回退 ===
    location / {
        try_files $uri $uri/ /index.html;
    }

    # === 后端接口转发（避免跨域）===
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # === gzip 压缩，明显减小传输体积 ===
    gzip  on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_vary on;

    # === 静态资源缓存（利用文件名哈希）===
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }
}
```

改完配置后：

```bash
nginx -t          # 检查配置语法
nginx -s reload   # 重载配置
```

### 原理讲解：`try_files` 是解决"刷新 404"的唯一正解

回忆第 1 课讲哈希模式时提到的：**历史模式下刷新页面会 404**。现在解释清楚原因：

```text
用户访问 http://mysite.com/user
        ↓
浏览器把 /user 发给服务器
        ↓
Nginx 到 root 目录下找 files/user 这个文件 → 不存在 → 404 ❌
```

但实际上 `/user` **不是一个文件，而是一个前端路由**。所以需要告诉 Nginx：

```nginx
try_files $uri $uri/ /index.html;
```

**翻译成人话**：

```text
① 先找有没有这个文件（$uri）        → 有就直接返回
② 再找有没有这个目录（$uri/）        → 有就进去找 index
③ 都没有 → 返回 index.html 交给前端路由去解析 ✅
```

**这样不管是 `/user` 还是 `/task`，服务器都返回同一个 `index.html`，再由 Vue Router 根据地址渲染对应页面。**

> 💡 **哈希模式为什么不需要这行？** 因为 `#` 后面的内容浏览器**根本不会发给服务器**，服务器收到的永远是 `/`，自然永远能找到 `index.html`。这就是第 1 课选哈希模式"减少部署问题"的真正原因。
>
> **但如果将来要改成历史模式（地址更漂亮、利于 SEO），这行 `try_files` 就是必须的。**

### 原理讲解：`proxy_pass` 和生产环境跨域

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
}
```

上线后**不再有 `devServer.proxy`**（那是 Vue CLI 的开发服务器，生产环境根本没有它）。所以跨域问题要改用 **Nginx 反向代理**解决，原理和开发代理一模一样，只是执行者从 Node 换成了 Nginx。

注意 `proxy_pass` 末尾的斜杠：

- `http://127.0.0.1:3000/`（**带**斜杠）：请求 `/api/user` → 转发到 `/user`
- `http://127.0.0.1:3000`（**不带**斜杠）：请求 `/api/user` → 转发到 `/api/user`

**多一个斜杠少一个斜杠，结果就完全不一样**，这是 Nginx 最经典的坑。

## 10.7 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 部署后刷新页面 404 | 历史模式 + 没配 `try_files` | 加 `try_files $uri $uri/ /index.html;` |
| 页面白屏，Console 报 404 找不到 js/css | `publicPath` 不对（部署在子目录） | 设 `publicPath: './'` |
| 改了 `.env` 但不生效 | 没重启开发服务器 | 重启 `npm run serve` |
| 接口 404，请求地址少了一段前缀 | `pathRewrite` 写错 | 确认后端接口有没有 `/api` 前缀 |
| 生产环境接口跨域 | 只配了开发代理，没配 Nginx | 加 `location /api/` + `proxy_pass` |
| 接口地址多了 `/api` | `proxy_pass` 末尾斜杠写错了 | 按 10.6 的规则调整 |
| 打包报 `Cannot find module 'webpack-bundle-analyzer'` | 只在开发时装的依赖被漏了 | 用 `--save-dev` 安装 |
| CDN 方案后样式丢失 | 忘了删 `import 'element-plus/dist/index.css'` | 删掉该行（已由 CDN 提供） |

### 🔍 调试技巧

**上线后出现问题，第一件事永远是打开 F12 看 Console 和 Network。** 重点看：

1. **Console 有没有报错**（通常是资源 404 或 JS 语法错误）
2. **Network 里 js/css 的路径对不对**（判断 `publicPath` 是否正确）
3. **接口请求的完整 URL 是什么**（判断代理和 `baseURL` 是否正确）

## 10.8 本课小结

- 环境变量用 `.env.*` + **`VUE_APP_` 前缀**（Vue CLI 规则，不是 Vite 的 `VITE_`）
- 开发跨域用 **`devServer.proxy`**，生产跨域用 **Nginx 反向代理**，原理相同
- **路由懒加载**是性价比最高的优化，但**首屏必经组件（Layout）不要懒加载**
- **`try_files $uri $uri/ /index.html`** 是历史模式 SPA 部署的必备配置
- `proxy_pass` 末尾的斜杠会影响路径拼接，必须和 `pathRewrite` 一起核对
- 体积优化优先级：**ECharts 按需引入 > 路由懒加载 > CDN 外置**

---

# 课后作业

1. 在中台新增【任务管理】页面，实现表格、新增、编辑、删除功能
2. 给用户管理表单增加表单校验（用户名非空、手机号格式校验）
3. 在仪表盘引入 ECharts 绘制柱状统计图表

## 作业提示

- **第 1 题**：可以直接复用第 6 课封装好的 `UserFormDialog` 思路，新写一个 `TaskFormDialog`；接口在 `src/api/task.js` + `src/mock/index.js` 里补；路由在 `children` 里加一条，菜单里加一项。
- **第 2 题**：`el-form` 加 `:rules="rules"`，`el-form-item` 加 `prop="username"`，提交前调用 `this.$refs.formRef.validate(valid => {...})`。手机号用正则 `/^1[3-9]\d{9}$/`。
- **第 3 题**：直接参考第 7 课，注意三个坑——**容器要有高度**、**在 `mounted` 里初始化**、**窗口变化要 resize**。

# 拓展可选内容（课时充足时讲解）

- **侧边菜单折叠**：`el-menu` 加 `:collapse="isCollapse"`，注意折叠后要调用 `chart.resize()`（第 7 课有铺垫）
- **文件上传**：见第 8 课
- **批量删除**：见第 8 课
- **角色权限控制**：见第 9 课

---

## 附录：项目最终目录结构

```text
work-admin/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── request.js          # axios 实例 + 拦截器
│   │   └── user.js             # 用户相关接口
│   ├── components/
│   │   ├── UserFormDialog.vue  # 用户弹窗表单（第 6 课）
│   │   ├── SearchBar.vue       # 搜索栏（第 6 课）
│   │   └── AvatarUpload.vue    # 头像上传（第 8 课）
│   ├── directives/
│   │   └── permission.js       # 按钮权限指令（第 9 课）
│   ├── mock/
│   │   └── index.js            # Mock 接口
│   ├── router/
│   │   └── index.js            # 路由 + 全局守卫
│   ├── store/
│   │   └── index.js            # Vuex + localStorage 持久化
│   ├── views/
│   │   ├── Layout.vue          # 中台布局骨架
│   │   ├── Login.vue
│   │   ├── Dashboard.vue       # 含 ECharts 图表
│   │   └── User.vue
│   ├── App.vue
│   └── main.js
├── .env.development            # 开发环境变量（第 10 课）
├── .env.production             # 生产环境变量（第 10 课）
├── vue.config.js               # publicPath / 代理 / CDN（第 10 课）
└── package.json
```

## 附录：全书易错点速查

| # | 坑 | 出现课程 |
|---|---|---|
| 1 | 图标库要单独 `npm install @element-plus/icons-vue` | 0 |
| 2 | `el-button` 文本按钮用 `link`，`danger` 不能单独用 | 1、2 |
| 3 | 子路由 `path` 不写开头斜杠 | 1 |
| 4 | `el-menu-item` 的 `index` 必须和路由 `path` 完全一致 | 1 |
| 5 | 配置文件改完要重启 `npm run serve` | 3、10 |
| 6 | `$confirm` 必须配 `.catch`，否则控制台红错 | 2、4 |
| 7 | 数组要浅拷贝 `[...arr]`，否则备份失效 | 2 |
| 8 | Mock 带查询参数时要用**正则**匹配 | 4 |
| 9 | 响应拦截器记得 `return res.data` | 4 |
| 10 | 自定义 `v-model` = `modelValue` + `update:modelValue` | 6 |
| 11 | 子组件不能直接改 props，要维护副本 | 6 |
| 12 | `watch` 要 `immediate: true` 才会初始化执行 | 6 |
| 13 | prop 在 template 里写成短横线（`:row-data`） | 6 |
| 14 | ECharts 容器**必须有高度**，否则静默白屏 | 7 |
| 15 | ECharts 必须在 `mounted` 初始化，销毁时要 `dispose` | 7 |
| 16 | `:deep()` 才能穿透 scoped 改子组件样式 | 8 |
| 17 | 表格批量操作后要 `clearSelection()` | 8 |
| 18 | 指令值要加引号：`v-permission="'user:delete'"` | 9 |
| 19 | 环境变量前缀是 `VUE_APP_`（不是 `VITE_`） | 10 |
| 20 | `try_files $uri $uri/ /index.html` 解决刷新 404 | 10 |
| 21 | `proxy_pass` / `pathRewrite` 的斜杠决定路径拼法 | 10 |
| 22 | `Layout` 不要懒加载（首屏必经） | 10 |
