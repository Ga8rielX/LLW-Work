const { defineConfig } = require('@vue/cli-service')

// 课件统一使用 8081 端口（真实后端允许该开发来源）
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  productionSourceMap: false,
  devServer: {
    port: 8081,
    // 接入本地后端时才需要代理；当前 Mock 模式与直连云端都不经过代理
    // proxy: {
    //   '/api': { target: 'http://localhost:3000', changeOrigin: true }
    // }
  }
})
