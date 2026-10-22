import request from './request'

// 课件约定：后端每页固定 20 条，页码从 1 开始，只发送 page 与 keyword
export const getUserList = (page = 1, keyword = '') =>
  request.get('/api/users', { params: { page, keyword } })

export const getUser = id => request.get(`/api/users/${id}`)

export const addUser = data => request.post('/api/users', data)

export const editUser = (id, data) => request.put(`/api/users/${id}`, data)

export const deleteUser = id => request.delete(`/api/users/${id}`)

/**
 * 批量删除：真实后端只提供单条 DELETE，因此这里串行调用。
 * 返回成功的 id 列表，失败的在 catch 里由调用方汇总提示。
 */
export async function batchDeleteUser(ids = []) {
  const deleted = []
  for (const id of ids) {
    await deleteUser(id)
    deleted.push(id)
  }
  return deleted
}
