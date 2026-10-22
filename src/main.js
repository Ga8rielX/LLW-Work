import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import store from './store'
import { setUnauthorizedHandler } from './api/request'
import permission from './directive/permission'
import './assets/styles/global.css'

const app = createApp(App)

// 全量注册 Element Plus 图标（课件第 1 课的写法，模板里可直接用 <User /> 等）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 401 统一跳转：由 main.js 注入，避免 request.js 与 router 相互导入
setUnauthorizedHandler(() => {
  if (router.currentRoute.value.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})

app.use(store).use(router).use(ElementPlus).use(permission)
app.mount('#app')
