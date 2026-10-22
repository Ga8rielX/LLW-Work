/**
 * 角色与权限的归一化处理。
 *
 * 课件里的真实后端（118.25.25.164:8080）只返回 tokenValue 和 user{id,name,account}，
 * 没有角色和权限字段；后续升级版后端才会返回 roleCode / permissions。
 * 这里统一兜底：缺少角色信息时按 admin 处理，保证真实后端下页面依然可用。
 */

export const ROLE_LABELS = {
  admin: '超级管理员',
  manager: '管理员',
  member: '普通用户'
}

// 前端内置的角色权限矩阵，仅在服务端未返回 permissions 时使用
export const ROLE_PERMISSIONS = {
  admin: ['*'],
  manager: ['user:view', 'user:add', 'user:edit', 'user:delete', 'user:batch'],
  member: []
}

export function normalizeUser(raw = {}) {
  const roleCode = raw.roleCode || raw.role || 'admin'
  const permissions = Array.isArray(raw.permissions) && raw.permissions.length
    ? raw.permissions
    : ROLE_PERMISSIONS[roleCode] || []

  return {
    id: raw.id,
    name: raw.name || '',
    account: raw.account || '',
    avatar: raw.avatar || '',
    createTime: raw.createTime || '',
    roleCode,
    roleName: raw.roleName || ROLE_LABELS[roleCode] || roleCode,
    permissions
  }
}

/** 把登录/注册接口的返回值转成 { tokenValue, user } 结构 */
export function normalizeSession(result = {}) {
  return {
    tokenValue: result.tokenValue || result.token || '',
    user: normalizeUser(result.user || {})
  }
}

/** 判断是否拥有某个权限，'*' 代表全部权限 */
export function hasPermission(permissions = [], code) {
  if (!code) return true
  if (permissions.includes('*')) return true
  return permissions.includes(code)
}
