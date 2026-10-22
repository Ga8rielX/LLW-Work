/**
 * 路由表。
 *
 * meta 里承载了四件事：
 *   title   —— 菜单文字、面包屑、浏览器标题
 *   icon    —— 菜单图标（Element Plus 图标组件名）
 *   roles   —— 哪些角色可见（课件第 9 课：meta.roles + 动态菜单）
 *   group   —— 菜单分组，用于渲染 el-sub-menu
 *   hidden  —— 不出现在左侧菜单，但路由仍可访问
 */
export const layoutChildren = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表盘', icon: 'Odometer', roles: ['admin', 'manager', 'member'], order: 1 }
  },
  {
    path: 'users',
    name: 'UserManage',
    component: () => import('../views/User.vue'),
    meta: {
      title: '用户管理',
      icon: 'User',
      roles: ['admin', 'manager'],
      group: '权限与组织',
      groupIcon: 'Setting',
      order: 2
    }
  },
  {
    path: 'roles',
    name: 'RoleManage',
    component: () => import('../views/Role.vue'),
    meta: {
      title: '角色管理',
      icon: 'Avatar',
      roles: ['admin'],
      group: '权限与组织',
      groupIcon: 'Setting',
      order: 3
    }
  },
  {
    path: 'menus',
    name: 'MenuManage',
    component: () => import('../views/Menu.vue'),
    meta: {
      title: '菜单管理',
      icon: 'Menu',
      roles: ['admin'],
      group: '权限与组织',
      groupIcon: 'Setting',
      order: 4
    }
  },
  {
    path: 'chat',
    name: 'GroupChat',
    component: () => import('../views/Chat.vue'),
    meta: {
      title: '群聊',
      icon: 'ChatDotRound',
      roles: ['admin', 'manager', 'member'],
      group: '协作',
      groupIcon: 'ChatLineRound',
      order: 5
    }
  },
  {
    path: 'ai',
    name: 'AiAssistant',
    component: () => import('../views/AiChat.vue'),
    meta: {
      title: 'AI 助手',
      icon: 'MagicStick',
      roles: ['admin', 'manager', 'member'],
      group: '协作',
      groupIcon: 'ChatLineRound',
      order: 6
    }
  },
  {
    path: 'messages',
    name: 'MessageDemo',
    component: () => import('../views/Messages.vue'),
    meta: {
      title: '消息接口',
      icon: 'Promotion',
      roles: ['admin', 'manager', 'member'],
      group: '协作',
      groupIcon: 'ChatLineRound',
      order: 7
    }
  },
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', icon: 'Postcard', roles: ['admin', 'manager', 'member'], hidden: true }
  }
]

/** 按角色过滤后、排好序的可见菜单 */
export function buildMenus(roleCode) {
  const visible = layoutChildren
    .filter(route => !route.meta.hidden && route.meta.roles.includes(roleCode))
    .sort((a, b) => a.meta.order - b.meta.order)

  const groups = []
  const groupMap = {}

  visible.forEach(route => {
    const groupName = route.meta.group
    if (!groupName) return
    if (!groupMap[groupName]) {
      groupMap[groupName] = { name: groupName, icon: route.meta.groupIcon, items: [] }
      groups.push(groupMap[groupName])
    }
    groupMap[groupName].items.push(route)
  })

  return {
    singles: visible.filter(route => !route.meta.group),
    groups
  }
}
