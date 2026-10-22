import request from './request'

export const getRoleList = () => request.get('/api/roles')

export const addRole = data => request.post('/api/roles', data)

export const editRole = (id, data) => request.put(`/api/roles/${id}`, data)

export const deleteRole = id => request.delete(`/api/roles/${id}`)

export const getRolePermissions = id => request.get(`/api/roles/${id}/permissions`)

export const saveRolePermissions = (id, permissions) =>
  request.put(`/api/roles/${id}/permissions`, { permissions })
