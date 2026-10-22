import store from '../store'
import { hasPermission } from '../utils/session'

/**
 * v-permission 按钮级权限指令。
 *
 * 用法：
 *   <el-button v-permission="'user:add'">新增</el-button>
 *   <el-button v-permission="['user:edit', 'user:delete']">批量操作</el-button>
 *
 * 实现上选择「隐藏」而不是 removeChild：表格行重渲染时，Vue 需要按索引 patch 子节点，
 * 如果某个节点已被外部移除，会报 cannot read properties of null。
 * 隐藏 + 禁用同样达到「看不见也点不到」的效果，且不会破坏 Vue 的 diff。
 *
 * 无论前端怎么隐藏，都不能替代后端鉴权 —— 拿 Token 直接调接口同样能越权。
 */
export default {
  install(app) {
    app.directive('permission', {
      mounted(el, binding) {
        const required = Array.isArray(binding.value) ? binding.value : [binding.value]
        const owned = store.getters.permissions
        const passed = required.some(code => hasPermission(owned, code))
        if (passed) return

        el.style.display = 'none'
        el.setAttribute('aria-hidden', 'true')
        el.dataset.permissionDenied = 'true'
      }
    })
  }
}
