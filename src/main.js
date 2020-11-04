import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(axios)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
