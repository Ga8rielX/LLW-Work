import { getDb, saveDb, nextId, now } from './db'

/**
 * 轻量 Mock 服务端。
 *
 * 与 MockJS 的 XHR 拦截相比，这里保留的是「HTTP 语义」：
 * 200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 都会原样返回，
 * 页面里的错误分支（409 账号重复、403 注册未开放、401 会话失效）才验证得到。
 */
const PAGE_SIZE = 20
const ALLOW_REGISTER = process.env.VUE_APP_ALLOW_REGISTER === 'true'

const routes = []
const on = (method, pattern, handler) => routes.push({ method, pattern, handler })

function compile(pattern) {
  const keys = []
  const source = pattern.replace(/:(\w+)/g, (_, key) => {
    keys.push(key)
    return '([^/]+)'
  })
  return { regex: new RegExp(`^${source}/?$`), keys }
}

function matchRoute(method, path) {
  for (const route of routes) {
    if (route.method !== method) continue
    const { regex, keys } = compile(route.pattern)
    const result = path.match(regex)
    if (!result) continue
    const params = {}
    keys.forEach((key, index) => {
      params[key] = decodeURIComponent(result[index + 1])
    })
    return { handler: route.handler, params }
  }
  return null
}

function publicUser(user) {
  const role = getDb().roles.find(item => item.code === user.roleCode)
  return {
    id: user.id,
    name: user.name,
    account: user.account,
    avatar: user.avatar || '',
    createTime: user.createTime,
    roleCode: user.roleCode,
    roleName: role ? role.name : user.roleCode,
    permissions: role ? role.permissions.slice() : []
  }
}

function createSession(user) {
  const db = getDb()
  const tokenValue = `mock-${user.id}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
  db.tokens[tokenValue] = user.id
  saveDb()
  return { tokenName: 'satoken', tokenValue, user: publicUser(user) }
}

function readToken(headers = {}) {
  if (!headers) return ''
  if (typeof headers.get === 'function') return headers.get('satoken') || ''
  return headers.satoken || headers.Satoken || ''
}

function currentUser(headers) {
  const token = readToken(headers)
  if (!token) return null
  const db = getDb()
  const id = db.tokens[token]
  return db.users.find(item => item.id === Number(id)) || null
}

const unauthorized = () => ({ status: 401, data: { message: '登录状态已失效，请重新登录' } })
const badRequest = message => ({ status: 400, data: { message } })

/* ------------------------------- 认证 ------------------------------- */

on('POST', '/api/auth/login', ({ body }) => {
  const account = String(body.account || '').trim()
  const passwd = String(body.passwd || '')
  if (!account || !passwd) return badRequest('账号和密码不能为空')

  const user = getDb().users.find(item => item.account === account)
  if (!user || user.passwd !== passwd) {
    return { status: 401, data: { message: '账号或密码错误' } }
  }
  return { status: 200, data: createSession(user) }
})

on('POST', '/api/auth/register', ({ body }) => {
  if (!ALLOW_REGISTER) {
    return { status: 403, data: { message: '当前环境未开放公开注册，请联系管理员开号' } }
  }
  const account = String(body.account || '').trim()
  const passwd = String(body.passwd || '')
  if (!account || !passwd) return badRequest('账号和密码不能为空')

  const db = getDb()
  if (db.users.some(item => item.account === account)) {
    return { status: 409, data: { message: '账号已存在' } }
  }
  const user = {
    id: nextId('user'),
    name: String(body.name || '').trim(),
    account,
    passwd,
    roleCode: 'member',
    avatar: '',
    createTime: now()
  }
  db.users.push(user)
  saveDb()
  return { status: 201, data: createSession(user) }
})

on('GET', '/api/auth/me', ({ headers }) => {
  const user = currentUser(headers)
  if (!user) return unauthorized()
  return { status: 200, data: publicUser(user) }
})

on('PUT', '/api/auth/me', ({ headers, body }) => {
  const user = currentUser(headers)
  if (!user) return unauthorized()
  if (typeof body.name === 'string') user.name = body.name.trim()
  if (typeof body.avatar === 'string') user.avatar = body.avatar
  saveDb()
  return { status: 200, data: publicUser(user) }
})

on('POST', '/api/auth/logout', ({ headers }) => {
  const token = readToken(headers)
  const db = getDb()
  if (token && db.tokens[token]) {
    delete db.tokens[token]
    saveDb()
  }
  return { status: 204, data: null }
})

/* ------------------------------- 用户 ------------------------------- */

on('GET', '/api/users', ({ query, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const page = Math.max(1, Number(query.page) || 1)
  const keyword = String(query.keyword || '').trim().toLowerCase()

  let list = getDb().users.slice().sort((a, b) => b.id - a.id)
  if (keyword) {
    list = list.filter(item =>
      `${item.name || ''} ${item.account}`.toLowerCase().includes(keyword)
    )
  }

  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const items = list
    .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    .map(publicUser)

  return {
    status: 200,
    data: { items, total, page: safePage, pageSize: PAGE_SIZE, totalPages }
  }
})

on('GET', '/api/users/:id', ({ params, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const user = getDb().users.find(item => item.id === Number(params.id))
  if (!user) return { status: 404, data: { message: '用户不存在' } }
  return { status: 200, data: publicUser(user) }
})

on('POST', '/api/users', ({ body, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const account = String(body.account || '').trim()
  if (!account) return badRequest('账号不能为空')

  const db = getDb()
  if (db.users.some(item => item.account === account)) {
    return { status: 409, data: { message: '账号已存在，请换一个' } }
  }
  const user = {
    id: nextId('user'),
    name: String(body.name || '').trim(),
    account,
    passwd: String(body.passwd || ''),
    roleCode: body.roleCode || 'member',
    avatar: body.avatar || '',
    createTime: now()
  }
  db.users.push(user)
  saveDb()
  return { status: 201, data: publicUser(user) }
})

on('PUT', '/api/users/:id', ({ params, body, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const db = getDb()
  const user = db.users.find(item => item.id === Number(params.id))
  if (!user) return { status: 404, data: { message: '用户不存在' } }

  const account = String(body.account || '').trim()
  if (account && db.users.some(item => item.account === account && item.id !== user.id)) {
    return { status: 409, data: { message: '账号已存在，请换一个' } }
  }

  if (typeof body.name === 'string') user.name = body.name.trim()
  if (account) user.account = account
  if (body.passwd) user.passwd = body.passwd
  if (body.roleCode) user.roleCode = body.roleCode
  if (typeof body.avatar === 'string') user.avatar = body.avatar

  saveDb()
  return { status: 200, data: publicUser(user) }
})

on('DELETE', '/api/users/:id', ({ params, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const db = getDb()
  const index = db.users.findIndex(item => item.id === Number(params.id))
  if (index === -1) return { status: 404, data: { message: '用户不存在' } }

  db.users.splice(index, 1)
  saveDb()
  return { status: 204, data: null }
})

/* ------------------------------- 角色 ------------------------------- */

function roleView(role) {
  const userCount = getDb().users.filter(item => item.roleCode === role.code).length
  return { ...role, userCount }
}

on('GET', '/api/roles', ({ headers }) => {
  if (!currentUser(headers)) return unauthorized()
  return { status: 200, data: getDb().roles.map(roleView) }
})

on('POST', '/api/roles', ({ body, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const code = String(body.code || '').trim()
  const name = String(body.name || '').trim()
  if (!code || !name) return badRequest('角色编码和名称不能为空')

  const db = getDb()
  if (db.roles.some(item => item.code === code)) {
    return { status: 409, data: { message: '角色编码已存在' } }
  }
  const role = {
    id: nextId('role'),
    name,
    code,
    description: String(body.description || ''),
    permissions: Array.isArray(body.permissions) ? body.permissions : [],
    builtin: false
  }
  db.roles.push(role)
  saveDb()
  return { status: 201, data: roleView(role) }
})

on('PUT', '/api/roles/:id', ({ params, body, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const role = getDb().roles.find(item => item.id === Number(params.id))
  if (!role) return { status: 404, data: { message: '角色不存在' } }

  if (typeof body.name === 'string' && body.name.trim()) role.name = body.name.trim()
  if (typeof body.description === 'string') role.description = body.description
  saveDb()
  return { status: 200, data: roleView(role) }
})

on('DELETE', '/api/roles/:id', ({ params, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const db = getDb()
  const role = db.roles.find(item => item.id === Number(params.id))
  if (!role) return { status: 404, data: { message: '角色不存在' } }
  if (role.builtin) return badRequest('内置角色不允许删除')
  if (db.users.some(item => item.roleCode === role.code)) {
    return badRequest('该角色下还有用户，无法删除')
  }
  db.roles = db.roles.filter(item => item.id !== role.id)
  saveDb()
  return { status: 204, data: null }
})

on('GET', '/api/roles/:id/permissions', ({ params, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const role = getDb().roles.find(item => item.id === Number(params.id))
  if (!role) return { status: 404, data: { message: '角色不存在' } }
  return { status: 200, data: { permissions: role.permissions } }
})

on('PUT', '/api/roles/:id/permissions', ({ params, body, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const role = getDb().roles.find(item => item.id === Number(params.id))
  if (!role) return { status: 404, data: { message: '角色不存在' } }
  if (!Array.isArray(body.permissions)) return badRequest('permissions 必须是数组')

  // 超级管理员固定拥有全部权限，避免误操作把自己锁在门外
  role.permissions = role.code === 'admin' ? ['*'] : body.permissions
  saveDb()
  return { status: 200, data: { permissions: role.permissions } }
})

/* ------------------------------- 消息接口 ------------------------------- */

// 课件「接口对接步骤」第 6 步：接收 JSON { message }，返回 text/plain 文本，只做回显
on('POST', '/api/messages', ({ body, headers }) => {
  if (!currentUser(headers)) return unauthorized()
  const message = String(body.message || '').trim()
  if (!message) return badRequest('消息内容不能为空')
  return { status: 200, data: `已接收到${message}` }
})

/* ------------------------------- 分发 ------------------------------- */

function parseQuery(url) {
  const index = url.indexOf('?')
  const query = {}
  if (index === -1) return query
  new URLSearchParams(url.slice(index + 1)).forEach((value, key) => {
    query[key] = value
  })
  return query
}

export default function mockServer(config) {
  return new Promise(resolve => {
    const delay = 120 + Math.floor(Math.random() * 180)
    setTimeout(() => {
      const method = String(config.method || 'get').toUpperCase()
      const url = config.url || ''
      const path = url.split('?')[0]
      const query = { ...parseQuery(url), ...(config.params || {}) }

      let body = {}
      if (config.data) {
        if (typeof config.data === 'string') {
          try {
            body = JSON.parse(config.data)
          } catch {
            body = {}
          }
        } else {
          body = config.data
        }
      }

      const matched = matchRoute(method, path)
      if (!matched) {
        resolve({ status: 404, data: { message: `接口不存在：${method} ${path}` } })
        return
      }

      try {
        const result = matched.handler({
          params: matched.params,
          query,
          body,
          headers: config.headers || {}
        })
        resolve(result || { status: 200, data: null })
      } catch (error) {
        resolve({ status: 500, data: { message: error.message || '服务端异常' } })
      }
    }, delay)
  })
}
