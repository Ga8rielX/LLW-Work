<template>
  <el-card shadow="never">
    <h1 class="page-title">菜单管理</h1>
    <p class="page-description">
      本项目的菜单直接由前端路由表 <code>src/router/routes.js</code> 的 <code>meta</code> 生成：
      改一处 <code>title / icon / roles / group</code>，侧边栏和权限判断同时生效。
      真实项目里这张表通常由后端菜单表返回，再动态 <code>addRoute</code>。
    </p>

    <el-alert
      title="当前为只读视图：菜单数据来自前端路由配置，不走接口。后端菜单接口可用时，把数据源换成 GET /api/menus 即可。"
      type="info"
      :closable="false"
      class="alert"
    />

    <el-table :data="rows" border row-key="path" default-expand-all>
      <el-table-column prop="title" label="菜单名称" min-width="150">
        <template #default="{ row }">
          <el-icon class="menu-icon"><component :is="row.icon" /></el-icon>
          {{ row.title }}
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" min-width="130" />
      <el-table-column prop="group" label="所属分组" width="130">
        <template #default="{ row }">{{ row.group || '—' }}</template>
      </el-table-column>
      <el-table-column label="可见角色" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role" size="small" effect="plain" class="role-tag">
            {{ roleLabel(role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="菜单可见" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="row.hidden ? 'info' : 'success'" effect="plain">
            {{ row.hidden ? '隐藏' : '显示' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <p class="hint">
      提示：把某个路由的 <code>meta.roles</code> 改成 <code>['admin']</code> 后，用 manager 账号登录就看不到这个菜单；
      直接手输地址会跳转 403。这就是课件里「动态菜单 + 路由守卫」的最小实现。
    </p>
  </el-card>
</template>

<script>
import { layoutChildren } from '../router/routes'
import { ROLE_LABELS } from '../utils/session'

export default {
  name: 'MenuManage',
  data() {
    return {
      rows: layoutChildren.map(route => ({
        title: route.meta.title,
        path: `/${route.path}`,
        group: route.meta.group || '',
        icon: route.meta.icon,
        roles: route.meta.roles,
        hidden: Boolean(route.meta.hidden)
      }))
    }
  },
  methods: {
    roleLabel(code) {
      return ROLE_LABELS[code] || code
    }
  }
}
</script>

<style scoped>
.alert {
  margin-bottom: 16px;
}

.menu-icon {
  vertical-align: -2px;
  margin-right: 4px;
}

.role-tag {
  margin-right: 4px;
}

code {
  padding: 1px 5px;
  background: #f1f3f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
