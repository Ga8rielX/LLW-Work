# Vue 3 + Element Plus 工作管理中台：项目实战课

> 面向大三学生前端项目课 · WorkBuddy 实操教学
> 项目名称：**work-admin 工作管理中台**

**技术栈**：Vue3（选项式 API，纯 JavaScript，不使用 TS）+ Element Plus + Vuex + VueRouter + Axios + MockJS

**项目功能**：登录、中台布局、侧边菜单、仪表盘、用户管理 CRUD、登录状态持久化、路由权限守卫、模拟后端接口、项目打包

> **使用说明**：按第 0～10 课顺序完成。标注“完整替换”的代码块应覆盖对应文件；标注“局部修改”的代码块只改指定位置。第 3 课的白名单和进度条、第 6 课的搜索栏属于可选练习，除非明确写了“替换”，不要把不同版本的同一个守卫重复粘贴。

> **课程边界**：这是前端教学项目。登录凭证和权限是本地模拟，Mock 数据保存在浏览器当前页面内存中，刷新会重置。它们可用于学习请求与交互，不能代替真实后端鉴权。第 10 课分别说明演示包和连接真实后端的条件。

> **工具链说明（2026 年 10 月核对）**：课程保留 Vue CLI 5、Vuex 和选项式 API，以便沿着现有课件逐步学习。Vue CLI 已进入维护模式；新建商业项目可优先评估 `create-vue` / Vite。课程不在中途切换构建工具。

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
| 第 8 课 | 本地头像预览 + 批量删除 | el-upload 选文件、多选表格、selection-change | 4 |
| 第 9 课 | 角色权限控制 | meta.roles、动态菜单、v-if 按钮权限 | 4 |
| 第 10 课 | 演示部署与打包优化 | 环境变量、代理、Nginx、路由懒加载 | 4 |

**总学习目标**：独立完成「模拟登录与权限控制 → 中台布局 → 数据增删改查 → 图表可视化 → 演示部署」的前端项目，并理解每一步的原理与真实后端接入条件。

---

# 前置环境准备（第 0 课）

**本课目标**：把开发环境一次性配好，理解 Vue 项目是怎么被创建出来的。

## 0.1 工具软件

### 1. Node.js 推荐 v24 LTS

Node.js 18 已结束维护。课堂统一使用 Node.js 24 LTS；如果学校机房已有可运行的受支持 LTS 版本，先以项目实际安装和构建结果为准。统一版本能减少“同一份代码在不同电脑上表现不同”的问题。

安装完成，打开终端验证版本：

```bash
node -v
npm -v
```

输出版本号代表安装成功。（如显示 `command not found`，说明环境变量没配好，重装时勾选 "Add to PATH"。）

> 💡 **进阶建议**：装一个 **nvm**（Node 版本管理器），可以一条命令在多个项目间切换 Node 版本：
> ```bash
> nvm install 24
> nvm use 24
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
npm install -g @vue/cli@5

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

## 0.3 项目目录结构

创建完成后先看清目录，再按课时添加文件。脚手架的实际目录可能随勾选项略有差异，以本课程用到的文件为准。

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

**验收**：终端能显示 `node -v`、`npm -v` 和 `vue --version`；进入项目后运行 `npm run serve`，浏览器能打开开发页面。

## 0.4 本课小结

- Vue CLI 帮我们生成了一整套 Webpack 配置，不用手写打包规则
- 一个 Vue 项目 = `index.html`（壳）+ `main.js`（入口）+ `App.vue`（根组件）+ 一堆页面组件
- 图标库要单独安装

---

# 第 1 课：ElementPlus 引入 + 中台基础布局搭建

**本课目标**：跑通「登录 → 进中台 → 布局框架成型」的最小闭环。

**知识点**：嵌套路由、Element Plus 基础组件、flex 布局、Vuex、localStorage

## 1.1 修改 `src/main.js`（完整文件）

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { House, User, Plus } from '@element-plus/icons-vue'

const app = createApp(App)
app.component('House', House)
app.component('User', User)
app.component('Plus', Plus)
app.use(store).use(router).use(ElementPlus).mount('#app')
```

这里只注册课程用到的三个图标：仪表盘、用户管理和头像预览。第 9 课的动态菜单仍可通过字符串名字找到已注册的图标。新增其他图标时，在这里显式导入并注册。

### 原理讲解

Vue3 用 `createApp(App)` **创建一个应用实例**，而不是像 Vue2 那样直接 `new Vue()`。返回的 `app` 对象上挂着一串方法：

- `app.use(插件)` —— 注册插件，支持链式调用
- `app.component(名字, 组件)` —— 注册全局组件
- `app.mount('#app')` —— 把应用挂载到 `index.html` 里的 `<div id="app">` 上

**为什么显式注册图标？** `<el-icon><House /></el-icon>` 使用了 `House` 组件；全局注册后每个页面都能直接使用它。按课程实际用量导入图标，也避免把整个图标库都加入主包。

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

> 本例的退出按钮使用 `link` 链接外观；Element Plus 的布尔属性 `text` 也是有效外观，废弃的是旧写法 `type="text"`。`userInfo?.username` 可在未登录或状态清空时避免读取 `null` 的属性。

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

> ⚠️ 真实项目应由后端校验密码并签发凭证。本课程保留模拟登录，重点练习页面和请求；真实登录接口是课后扩展任务。

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

### 原理讲解：子路由 path 的写法

```js
{ path: 'dashboard' }   // 相对路径，和父路径拼接
{ path: '/dashboard' }  // 根路径，URL 不继承父路径
```

本例选相对路径，便于看清父子 URL 的关系。以 `/` 开头的子路由仍可渲染在父组件的 `<router-view>` 中，只是不再继承父级 URL 前缀。

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

**为什么通过 mutation 改 state？** 这样每次状态变更都有明确入口，便于 DevTools 追踪。直接修改 state 仍可能触发 Vue 的响应式更新，但会绕过 Vuex 的变更记录；开启 strict 模式时还会报错。

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
- [ ] 左侧「仪表盘」菜单高亮；第 2 课添加用户页与菜单后再测试「用户管理」
- [ ] 顶栏显示"欢迎，admin"
- [ ] 点「退出登录」回到登录页
- [ ] **刷新页面**后登录状态仍在，没有被踢回登录页 ← 持久化成功

## 1.9 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 图标不显示，Console 报 `Failed to resolve component: House` | 图标没注册，或漏装 `@element-plus/icons-vue` | 按 1.1 导入并注册；确认已安装图标包 |
| 菜单点击无反应 | `el-menu-item` 的 `index` 和路由 path 不一致 | 第 1 课核对 `/dashboard`；第 2 课再加入 `/user` |
| 右内容区不滚动 / 出现两条滚动条 | `.layout` 漏了 `overflow:hidden`，或 `.content` 漏了 `overflow-y:auto` | 按 1.2 完整复制样式 |
| 页面四周有白边 | `App.vue` 的全局重置样式没生效 | 确认 `<style>` 没加 scoped |
| 控制台提示 `type="text"` 已废弃 | 使用了旧的 `type="text"` 写法 | 链接样式改为 `link`；布尔属性 `text` 仍可用 |

## 1.10 本课小结

- Vue3 应用 = `createApp` → `use` 插件 → `mount`
- 中台骨架靠 **flex** 撑：左侧固定、右侧 `flex:1`、内容区独立滚动
- **嵌套路由**让 Layout 当骨架、子路由当内容
- Vuex 管全局状态，`state` 配 `localStorage` 实现刷新不丢登录

---

# 第 2 课：用户管理页面（Table、搜索、新增、编辑、删除弹窗）

**本课目标**：完成中台最典型的"表格 + 搜索 + 弹窗表单"CRUD 页面。

**知识点**：`el-table`、`el-dialog`、`el-form`、数组响应式、数组浅拷贝

## 2.1 新建 `src/views/User.vue`（完整文件）

第 2 课先用本地数据理解 CRUD。`originData` 是唯一的全量数据源；`tableData` 由它和搜索词计算出来。这样筛选后编辑或删除，不会丢掉隐藏的行。

```vue
<template>
  <el-card>
    <div class="search-box">
      <el-input v-model="query.keyword" placeholder="搜索用户名" style="width:220px" />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openAddDialog">新增用户</el-button>
    </div>

    <el-table :data="tableData" border stripe style="margin-top:15px">
      <el-table-column label="ID" prop="id" />
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="角色" prop="role" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
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
  name: 'User',
  data() {
    return {
      query: { keyword: '' },
      appliedKeyword: '',
      originData: [
        { id: 1, username: '张三', phone: '13800138000', role: 'admin' },
        { id: 2, username: '李四', phone: '13900139000', role: 'user' }
      ],
      dialogVisible: false,
      dialogTitle: '新增用户',
      form: { id: '', username: '', phone: '', role: '' }
    }
  },
  computed: {
    tableData() {
      return this.originData.filter(item => item.username.includes(this.appliedKeyword))
    }
  },
  methods: {
    handleSearch() {
      this.appliedKeyword = this.query.keyword.trim()
    },
    openAddDialog() {
      this.dialogTitle = '新增用户'
      this.form = { id: '', username: '', phone: '', role: '' }
      this.dialogVisible = true
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    submitForm() {
      if (this.form.id) {
        const index = this.originData.findIndex(item => item.id === this.form.id)
        if (index === -1) return
        this.originData[index] = { ...this.form }
      } else {
        const newId = Math.max(0, ...this.originData.map(item => item.id)) + 1
        this.originData.push({ ...this.form, id: newId })
      }
      this.dialogVisible = false
      this.$message.success('保存成功')
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定删除该用户吗？', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
      } catch {
        return
      }
      this.originData = this.originData.filter(item => item.id !== row.id)
      this.$message.success('删除成功')
    }
  }
}
</script>

<style scoped>
.search-box { display: flex; gap: 10px; align-items: center; }
</style>
```

> 本地数据刷新后会回到初始两行。第 4 课改为接口版后，数据源转移到 Mock 模块。

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

**③ 在 `src/views/Layout.vue` 的 `<el-menu>` 中追加菜单项**

```vue
<el-menu-item index="/user">
  <el-icon><User /></el-icon>
  <span>用户管理</span>
</el-menu-item>
```

现在点击“用户管理”应在右侧打开表格。`index` 必须与实际路由路径 `/user` 一致。

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

## 2.4 原理讲解：一个数据源，一份筛选结果

`originData` 保存全量数据，是唯一修改入口；`tableData` 是 `computed` 计算属性，只负责显示。查询按钮把输入值复制到 `appliedKeyword`，清空并再点查询即可恢复全量列表。

```js
tableData() {
  return this.originData.filter(item => item.username.includes(this.appliedKeyword))
}
```

增删改都按 `id` 操作 `originData`。即使当前只显示“张三”，隐藏的“李四”也不会被覆盖。`this.form = { ...row }` 则为弹窗创建对象副本，取消编辑时原行不变。这里的展开语法是浅拷贝，若字段里还有嵌套对象，应单独处理其副本。

**验收**：先搜“张三”并编辑或删除，再清空搜索词点“查询”，“李四”仍应存在；搜一个不存在的名字后新增用户，ID 仍应是正常正整数。

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
const newId = Math.max(0, ...this.originData.map(i => i.id)) + 1
```

1. 对全量 `originData` 取 ID，避免只看筛选结果造成重复。
2. `Math.max(0, ...ids)` 以 0 兜底，空数组时也能得到合法 ID。
3. 最大 ID 加 1；真实项目的 ID 应由后端生成。

> ⚠️ **真实项目不会这么做**：ID 由后端数据库生成。第 4 课改成接口后，新增只需要把数据发给后端，前端不关心 ID。

## 2.6 原理讲解：确认与删除要分开处理

`this.$confirm()` 返回 Promise：点“确定”后继续，点“取消”或关闭弹窗时进入 `catch`。本课使用 `async/await`，所以先用一段 `try/catch` 处理确认，再修改本地数据：

```js
try {
  await this.$confirm('确定删除该用户吗？', '提示')
} catch {
  return  // 用户取消，不改数据
}
this.originData = this.originData.filter(item => item.id !== row.id)
```

第 4 课接入接口后，删除请求还要有**另一段** `try/catch`。不能把“用户取消”和“接口失败”混在同一个空 `catch` 中，否则真正的失败会被静默吞掉。

## 2.7 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 表格一片空白 | `:data` 写成了 `data`（丢了冒号） | 写成 `:data="tableData"` |
| 列显示不出内容 | `prop` 名字和数据字段不一致（大小写也算） | 对齐 `prop="username"` 与数据里的 `username` |
| 点"编辑"弹出的是上一次的数据 | 忘了 `this.form = { ...row }` | 按 2.4 加拷贝 |
| 编辑取消后表格数据却被改了 | 同样是没有浅拷贝，改到了原对象 | 同上 |
| 控制台 `Uncaught (in promise) cancel` | 没有处理确认弹窗的取消分支 | 用 `try/catch` 或 Promise 的 `.catch` 处理取消 |
| `danger` 属性加了但按钮不红 | `danger` 不是有效属性 | 用 `<el-button link type="danger">` |

### 🔍 调试技巧

在 `submitForm` 里加一行 `console.log(this.form)`，能在 Console 看到保存瞬间表单的真实内容——**判断"是新增还是编辑"的分支是否走对了**，一眼就能看出来。

## 2.8 本课小结

- 一个标准 CRUD 页面 = 搜索区 + 表格 + 弹窗表单
- 操作列要用**作用域插槽**拿到 `scope.row`
- `originData` 是唯一数据源，`tableData` 用计算属性派生；筛选后修改也不会丢失隐藏行
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

> 把守卫放在 `export default router` 之前，便于在同一个文件中看到完整的导航流程。

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
const whiteList = ["/login"]  // 真正创建注册页、404 页后再加入

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

## 3.5 进阶写法：顶部进度条（可选）

```bash
npm install nprogress --save
```

在 `router/index.js` 顶部加入导入：

```js
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
```

把 `NProgress.start()` 加到**现有** `beforeEach` 回调的第一行。然后在守卫之后、`export default router` 之前加入：

```js
router.afterEach(() => NProgress.done())
router.onError(() => NProgress.done())
```

不要注册第二个 `beforeEach`。

第 9 课会完整替换路由文件；如果完成了本节，届时要把这三处逻辑重新加到新的守卫中。

## 3.6 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 页面卡死不动、白屏 | 某个分支忘了调用 `next()` | 保证每条路径最终都会执行 `next` |
| `Maximum call stack size exceeded`（栈溢出） | 登录页没放行，和重定向形成死循环 | 加 `to.path === '/login'` 判断 |
| 登录成功却还是被弹回登录页 | `setToken` 没执行 / key 名写错 | Console 里执行 `localStorage.getItem('token')` 确认 |
| 守卫代码写了但完全没生效 | 写在了 `export default router` 之后另一个文件里，或改完没重启 | 确认在 `router/index.js` 内，并重启 `npm run serve` |

> 配置文件 `vue.config.js` 与环境变量变化后要重启开发服务；普通的 `router/index.js` 和 `store/index.js` 源码通常会触发热更新。

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

## 4.2 创建请求封装 `src/api/request.js`（完整文件）

```js
import axios from 'axios'

const service = axios.create({ baseURL: '/api', timeout: 5000 })

service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.token = token
  return config
})

service.interceptors.response.use(
  response => {
    const result = response.data
    if (result && result.code !== 200) {
      return Promise.reject(new Error(result.msg || '请求失败'))
    }
    return result
  },
  error => Promise.reject(error)
)

export default service
```

接口业务码不是 `200` 时主动拒绝 Promise，页面的 `catch` 才能显示失败提示。真实项目要按后端约定的业务码和 HTTP 状态码调整。

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

## 4.4 Mock 模拟后端 `src/mock/index.js`（完整文件）

Mock 必须维护一份可变的用户数组，否则“保存成功”后重新查询又会回到原来的两行。以下数据仅在当前页面内存中存在，刷新浏览器会重置。

```js
import Mock from 'mockjs'

let users = [
  { id: 1, username: '张三', phone: '13800138000', role: 'admin' },
  { id: 2, username: '李四', phone: '13900139000', role: 'user' }
]
let nextId = 3

function readBody(options) {
  try {
    return JSON.parse(options.body || '{}')
  } catch {
    return {}
  }
}

Mock.mock(/\/api\/user\/list(?:\?.*)?$/, 'get', options => {
  const url = new URL(options.url, window.location.origin)
  const keyword = (url.searchParams.get('keyword') || '').trim()
  return {
    code: 200,
    data: users.filter(user => user.username.includes(keyword)).map(user => ({ ...user }))
  }
})

Mock.mock('/api/user/add', 'post', options => {
  const body = readBody(options)
  if (!body.username || !body.username.trim()) {
    return { code: 400, msg: '用户名不能为空' }
  }
  users.push({
    id: nextId++,
    username: body.username.trim(),
    phone: body.phone || '',
    role: body.role || 'user'
  })
  return { code: 200, msg: '新增成功' }
})

Mock.mock('/api/user/edit', 'post', options => {
  const body = readBody(options)
  const index = users.findIndex(user => user.id === Number(body.id))
  if (index === -1) return { code: 404, msg: '用户不存在' }
  users[index] = { ...users[index], ...body, id: users[index].id }
  return { code: 200, msg: '编辑成功' }
})

Mock.mock('/api/user/delete', 'post', options => {
  const { id } = readBody(options)
  const before = users.length
  users = users.filter(user => user.id !== Number(id))
  return before === users.length
    ? { code: 404, msg: '用户不存在' }
    : { code: 200, msg: '删除成功' }
})
```

**验收**：搜索“张”只剩张三；新增王五后清空搜索能看见三人；编辑王五后列表更新；删除王五后只剩两人；刷新浏览器后恢复初始数据。

## 4.5 在 `main.js` 引入 Mock（局部修改）

```js
import './mock'
```

这是课堂演示模式：Mock 会拦截匹配的请求，第 5 课打包后也仍会生效。第 10 课连接真实后端时，要删掉这一行并重新构建。

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
2. **真实后端准备好后，先核对 URL、请求体和响应字段是否与本课一致，再删掉 `import './mock'` 并重新构建。接口契约一致时，页面代码才无需改动**
3. 字符串规则要求 URL 精确匹配；列表接口带查询参数时应使用正则规则

### ⚠️ 坑点：带查询参数时匹配不上

看看这个真实场景：

```js
// 接口层
getUserList({ keyword: "张" })
// axios 实际请求的地址会变成：
// /api/user/list?keyword=%E5%BC%A0     ← 带了查询参数
```

而 Mock 规则写的是字符串 `"/api/user/list"`，**两者不相等，匹配失败**。未匹配到规则时请求会继续发往实际地址；如果没有后端，通常会得到 404。

**本课程的做法：用带结尾锚点的正则匹配列表路径和可选查询串。**

```js
Mock.mock(/\/api\/user\/list(?:\?.*)?$/, 'get', options => {
  // 从 options.url 读取查询词并过滤 users
})
```

添加规则后，搜索仍需要在回调里读取 `keyword` 并过滤；只改变匹配规则不会自动实现搜索。

> 💡 **调试技巧**：MockJS 拦截的是浏览器请求层，Network 面板未必显示真实服务器请求。可在规则回调里临时打印 `options.url`，确认是否命中。

## 4.8 完整改造：让 User.vue 走接口（重点）

下面用完整文件替换第 2 课的本地数据版 User.vue，把列表、搜索和增删改连接到第 4 课的接口。

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
    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除用户「${row.username}」吗？`, '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
      } catch {
        return  // 用户取消
      }
      try {
        await delUser(row.id)
        this.$message.success('删除成功')
        await this.fetchList()
      } catch (error) {
        this.$message.error(error.message || '删除失败')
      }
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

`v-loading` 是 Element Plus 提供的指令；`loading` 为 `true` 时会在绑定元素上覆盖加载遮罩。第 9 课的按钮权限采用更适合响应式界面的 `v-if`。

## 4.9 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 请求地址缺少 `/api` | 调用了未封装的 axios，或 `baseURL` 配错 | 从 `api/user.js` 调用 `request`，核对 `baseURL: '/api'` |
| 带查询参数后 Mock 不生效 | 使用了字符串精确匹配 | 使用 4.4 的正则规则，并从 URL 读取 `keyword` |
| `res.data` 是 `undefined` | 响应格式和课程约定不一致，或拦截器没返回业务对象 | 查看 `request.js` 与 Mock 返回值 |
| 列表请求发了但页面空 | Mock 接口名和 `api/user.js` 里的 `url` 不一致 | 两处必须完全一致 |
| `Module not found: Error: Can't resolve '../api/user'` | 文件建的路径不对，或忘了 `import` | 确认 `src/api/user.js` 存在，路径是 `../api/user` |
| 连接真实后端后接口 404 | 后端路径不一致，或生产环境缺少反向代理 | 核对接口契约；生产环境按第 10 课配置 Nginx `/api` 反向代理 |
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

**本课目标**：理解 `npm run build` 的产物，并预览仍使用 Mock 的教学演示包。

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
3. **`dist` 是静态文件**：展示页面不需要 Node 运行时。本阶段的接口仍由打包进去的 Mock 处理；连接真实后端时另需后端服务。

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

`-s` = `--single`，找不到静态文件时回退到 `index.html`。本课程使用哈希路由，服务器收到的路径仍是 `/`，所以这一步不是哈希路由的必需条件；将来切换到 history 路由并直接访问 `/user` 时才需要回退规则。

## 5.5 打包白屏怎么办

先在浏览器 Network 面板看是哪个静态资源返回 404。项目部署在域名根目录时，Vue CLI 默认的 `publicPath: '/'` 即可；部署到固定子目录 `/work-admin/` 时设为 `publicPath: '/work-admin/'`。本课程使用哈希路由，演示包也可设 `publicPath: './'` 使用相对资源路径。`publicPath` 只影响静态资源地址，不会修复 `/api` 接口路径。

```js
// vue.config.js：只在确实需要部署到 /work-admin/ 时创建
module.exports = { publicPath: '/work-admin/' }
```

如果将来改用 history 路由，应避免相对 `publicPath: './'`，并让路由 base、部署子路径与服务器回退配置一致。

## 5.6 常见报错与调试

| 现象 | 原因 | 解决 |
|---|---|---|
| 打包报错 `ERROR in xxx` | 代码里有语法错误或未使用的变量被 ESLint 拦下 | 按报错信息定位到具体文件行号 |
| `dist` 打开白屏，Console 报 404 | 直接双击打开了 `index.html`，或 `publicPath` 与部署路径不一致 | 用静态服务器预览；按实际部署路径配置 `publicPath` |
| 部署后刷新 404 | 用了历史模式且服务器没做回退 | 本课程用哈希模式不存在此问题；历史模式见第 10 课 |
| 打包很慢 / 内存溢出 | 依赖过多或 Node 内存不足 | 加 `NODE_OPTIONS=--max-old-space-size=4096` |

## 5.7 本课小结

- `build` 产出纯静态 `dist`，与开发环境无关
- 产物按 `vendors` / `app` 拆分 + 内容哈希，为了更快的加载和更准的缓存
- **`dist` 必须用服务器访问**，不能双击打开
- 哈希路由无需路径回退；history 路由的深链接访问需要服务器回退到 `index.html`

---

# 第 6 课：公共组件封装

**本课目标**：把 User.vue 里重复的弹窗表单抽成独立组件，掌握 Vue3 组件通信与自定义 `v-model`。

**知识点**：`props` / `$emit`、自定义 `v-model`、组件复用

## 6.1 原理讲解：为什么要封装组件

观察第 4 课改造后的 User.vue，它已经 130 多行。接下来要做「任务管理」页面，需要类似的“新增/编辑弹窗”——可以复用封装思路，避免重复维护弹窗行为。而且以后要统一给所有弹窗加校验、改按钮文案，就得逐个文件改。

**封装的目标只有一个：让重复的东西只存在一份。**

抽出来之后：

```text
src/components/
└── UserFormDialog.vue    ← 弹窗 + 表单，只写一次
src/views/
├── User.vue              ← 引入组件，传数据进去
└── Task.vue              ← 复用同一封装思路，另建任务表单
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
  emits: ['update:modelValue', 'submit', 'closed'],
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
    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除用户「${row.username}」吗？`, '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
      } catch {
        return
      }
      try {
        await delUser(row.id)
        this.$message.success('删除成功')
        await this.fetchList()
      } catch (error) {
        this.$message.error(error.message || '删除失败')
      }
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
| 新增任务页时 | 复制 60 行 | 复用封装思路，另建匹配任务字段的表单组件 |
| 职责 | 页面既管列表又管表单 | **页面管列表，组件管表单** |

> 💡 **命名提示**：`rowData` 在 template 里写成 `:row-data`（短横线），在 props 里声明成 `rowData`（驼峰）。**HTML 属性不区分大小写，所以 Vue 规定用短横线形式**，这是新手最容易搞混的一处。

## 6.5 进阶：把搜索栏也封装掉

可选练习：把"输入框 + 查询按钮 + 新增按钮"抽成 `SearchBar`。若继续第 9 课，记得给新增按钮增加权限输入与 `v-if`；否则先保留第 6.4 节的内联搜索栏：

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

**验收**：打开张三的编辑弹窗，修改姓名后点取消，列表仍显示原名；再次编辑并保存，列表显示新名。新增用户后弹窗应重置为空表单。

## 6.7 本课小结

- 组件通信铁律：**props 向下传数据，$emit 向上发事件**
- 自定义 `v-model` = `modelValue` prop + `update:modelValue` 事件
- **子组件内部要维护数据副本**，不能直接改 props（既违规又会引发"取消后数据被改"的 bug）
- `watch` 加 `immediate: true` 才能在初始化时同步一次数据
- 同类字段的页面可复用组件；不同字段的页面复用封装方法与交互约定

---

# 第 7 课：ECharts 数据可视化

**本课目标**：用静态示例数据绘制仪表盘图表，掌握 ECharts 在 Vue 3 中的集成方式。

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

> 💡 **进阶**：如果以后做了"侧边菜单折叠"，折叠后容器宽度变了但窗口没变，`window.resize` 不会触发。这时要在折叠的 `watch` 里也调用一次 `chart.resize()`。

## 7.5 原理讲解：`dispose` 和内存泄漏

```js
beforeUnmount() {
  this.barChart && this.barChart.dispose()
}
```

ECharts 实例内部会持有 DOM 引用、定时器、事件监听。**不销毁的后果**：在仪表盘和其他页面之间反复切换几十次后，内存占用越来越高，页面变卡——这就是**内存泄漏**。

`dispose()` 会把这个实例彻底销毁、释放资源。**这是 Vue 组件里使用第三方 DOM 库的通用收尾动作。**

## 7.6 进阶：按需引入（明显减小打包体积）

`import * as echarts from 'echarts'` 会引入较多本课未用到的图表模块；实际产物体积受版本与构建配置影响。如果只用了柱状图和饼图，可以按需引入：

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

其余图表配置可以保留。改完用第 10 课的构建报告比较实际体积，不预设固定节省比例。

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

**验收**：柱状图和饼图都能显示；缩放窗口后图表尺寸跟随变化；从仪表盘切到用户页再返回，图表仍正常显示且控制台无实例重复初始化错误。

## 7.8 本课小结

- ECharts 不是 Vue 组件，需要 `ref` 拿到真实 DOM 才能初始化
- **初始化必须在 `mounted`**，因为要等 DOM 渲染完
- 容器**必须有高度**，否则静默白屏（最坑）
- 窗口变化要手动 `resize()`，组件销毁要 `dispose()`
- 生产项目用**按需引入**控制包体积

---

# 第 8 课：本地头像预览与批量删除

**本课目标**：选取图片并立即预览；在用户表格里勾选多行并删除。头像部分只做本地预览，不上传服务器，也不保存到用户记录。真正的文件上传需要后端上传接口及服务端校验。

**知识点**：`el-upload` 的 `on-change`、Blob URL 的释放、`el-table` 多选、异步批量操作。

## 8.1 为什么用 `on-change` 校验

`auto-upload="false"` 表示选中文件后不自动请求服务器。`before-upload` 只在**实际开始上传前**触发；本课没有调用 `submit()`，所以应在选文件时触发的 `on-change` 中检查类型与大小。浏览器的 `accept` 只是选择器提示，不能代替代码校验，更不能代替服务端校验。

## 8.2 新建 `src/components/AvatarUpload.vue`（完整文件）

```vue
<template>
  <div>
    <el-upload
      ref="uploadRef"
      class="avatar-uploader"
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      accept="image/jpeg,image/png"
      :on-change="handleChange"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar" alt="本地头像预览" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <p class="tip">本地预览：JPG / PNG，不超过 2 MB；保存用户时不上传图片。</p>
  </div>
</template>

<script>
export default {
  name: 'AvatarUpload',
  data() {
    return { imageUrl: '' }
  },
  beforeUnmount() {
    this.releasePreview()
  },
  methods: {
    releasePreview() {
      if (this.imageUrl) URL.revokeObjectURL(this.imageUrl)
      this.imageUrl = ''
    },
    handleChange(uploadFile) {
      const file = uploadFile.raw
      if (!file) return
      const validType = ['image/jpeg', 'image/png'].includes(file.type)
      const validSize = file.size <= 2 * 1024 * 1024
      if (!validType || !validSize) {
        this.$message.error(!validType ? '只支持 JPG / PNG' : '图片不能超过 2 MB')
        this.$refs.uploadRef.clearFiles()
        return
      }
      this.releasePreview()
      this.imageUrl = URL.createObjectURL(file)
    }
  }
}
</script>

<style scoped>
.avatar-uploader :deep(.el-upload) {
  display: flex; align-items: center; justify-content: center;
  width: 100px; height: 100px; overflow: hidden;
  border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer;
}
.avatar-uploader :deep(.el-upload:hover) { border-color: #409eff; }
.avatar { width: 100px; height: 100px; object-fit: cover; }
.avatar-uploader-icon { font-size: 28px; color: #8c939d; }
.tip { margin-top: 8px; font-size: 12px; color: #909399; }
</style>
```

在 `src/components/UserFormDialog.vue` 的 `<script>` 里导入并注册：

```js
import AvatarUpload from './AvatarUpload.vue'

// 在 export default 内合并此项；保留原有 name、props、data、watch、methods
components: { AvatarUpload },
```

在该组件的 `<el-form>` 内增加一项：

```vue
<el-form-item label="头像预览">
  <AvatarUpload v-if="modelValue" />
</el-form-item>
```

`v-if="modelValue"` 使弹窗关闭时预览组件卸载，Blob URL 随之释放。这里展示的是本地文件选择体验；需要持久保存时，再设计 `FormData` 请求、服务端上传接口、返回的图片 URL 与用户资料的关联。

**验收**：选择 JPG/PNG 后出现预览；选择超 2 MB 或其他类型显示错误；关闭再打开弹窗时预览清空。Network 面板不应出现图片上传请求。

## 8.3 用户表格批量删除（局部修改 `src/views/User.vue`）

在第 6 课的 User.vue 中，给 `<el-table>` 增加 `ref`、选中事件和第一列：

```vue
<el-table
  ref="tableRef"
  v-loading="loading"
  :data="tableData"
  border
  stripe
  @selection-change="handleSelectionChange"
>
  <el-table-column type="selection" width="55" />
  <!-- 保留原有 ID、用户名、手机号、角色和操作列 -->
</el-table>
```

在表格上方放置按钮：

```vue
<el-button
  type="danger"
  :loading="deleting"
  :disabled="selectedRows.length === 0"
  @click="handleBatchDelete"
>
  批量删除（已选 {{ selectedRows.length }} 项）
</el-button>
```

在 `data()` 返回对象中增加 `selectedRows: []`、`deleting: false`；在 `methods` 中增加：

```js
handleSelectionChange(rows) {
  this.selectedRows = rows
},
async handleBatchDelete() {
  const ids = this.selectedRows.map(row => row.id)
  if (ids.length === 0) return
  try {
    await this.$confirm(`确定删除选中的 ${ids.length} 个用户吗？`, '批量删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
  } catch {
    return  // 用户取消
  }

  this.deleting = true
  try {
    for (const id of ids) await delUser(id)
    this.$message.success(`成功删除 ${ids.length} 条数据`)
  } catch (error) {
    this.$message.error(`删除中断：${error.message || '请求失败'}`)
  } finally {
    await this.fetchList()
    this.$refs.tableRef.clearSelection()
    this.selectedRows = []
    this.deleting = false
  }
},
```

`selection-change` 回调拿到的是被选中的**行对象数组**，所以先映射出 ID 再调用接口。这里逐个删除，只适合课堂练习；中途失败可能已有部分删除成功，因此无论结果如何都重新拉取列表。真实项目应让后端提供一次性批量接口，由后端决定事务规则。

单行删除成功后也可在重新拉取列表之后执行 `this.$refs.tableRef.clearSelection()`，避免旧勾选状态残留。

**验收**：勾选两行、取消其中一行，按钮数字应同步变化；确认删除后列表更新且勾选清空；取消确认时列表不变；删除失败时应出现错误提示。

## 8.4 本课小结

- 本地预览在 `on-change` 校验；没有 `submit()` 时不依赖 `before-upload`。
- `URL.createObjectURL` 生成预览地址，替换图片和组件卸载时都要释放。
- 批量删除要区分“取消确认”和“请求失败”，操作后刷新列表并清空勾选。

---

# 第 9 课：角色、菜单与按钮权限

**本课目标**：用三个演示账号跑通“页面可访问范围”和“页面内可执行操作”的差别。所有身份与权限仍由前端模拟，可被浏览器用户修改；真实接口必须在服务端再次鉴权。

| 演示账号 | 密码 | 可访问页面 | 用户管理操作 |
|---|---|---|---|
| `admin` | `123456` | 仪表盘、用户管理 | 新增、编辑、删除 |
| `manager` | `123456` | 仪表盘、用户管理 | 编辑 |
| `viewer` | `123456` | 仪表盘 | 无 |

## 9.1 更新模拟登录（局部修改 `src/views/Login.vue`）

**只替换 `methods` 中的 `login()`，保留页面模板、样式和其他代码。**

```js
login() {
  const accounts = {
    admin: { role: 'admin', permissions: ['user:add', 'user:edit', 'user:delete'] },
    manager: { role: 'manager', permissions: ['user:edit'] },
    viewer: { role: 'viewer', permissions: [] }
  }
  const username = this.loginForm.username.trim()
  const account = accounts[username]
  if (!account || this.loginForm.password !== '123456') {
    this.$message.error('账号或密码错误')
    return
  }
  this.$store.commit('setUserInfo', { username, ...account })
  this.$store.commit('setToken', `${username}-demo-token`)
  this.$message.success('登录成功')
  this.$router.push('/dashboard')
}
```

此前已用旧版本登录过的同学，先点击退出，再用三个演示账号重新登录。这里的密码与 token 都写在前端，仅用于课堂观察 UI，不具有真实身份安全性。

## 9.2 配置路由元信息和守卫（完整替换 `src/router/index.js`）

第 3 课的守卫在这里整体替换，不要再追加第二个 `beforeEach`。若做过 NProgress 可选练习，在新守卫中重新加入进度条逻辑。

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import store from '../store'
import Layout from '../views/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import User from '../views/User.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/', component: Layout, redirect: '/dashboard',
    children: [
      {
        path: 'dashboard', name: 'Dashboard', component: Dashboard,
        meta: { title: '仪表盘', icon: 'House', menu: true, roles: ['admin', 'manager', 'viewer'] }
      },
      {
        path: 'user', name: 'User', component: User,
        meta: { title: '用户管理', icon: 'User', menu: true, roles: ['admin', 'manager'] }
      }
    ]
  }
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach(to => {
  const token = store.state.token
  if (to.path === '/login') return token ? '/dashboard' : true
  if (!token) return '/login'

  const role = store.state.userInfo?.role
  const allowed = to.meta.roles
  if (Array.isArray(allowed) && !allowed.includes(role)) {
    ElMessage.warning('您没有权限访问该页面')
    return '/dashboard'
  }
  return true
})

export default router
```

`meta` 保存页面标题、图标和允许角色。Vue Router 4 的守卫可以直接返回 `true` 或目标路径；这样每个分支都有明确结果。`store` 与页面共享同一份登录状态，刷新后由第 1 课的 Vuex 初始化逻辑从 localStorage 恢复。

## 9.3 根据路由配置生成菜单（局部修改 `src/views/Layout.vue`）

把原来的两个固定 `<el-menu-item>` 替换成下面的循环，保留外层 `<el-menu>` 的属性：

```vue
<el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
  <el-icon><component :is="item.icon" /></el-icon>
  <span>{{ item.title }}</span>
</el-menu-item>
```

在 Layout 的 `export default` 中新增 `computed`，保留已有的退出登录方法：

```js
computed: {
  userRole() {
    return this.$store.state.userInfo?.role
  },
  menuList() {
    return this.$router.getRoutes()
      .filter(route => route.meta.menu)
      .filter(route => !route.meta.roles || route.meta.roles.includes(this.userRole))
      .map(route => ({ path: route.path, title: route.meta.title, icon: route.meta.icon }))
  }
},
```

菜单直接从路由的 `meta` 派生，避免再维护一份角色列表。`<component :is="item.icon" />` 使用第 1 课全局注册的 Element Plus 图标。只会显示实际存在的 `/dashboard` 和 `/user` 路由；任务页做好后再加入。

## 9.4 用 `v-if` 控制按钮（局部修改 `src/views/User.vue`）

在 User.vue 的 `methods` 中新增：

```js
can(permission) {
  return this.$store.state.userInfo?.permissions?.includes(permission) || false
},
```

给第 6 课现有按钮增加条件：

```vue
<el-button v-if="can('user:add')" type="success" @click="openAddDialog">新增用户</el-button>
<el-button v-if="can('user:edit')" link type="primary" @click="openEditDialog(row)">编辑</el-button>
<el-button v-if="can('user:delete')" link type="danger" @click="handleDelete(row)">删除</el-button>
```

第 8 课的批量删除按钮也加 `v-if="can('user:delete')"`。若做过第 6.5 节的可选 SearchBar，应把“可新增”权限作为 prop 传给 SearchBar，在其内部控制新增按钮。只展示有权按钮能减少误操作；按钮隐藏不构成安全边界，调用 `delUser` 等真实接口时仍要由服务器校验权限。

本课用 `v-if`，因为权限来自响应式 store，切换登录状态后 Vue 能重新渲染。直接在自定义指令里用 `removeChild` 删除 Vue 管理的 DOM，容易与后续组件更新冲突，也无法自然恢复按钮。

## 9.5 验收

1. 用 `viewer` 登录：只有仪表盘菜单；手输 `#/user` 会回到仪表盘并提示无权限。
2. 退出后用 `manager` 登录：能进入用户管理，能编辑，看不到新增、单行删除和批量删除。
3. 退出后用 `admin` 登录：可看到所有菜单和操作按钮；删除后列表更新。
4. 刷新页面：当前演示账号与对应菜单保持一致。

## 9.6 本课小结

- 路由 `meta.roles` 决定页面能否访问；菜单从同一份路由元信息派生。
- 页面按钮按 `permissions` 控制，演示账号让三种结果都可测试。
- 前端权限只控制交互，真正的授权必须由后端执行。

---

# 第 10 课：演示部署与打包优化

**本课目标**：打包并部署一个可供展示的前端演示版，理解真实后端接入时的环境变量、开发代理和 Nginx 反向代理，并用构建报告验证优化效果。

| 模式 | Mock | 登录 | 用户数据 | 需要后端 |
|---|---|---|---|---|
| 课堂演示包（本课可直接完成） | 保留 | 前端模拟 | 浏览器内存，刷新重置 | 否 |
| 真实接口联调 | 移除 | 须替换为后端登录 | 后端持久化 | 是 |

**部署边界**：演示包可公开展示界面，但不具备真实身份安全性或持久化数据。若要用于实际业务，必须完成后端登录、凭证校验、用户 CRUD 和权限校验，再移除 Mock。

## 10.1 配置环境变量（局部修改）

在项目根目录创建 `.env.development` 和 `.env.production`：

```text
# .env.development
VUE_APP_BASE_API=/api
```

```text
# .env.production
VUE_APP_BASE_API=/api
```

把 `src/api/request.js` 中的 `baseURL: '/api'` 改为：

```js
baseURL: process.env.VUE_APP_BASE_API,
```

Vue CLI 只向应用代码注入以 `VUE_APP_` 开头的自定义变量，且变量在构建时写入包中，不能放密钥。修改环境文件后重启开发服务或重新构建。两个环境都写 `/api`，是因为浏览器始终请求同源路径；开发代理与生产代理分别决定它通向哪里。

## 10.2 开发代理：仅在接入真实后端时启用

第 4 课的 `src/main.js` 仍有 `import './mock'`，它会拦截匹配的用户接口。要联调真实后端，先删掉这一行，确认后端已实现本课使用的请求路径与响应格式，再重启开发服务。

若后端监听 `http://localhost:3000`，实际路径为 `/user/list` 等，在项目根目录创建或更新**同一个** `vue.config.js`：

```js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: '/',
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
})
```

浏览器请求 `http://localhost:8080/api/user/list`；开发服务器转发到 `http://localhost:3000/user/list`。浏览器只与 8080 端口通信，因此不会遇到跨域请求。如果后端接口本身带 `/api` 前缀，就删掉 `pathRewrite`。`changeOrigin` 会调整转发请求的 Host 等信息，它不负责绕过浏览器安全规则。

**注意**：`devServer.proxy` 只在 `npm run serve` 时存在，`dist` 中没有开发代理。演示包保留 Mock 时也不会走到此代理。

## 10.3 路由懒加载（局部修改 `src/router/index.js`）

只改第 9 课路由文件的页面导入和 `component` 字段；保留 `routes` 的其他字段、`createRouter`、守卫和 `export default router`。

```js
// 删除 Login、Dashboard、User 的静态 import，保留 Layout 的静态 import
import Layout from '../views/Layout.vue'

// 在原有 routes 对应位置替换 component：
// 登录页：component: () => import('../views/Login.vue')
// 仪表盘：component: () => import('../views/Dashboard.vue')
// 用户管理：component: () => import('../views/User.vue')
```

`import()` 让构建工具把这些页面拆成独立 chunk；进入对应路由时才加载。Layout 是中台页面共同骨架，可先保持静态导入。实际首屏收益要用浏览器 Network 与构建报告比较，不能只凭 chunk 数量判断。

## 10.4 打包并查看实际体积

```bash
npm run build
npm run build -- --report
```

第二条命令使用 Vue CLI 自带的 `--report`，生成 `dist/report.html` 供本地分析；用于交付时可再运行普通 `npm run build`，避免把分析报告留在部署目录。比较第 7 课 ECharts 全量导入与按需导入的构建结果，关注实际 JS 大小和浏览器首次加载时间。不要预设固定的“减半”或节省 KB 数。

## 10.5 用 Nginx 部署课堂演示包

此路径**保留**第 4 课的 `import './mock'`，无需后端。把 `dist/` **里面的文件和目录**复制到 Nginx 的站点根目录，例如 `/usr/share/nginx/html/`；不要把整个 `dist` 文件夹再套一层，否则入口会落在 `/dist/index.html`。

```nginx
server {
    listen 80;
    server_name _;  # 有正式域名时改为该域名
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

先运行 `nginx -t` 检查语法，再重载 Nginx。`try_files` 对当前哈希路由不是必需的；它用于以后改成 history 路由时，深链接找不到服务器文件后回退到 `index.html`。若部署在固定子目录，要将 `publicPath` 改成对应路径并调整 Nginx 站点路径。

## 10.6 连接真实后端时增加生产反向代理

完成真实登录与后端接口后，从 `main.js` 移除 Mock 引入并重新构建。若后端在同一台服务器的 3000 端口，并且后端路径**不带** `/api`，可在上面的 `server` 配置内增加：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

这个配置把 `/api/user/list` 转发成 `/user/list`，与开发代理的 `pathRewrite` 对齐。如果后端路径带 `/api`，应改为保留前缀的代理写法并实测完整 URL。生产环境的 `/api` 由 Nginx 或实际后端提供，不由 `devServer.proxy` 提供。

## 10.7 验收与排错

1. **演示包**：部署后能登录、搜索、增删改；刷新后 Mock 列表重置，这是预期行为。
2. **静态资源**：打开 Network，`index.html`、JS、CSS 均返回 200；若资源 404，检查 `publicPath` 与实际站点路径。
3. **真实接口联调**：删除 Mock 引入后，Network 中应能看到 `/api/...` 请求；若 404，核对前缀是否被代理重写两次或漏写。
4. **权限边界**：前端按钮和菜单只能帮助用户使用页面；服务端应拒绝没有权限的直接 API 请求。

## 10.8 本课小结

- Vue CLI 环境变量在构建时注入，不能存密钥。
- 开发代理、生产反向代理与 Mock 是三种不同的请求路径，切换时要先确认当前生效的是哪一种。
- Nginx 的 `root` 要指向 `dist` 内容所在目录；哈希路由无须 history 回退规则。
- 用构建报告和 Network 数据衡量优化效果。

---

# 课后作业

1. 新增“任务管理”页面：完成表格、搜索、新增、编辑、删除；在路由 `meta` 中配置标题、图标与角色，菜单应自动出现；为 `src/mock/index.js` 增加有状态的任务接口。
2. 为 `UserFormDialog.vue` 增加表单校验：用户名非空、手机号格式正确；取消编辑后原行不变，校验失败时不得发送保存请求。
3. 把仪表盘“用户总数”和角色分布改为由 `getUserList()` 结果计算；增删用户后重新进入仪表盘，统计应随 Mock 数据变化。

## 作业提示

- 任务字段与用户字段不同，应新建 `TaskFormDialog`，复用第 6 课的 props / emit 设计思路。
- 表单可使用 `:rules`、`prop` 与 `this.$refs.formRef.validate()`；校验通过后再触发 `submit`。
- 图表数据变化时调用已有图表实例的 `setOption()`；不要重复 `echarts.init()` 同一个 DOM。

# 可选拓展

- 侧边菜单折叠：布局变化后调用图表实例 `resize()`。
- 真正的头像上传：增加后端上传接口、`FormData` 请求、服务端文件校验与用户记录持久化。
- 真实登录：替换硬编码账号与演示 token，并在后端实现接口权限控制。
- 分页和自动化测试：先定义可验证的输入、输出和失败场景。

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
│   │   ├── SearchBar.vue       # 可选：搜索栏（第 6 课）
│   │   └── AvatarUpload.vue    # 本地头像预览（第 8 课）
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
├── vue.config.js               # publicPath / 开发代理（第 10 课）
└── package.json
```

## 附录：全书易错点速查

| 情况 | 核对点 | 课程 |
|---|---|---|
| 第 1 课点击用户菜单无页面 | 第 2 课才会同时加入 `/user` 路由和菜单 | 1～2 |
| 筛选后编辑导致其他行消失 | 只修改全量 `originData`，显示列表由 `computed` 派生 | 2 |
| 空表新增产生异常 ID | `Math.max(0, ...ids) + 1`；真实项目由后端生成 | 2 |
| Mock 保存成功但列表没变化 | Mock 接口要维护可变数组并按条件查询 | 4 |
| Mock 请求没有出现在真实网络请求中 | 检查 Mock 回调的 `options.url`；接真实后端前移除引入 | 4、10 |
| 头像预览未校验文件 | 手动上传模式应在 `on-change` 校验 | 8 |
| 删除后旧勾选仍在 | 刷新列表后调用 `clearSelection()` | 8 |
| 菜单与按钮权限不一致 | 路由 `meta.roles` 管页面，`permissions` 管按钮 | 9 |
| 部署后静态资源 404 | 对齐 `publicPath` 与 Nginx 根目录/子路径 | 5、10 |
| 真实接口仍拿到 Mock 数据 | 移除 `main.js` 中的 Mock 引入，重新构建 | 10 |

## 官方参考

- [Node.js 版本维护状态](https://nodejs.org/en/about/previous-releases)
- [Vue CLI 维护状态与项目创建](https://cli.vuejs.org/guide/creating-a-project.html)
- [Vue CLI 的 publicPath 与代理配置](https://cli.vuejs.org/config/)
- [Vue Router 嵌套路由](https://router.vuejs.org/guide/essentials/nested-routes.html)
- [Element Plus 上传组件](https://element-plus.org/en-US/component/upload.html)
- [Element Plus 按钮](https://element-plus.org/en-US/component/button.html)
- [Element Plus 图标](https://element-plus.org/en-US/component/icon.html)
