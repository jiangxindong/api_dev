module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8081,
    proxy: {
      '/default': {
        target: `http://${process.env.VUE_APP_BASE_URL}/`,
        ws: false,
        changeOrigin: true
      },
    }
  }
}