# work-admin 工作管理中台

Vue 3 + Element Plus + Vuex + Vue Router + Axios 的中台项目，按四份课件（教学版 → 接口对接 → 新功能）逐层实现。
**默认 Mock 模式，不依赖任何后端，`npm install && npm run serve` 就能完整演示**；改一行环境变量即可切换到课件里的真实后端。

技术栈刻意与课件保持一致：**Vue 3 + 选项式 API + 纯 JavaScript（不用 TypeScript）+ Vue CLI 5**。

---

## 仓库目录

```text
work-admin/
├── src/                                   # 项目源码（views / api / mock / components / router / store）
├── public/  package.json  vue.config.js   # 工程配置
├── 课件/
│   ├── work-admin-教学.md                  # 第 0～10 课基础讲义
│   ├── work-admin-教学-优化版.md            # 修订版（以此为准）
│   ├── work-admin-接口对接步骤.md           # 真实后端 10 个接口
│   └── work-admin-新功能课堂课件.md          # 权限 / 群聊 / AI 流式
├── AI技能包/README.md                      # AI 协作流程、提示词模板与踩坑记录
├── 功能验收清单.md                          # 29 条可复现的验收点（老师检查时用）
├── 本地代码首次上传GitHub详细步骤.md          # 从 git init 到 push 的全流程
└── README.md                              # 本文件
```

---

## 一、已实现的功能（对照课件）

| 课件内容 | 本项目实现 | 代码位置 |
|---|---|---|
| 第 1 课 布局 / 菜单 / Vuex / localStorage | 侧边栏折叠、分组菜单、头部用户信息、登录态持久化 | `views/Layout.vue`、`store/index.js` |
| 第 2 课 用户管理 CRUD | 列表、详情、新增、编辑、删除、分页 | `views/User.vue` |
| 第 3 课 路由守卫 | 未登录拦截、来源地址回跳、Token 失效回登录 | `router/index.js`、`api/request.js` |
| 第 4 课 Axios 封装 + Mock | 请求/响应拦截器、错误统一提示、401 处理、Mock 服务端 | `api/request.js`、`mock/` |
| 第 5 课 打包与预览 | `npm run build` 产出 `dist/`，可直接静态部署 | `vue.config.js` |
| 第 6 课 公共组件封装 | 搜索栏、用户表单弹窗（props/emit + 自定义 v-model）、头像组件 | `components/` |
| 第 7 课 ECharts 可视化 | 近 7 天注册趋势折线图 + 角色分布饼图，数据由接口实时计算 | `views/Dashboard.vue` |
| 第 8 课 头像预览 + 批量删除 | 本地选图预览（类型/2MB 校验）、表格多选批量删除 | `components/AvatarUpload.vue`、`views/User.vue` |
| 第 9 课 角色权限 | `meta.roles` 动态菜单、`v-permission` 按钮权限、403 页 | `router/routes.js`、`directive/permission.js` |
| 第 10 课 环境变量 / 代理 / 懒加载 | `.env.development`、`.env.production`、路由懒加载、`vue.config.js` 代理（已注释） | 根目录 |
| 接口对接 10 个接口 | 登录 / me / 登出 / 注册 / 用户 5 个 / 消息回显 | `api/*.js`、`views/Messages.vue` |
| 新功能：后端搜索 | `GET /api/users?page=&keyword=` 真分页真搜索 | `api/user.js` |
| 新功能：角色 + 权限树 | 角色 CRUD、权限树勾选保存、角色下用户数保护 | `views/Role.vue` |
| 新功能：菜单管理 | 路由 meta 生成菜单表（只读视图） | `views/Menu.vue` |
| 新功能：群聊 | WebSocket 客户端（Mock 模式用 BroadcastChannel 跨标签页互通） | `utils/chat-client.js` |
| 新功能：AI 流式对话 | SSE 流式解析（Mock 模式模拟逐字输出） | `utils/ai-client.js` |

---

## 二、快速开始

```bash
npm install
npm run serve          # 打开 http://127.0.0.1:8081
npm run build          # 产出 dist/，可直接部署到 Nginx 或静态托管
```

推荐 Node.js 18 / 20 / 22（课件统一 24 LTS 也可以）。端口固定 `8081`，与课件「接口对接步骤」一致；被占用时先停掉占用进程，不要让它自动换端口。

### 演示账号（Mock 模式）

| 账号 | 密码 | 角色 | 能看到什么 |
|---|---|---|---|
| `admin` | `123456` | 超级管理员 | 全部菜单，含角色管理、菜单管理 |
| `manager` | `123456` | 管理员 | 仪表盘、用户管理、群聊、AI |
| `member` | `123456` | 普通用户 | 仪表盘、群聊、AI（直接访问 `/users` 会跳 403） |

登录页可点击标签自动填入。**这三个账号是本地 Mock 数据，不是真实后端账号。**

---

## 三、Mock 与真实后端切换

所有开关都在 `.env.development`：

```env
VUE_APP_USE_MOCK=true                                  # false = 走真实后端
VUE_APP_API_BASE_URL=http://118.25.25.164:8080         # 课件里的教学后端
VUE_APP_WS_BASE_URL=ws://118.25.25.164:8080            # 群聊 WebSocket
VUE_APP_ALLOW_REGISTER=false                           # 真实后端当前关闭注册，返回 403
```

改完要**重启** `npm run serve`（环境变量在构建时注入，运行时改无效）。

### 为什么 Mock 不用 MockJS 拦截 XHR

MockJS 的拦截只能返回 200 的响应体，表达不了课件里必须验证的 `401（登录失效）`、`403（注册未开放）`、`409（账号重复）`。
所以这里用 **axios 自定义 adapter** 把请求转给 `src/mock/server.js`，完整还原状态码语义；MockJS 只用来生成种子数据（`Mock.Random.cname()`）。

好处是：页面代码只有一份，`api/` 层完全按真实接口写，切到真实后端不需要改任何页面。

### 接真实后端时要注意

1. 真实后端只返回 `{ tokenName, tokenValue, user:{id,name,account} }`，没有角色/权限字段。`utils/session.js` 做了兜底：缺角色时按 `admin` 处理，保证页面可用；后端升级后会自动使用返回的 `roleCode / permissions`。
2. 认证头是 `satoken`，值是 `tokenValue`，**不加 `Bearer`**。
3. 后端注册接口当前返回 **403 属于正常**，注册页会显示后端 message，这本身就是验收点。
4. 群聊 WebSocket 与 AI SSE 需要后端提供对应接口；后端未提供时把 `VUE_APP_USE_MOCK` 保持 `true` 演示即可。

---

## 四、目录结构

```text
work-admin/
├── public/index.html
├── src/
│   ├── api/
│   │   ├── request.js        # axios 实例 + 拦截器 + Mock adapter
│   │   ├── auth.js           # 登录 / 注册 / me / 登出
│   │   ├── user.js           # 用户 5 个接口 + 批量删除
│   │   ├── role.js           # 角色 + 权限接口
│   │   └── message.js        # 消息回显接口
│   ├── mock/
│   │   ├── db.js             # 种子数据（localStorage 持久化）
│   │   └── server.js         # 带状态码的 Mock 服务端
│   ├── components/
│   │   ├── SearchBar.vue
│   │   ├── UserFormDialog.vue
│   │   └── AvatarUpload.vue
│   ├── config/permissions.js # 功能权限树
│   ├── directive/permission.js
│   ├── router/
│   │   ├── index.js          # 路由 + 全局守卫
│   │   └── routes.js         # 路由表（meta 驱动菜单）
│   ├── store/index.js
│   ├── utils/
│   │   ├── session.js        # 用户/权限归一化
│   │   ├── chat-client.js    # WebSocket / BroadcastChannel
│   │   └── ai-client.js      # SSE 流式
│   ├── views/
│   │   ├── Login.vue  Register.vue  Layout.vue
│   │   ├── Dashboard.vue  User.vue  Role.vue  Menu.vue
│   │   ├── Chat.vue  AiChat.vue  Messages.vue  Profile.vue
│   │   └── Forbidden.vue  NotFound.vue
│   ├── App.vue
│   └── main.js
├── .env.development / .env.production
├── vue.config.js
└── package.json
```

---

## 五、接口清单

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/api/auth/login` | 登录，返回 Token 与用户 |
| GET | `/api/auth/me` | 刷新当前用户 / 恢复会话 |
| PUT | `/api/auth/me` | 修改姓名与头像 |
| POST | `/api/auth/logout` | 退出，204 无响应体 |
| POST | `/api/auth/register` | 注册（真实后端 403） |
| GET | `/api/users?page=&keyword=` | 分页 + 后端搜索 |
| GET | `/api/users/{id}` | 详情 |
| POST | `/api/users` | 新增，201 |
| PUT | `/api/users/{id}` | 编辑（密码留空表示不改） |
| DELETE | `/api/users/{id}` | 删除，204 |
| GET/POST/PUT/DELETE | `/api/roles...` | 角色 CRUD |
| GET/PUT | `/api/roles/{id}/permissions` | 角色权限读取与保存 |

批量删除没有独立接口：真实后端只有单条 DELETE，所以 `api/user.js` 里串行调用，保证「Mock 能跑、真后端也能跑」。

---

## 六、权限设计（两层，缺一不可）

1. **菜单级**：`router/routes.js` 的 `meta.roles` 决定菜单是否渲染，同时守卫拦截直接输地址（跳 403）。
2. **按钮级**：`v-permission="'user:delete'"` 在没有权限时把按钮隐藏并标记 `aria-hidden`。

指令用的是「隐藏」而不是 `removeChild`：表格行重渲染时 Vue 要按索引 patch 子节点，节点被外部移除会抛
`Cannot read properties of null`。隐藏 + 不渲染点击入口，效果一致且不破坏 diff。

两者都只是**界面层**。真实项目必须由后端在接口上再校验一次权限，前端隐藏按钮挡不住直接调接口。

---

## 七、验收路径（对着课件 12.3 清单走一遍）

1. 错误密码登录 → 401，停留登录页并提示。
2. 正确登录 → `POST /api/auth/login` 200，进入仪表盘。
3. 刷新页面 → `GET /api/auth/me` 200，登录态保持（Token 在 localStorage）。
4. 用户管理翻页 → `GET /api/users?page=2` 200，每页 20 条。
5. 搜索「stu」→ 服务端过滤，total 变化。
6. 新增用户 → 201；用重复账号再提交 → **409，弹窗保留输入**。
7. 详情 / 编辑 → `GET /api/users/{id}`，密码不回填，留空保存不改密码。
8. 删除 → 204；勾选多行批量删除。
9. 用 `member` 登录 → 左侧没有用户管理；手输 `#/users` → 403 页。
10. 角色管理配置权限 → 保存后重新登录，按钮按权限出现/消失。
11. 群聊：两个标签页分别登录 `admin` / `member`，消息实时互通。
12. 消息接口 → 发送文字，页面回显「已接收到…该文字」（`text/plain` 响应）。
13. AI 助手：提问后文字逐字输出，可中途「停止生成」。
14. 退出登录 → 204，再直接访问 `#/users` 跳回登录页。

> 在开发者工具 Network 面板中，Mock 模式的请求不会出现在网络列表里（请求被 adapter 截住了），这是实现方式差异，不影响页面行为。要看真实请求，把 `VUE_APP_USE_MOCK` 改成 `false`。

---

## 八、已知边界（面试/答辩时主动说明更加分）

- **头像只是本地预览**：转成 dataURL 存在用户对象里，没有真实上传接口，生产环境需要后端上传 + FormData + 服务端校验。
- **权限只在前端**：后端没有做接口级鉴权，直接调接口仍可越权。
- **Mock 数据存在 localStorage**：刷新不丢（比课件默认的「刷新重置」更便于演示），要恢复初始数据可在浏览器控制台执行 `localStorage.removeItem('work-admin-mock-db-v1')` 后刷新。
- **AI 与群聊依赖后端**：真实后端未配置模型密钥、群聊协议需按后端实际实现调整。
- **Vue CLI 已进入维护模式**：新项目可评估 `create-vue` / Vite，本课程为与课件一致保留 Vue CLI 5。

---

## 九、提交到 GitHub

```bash
git init
git add .
git commit -m "feat: work-admin 工作管理中台（布局/CRUD/权限/群聊/AI 流式）"
git branch -M main
git remote add origin https://github.com/<你的用户名>/work-admin.git
git push -u origin main
```

`.gitignore` 已排除 `node_modules/`、`dist/`、`.env.*.local`。
**不要把真实 Token、密码、老师分配的账号写进仓库。**
