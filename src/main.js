import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import Qs from 'qs'
import Vuex from 'vuex'
import contentmenu from "v-contextmenu";

Vue.config.productionTip = false
Vue.use(contentmenu);
Vue.use(Vuex)
Vue.use(VueAxios, axios)
Vue.use(ElementUI)
// axios请求头修改
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
// 拦截器
axios.interceptors.request.use(config => {
  config.timeout = 5 * 60 * 1000; // 5分钟
  const functionCode = localStorage.getItem('functionCode');
  if (functionCode != undefined && functionCode != null && functionCode != "undefined") {
    config.headers['menu-function-code'] = functionCode;
  } else {
    config.headers['menu-function-code'] && delete config.headers['menu-function-code'];
  }

  if (config.url.includes('auth.login.login.flow')) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    config.data = Qs.stringify(config.data);
  }
  return config;
}, error => Promise.reject(error));
axios.interceptors.response.use(response => {
  const { data } = response;
  if (data.exception) {
    const { code, message } = data.exception;
    if (code === '12101001' || code === "14101050") {
      Notification.closeAll();
      Notification({
        title: '提示信息',
        message: '登陆信息失效，请重新登陆',
        type: 'warning',
        position: 'bottom-right'
      });
      if (!window.location.href.includes('/login')) {
        window.localStorage.setItem('nextUrl', window.location.href);
      }
      router.push({ path: '/login' });
    } else {
      // Notification({
      //   title: '服务器异常',
      //   message,
      //   type: 'error',
      //   position: 'bottom-right'
      // });
    }
  }
  return data;
}, error => {
  if (error) {
    if (error.response) {
      switch (error.response.status) {
        case 500:
          router.push({ path: '/login' });
          if (!navigator.onLine) {
            Notification({
              title: '网络未连接',
              message: "请检查重试",
              type: 'error',
              position: 'bottom-right'
            });
          } else {
            Notification({
              title: '服务器异常',
              message: "请联系系统管理员",
              type: 'error',
              position: 'bottom-right'
            });
          }

        //...
      }
    }
    if (error.code == 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
      // router.push({ path: '/login' });
      Message.error({
        message: '服务器请求超时，检查网络状态。',
        type: 'error'
      });
    }
  }
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
}).$mount('#app')
