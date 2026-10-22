import request from './request'

/**
 * 课件里的消息接口：POST /api/messages
 * 发送 JSON，响应是 text/plain 纯文本，因此显式设置 responseType: 'text'。
 */
export const sendMessage = message =>
  request.post('/api/messages', { message }, {
    responseType: 'text',
    headers: { Accept: 'text/plain' }
  })
