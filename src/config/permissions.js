/**
 * 功能权限树，用于角色管理页的勾选和前端权限码对照。
 * 真实项目里这棵树由后端菜单表返回，这里内置一份便于演示与联调。
 */
export const PERMISSION_TREE = [
  { id: 'dashboard:view', label: '仪表盘', children: [{ id: 'dashboard:chart', label: '查看图表' }] },
  {
    id: 'user:view',
    label: '用户管理',
    children: [
      { id: 'user:add', label: '新增用户' },
      { id: 'user:edit', label: '编辑用户' },
      { id: 'user:delete', label: '删除用户' },
      { id: 'user:batch', label: '批量删除' }
    ]
  },
  {
    id: 'system:view',
    label: '系统管理',
    children: [
      { id: 'role:view', label: '角色列表' },
      { id: 'role:manage', label: '角色维护' },
      { id: 'menu:view', label: '菜单查看' }
    ]
  },
  { id: 'chat:use', label: '群聊' },
  { id: 'ai:use', label: 'AI 助手' }
]

/** 全部权限码（扁平），用于“全选” */
export function flattenPermissionIds(nodes = PERMISSION_TREE) {
  return nodes.reduce((list, node) => {
    list.push(node.id)
    if (node.children) list.push(...flattenPermissionIds(node.children))
    return list
  }, [])
}
