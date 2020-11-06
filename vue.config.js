module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  lintOnSave: false,
  devServer: {
    port: 8081,
    proxy: {
      '/re': {
        target: `http://${process.env.VUE_APP_BASE_URL_TWO}/`,
        ws: false,
        changeOrigin: true
      },
      '/default': {
        target: `http://${process.env.VUE_APP_BASE_URL}/`,
        ws: false,
        changeOrigin: true
      },
      '/api': {
        target: `http://${process.env.VUE_APP_ZZZ_URL}/`,
        ws: false,
        changeOrigin: true
      },
      '/upload': {
        target: `http://${process.env.VUE_APP_BASE_URL}/`,
        ws: false,
        changeOrigin: true
      },
      '/authPlatform': {
        target: 'http://ak-sp.com:88',
        ws: false,
        changeOrigin: true
      }
    }
  }
}