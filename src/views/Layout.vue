<template>
  <el-container class="layout">
    <el-aside :width="collapsed ? '64px' : '226px'" class="aside">
      <div class="logo" :class="{ mini: collapsed }">
        <span class="mark">WA</span>
        <span v-if="!collapsed" class="name">work-admin</span>
      </div>

      <el-menu
        :default-active="activePath"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        unique-opened
        class="menu"
      >
        <el-menu-item v-for="item in menus.singles" :key="item.path" :index="'/' + item.path">
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>

        <el-sub-menu v-for="group in menus.groups" :key="group.name" :index="group.name">
          <template #title>
            <el-icon><component :is="group.icon" /></el-icon>
            <span>{{ group.name }}</span>
          </template>
          <el-menu-item v-for="item in group.items" :key="item.path" :index="'/' + item.path">
            <el-icon><component :is="item.meta.icon" /></el-icon>
            <template #title>{{ item.meta.title }}</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div v-if="!collapsed" class="aside-footer">
        <el-tag :type="isMock ? 'warning' : 'success'" size="small" effect="plain">
          {{ isMock ? 'Mock 演示数据' : '真实后端' }}
        </el-tag>
      </div>
    </el-aside>

    <el-container class="body">
      <el-header class="header">
        <el-button link class="collapse-btn" @click="toggleSidebar">
          <el-icon :size="18"><component :is="collapsed ? 'Expand' : 'Fold'" /></el-icon>
        </el-button>

        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-if="currentGroup">{{ currentGroup }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="spacer" />

        <el-tooltip content="刷新当前用户（GET /api/auth/me）" placement="bottom">
          <el-button link :loading="userLoading" class="header-btn" @click="loadCurrentUser">
            <el-icon :size="16"><Refresh /></el-icon>
          </el-button>
        </el-tooltip>

        <el-dropdown trigger="click">
          <span class="user-entry">
            <el-avatar :size="28" :src="userInfo && userInfo.avatar">
              {{ initial }}
            </el-avatar>
            <span class="user-name">{{ displayName }}</span>
            <el-tag size="small" effect="plain">{{ roleName }}</el-tag>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/profile')">个人中心</el-dropdown-item>
              <el-dropdown-item divided :disabled="loggingOut" @click="handleLogout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { getCurrentUser, logoutApi } from '../api/auth'
import { buildMenus } from '../router/routes'
import { normalizeUser } from '../utils/session'
import { USE_MOCK } from '../api/request'

export default {
  name: 'AdminLayout',
  data() {
    return {
      userLoading: false,
      loggingOut: false,
      isMock: USE_MOCK
    }
  },
  computed: {
    ...mapGetters(['displayName', 'roleCode', 'permissions']),
    collapsed() {
      return this.$store.state.sidebarCollapsed
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    menus() {
      return buildMenus(this.roleCode)
    },
    activePath() {
      return this.$route.path
    },
    currentTitle() {
      return this.$route.meta.title || '主页'
    },
    currentGroup() {
      return this.$route.meta.group || ''
    },
    roleName() {
      return (this.userInfo && this.userInfo.roleName) || ''
    },
    initial() {
      const name = (this.userInfo && (this.userInfo.name || this.userInfo.account)) || ''
      return name.slice(0, 1).toUpperCase()
    }
  },
  created() {
    this.loadCurrentUser()
  },
  methods: {
    toggleSidebar() {
      this.$store.commit('toggleSidebar')
    },
    async loadCurrentUser() {
      if (this.userLoading || this.loggingOut) return
      const token = this.$store.state.token
      if (!token) return

      this.userLoading = true
      try {
        const user = await getCurrentUser()
        // 旧请求回来后如果 Token 已经变了，就不要再覆盖新会话
        if (token === this.$store.state.token) {
          this.$store.commit('setUserInfo', normalizeUser(user))
        }
      } catch {
        // 请求封装已提示错误；401 会自动回登录页
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
        // 网络失败也清理本地会话，但不能认定云端 Token 已注销
      } finally {
        this.$store.commit('clearUserInfo')
        this.loggingOut = false
        await this.$router.replace('/login')
      }
    }
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
}

.aside {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid var(--wa-border);
  transition: width 0.2s ease;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 18px;
  border-bottom: 1px solid var(--wa-border);
  flex-shrink: 0;
}

.logo.mini {
  justify-content: center;
  padding: 0;
}

.mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--wa-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.name {
  font-size: 15px;
  font-weight: 500;
}

.menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.aside-footer {
  padding: 12px 18px;
  border-top: 1px solid var(--wa-border);
  flex-shrink: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 56px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid var(--wa-border);
}

.collapse-btn,
.header-btn {
  padding: 4px;
}

.spacer {
  flex: 1;
}

.user-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.user-name {
  font-size: 13px;
  color: var(--wa-text);
}

.main {
  padding: 20px;
  background: var(--wa-bg);
  overflow-y: auto;
}
</style>
