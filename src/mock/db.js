import Mock from 'mockjs'
import { ROLE_PERMISSIONS } from '../utils/session'

const DB_KEY = 'work-admin-mock-db-v1'
const Random = Mock.Random

/** 课堂演示账号，登录页会直接提示 */
export const DEMO_ACCOUNTS = [
  { account: 'admin', passwd: '123456', name: '教学管理员', roleCode: 'admin' },
  { account: 'manager', passwd: '123456', name: '张管理', roleCode: 'manager' },
  { account: 'member', passwd: '123456', name: '李同学', roleCode: 'member' }
]

function seedRoles() {
  return [
    {
      id: 1,
      name: '超级管理员',
      code: 'admin',
      description: '拥有全部功能权限，可维护角色与菜单',
      permissions: ['*'],
      builtin: true
    },
    {
      id: 2,
      name: '管理员',
      code: 'manager',
      description: '可管理用户，不能维护角色与权限',
      permissions: ROLE_PERMISSIONS.manager.slice(),
      builtin: true
    },
    {
      id: 3,
      name: '普通用户',
      code: 'member',
      description: '只可查看仪表盘、群聊与 AI 助手',
      permissions: ROLE_PERMISSIONS.member.slice(),
      builtin: true
    }
  ]
}

/** 生成 n 天前的随机时刻，用于种子数据的创建时间 */
function daysAgo(n) {
  const date = new Date()
  date.setDate(date.getDate() - n)
  date.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0)
  const pad = v => String(v).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

function seedUsers() {
  const users = DEMO_ACCOUNTS.map((item, index) => ({
    id: index + 1,
    name: item.name,
    account: item.account,
    passwd: item.passwd,
    roleCode: item.roleCode,
    avatar: '',
    createTime: daysAgo(80 - index * 20)
  }))

  for (let i = 0; i < 25; i++) {
    users.push({
      id: users.length + 1,
      name: Random.cname(),
      account: `stu${String(2026001 + i)}`,
      passwd: '123456',
      roleCode: 'member',
      avatar: '',
      createTime: daysAgo(Math.floor(Math.random() * 30))
    })
  }

  return users
}

function seed() {
  const users = seedUsers()
  return {
    users,
    roles: seedRoles(),
    tokens: {},
    seq: { user: users.length, role: 3 }
  }
}

let db = null

export function getDb() {
  if (db) return db
  try {
    const raw = localStorage.getItem(DB_KEY)
    db = raw ? JSON.parse(raw) : seed()
  } catch {
    db = seed()
  }
  return db
}

export function saveDb() {
  if (!db) return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // 头像 dataURL 可能撑爆 localStorage 配额，此时仅保留内存数据，不阻断操作
  }
}

export function resetDb() {
  db = seed()
  saveDb()
  return db
}

export function nextId(key) {
  const data = getDb()
  data.seq[key] += 1
  return data.seq[key]
}

export function now() {
  const date = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}
