import request from './request'

// 登录/注册不带旧 Token，错误交给页面自己显示（课件：skipAuth / silentError）
export const loginApi = data =>
  request.post('/api/auth/login', data, { skipAuth: true, silentError: true })

export const registerApi = data =>
  request.post('/api/auth/register', data, { skipAuth: true, silentError: true })

export const getCurrentUser = () => request.get('/api/auth/me')

export const updateProfileApi = data => request.put('/api/auth/me', data)

export const logoutApi = () => request.post('/api/auth/logout')
