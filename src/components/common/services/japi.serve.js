import Vue from 'vue'
import Notify from './notify';

export default {

  /*
  **@_state:状态码
  **@_prefix:请求地址前缀 
  */
  _state: {
    SUCCESS_CODE: "2000",
    ERROR_CODE: "4000"
  },
  _prefix: {
    DEFAULT: `/default/`
  },
  post(url, params) {
    return new Promise((resolve, reject) => {
      url = `${this._prefix.DEFAULT}${url}`
      Vue.axios.post(url, params).then(res => {
        const data = res.data
        resolve(data)
        if (!data.code) {
          return res;
        }
        else if (data.code === this._state.SUCCESS_CODE) {
          return res;
        }
        else if (data.code === this._state.ERROR_CODE) {
          Notify.error("Request Error:" + res);
          return res;
        }
        else {
          return res;
        }
      }).catch(err => {
        Notify.error("Server Error!:" + res);
        return res;
      })
    })
  },
  get(url, params) {
    return new Promise((resolve, reject) => {
      url = `${this._prefix.DEFAULT}${url}`
      Vue.axios.get(url, params).then(res => {
        resolve(res.data)
        if (!res._code) {
          console.log(res)
          debugger
          return res;
        }
        else if (res._code === _state.SUCCESS_CODE) {
          return res;
        } else {
          Notify.error("Server ERROR!" + res._code);
        }
      }).catch(err => {
        Notify.error("Server ERROR!" + res);
      })
    })
  }
}