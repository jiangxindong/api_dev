import Vue from 'vue'
import Notify from './notify';

export default {
  _request(_method, _url, _params) {
    const _state = {
      SUCCESS_CODE: "2000",
      ERROR_CODE: "400"
    };
    const _prefix = {
      DEFAULT: `/default/`
    }
    Vue.axios({
      url: `${_prefix.DEFAULT}${_url}`,
      method: _method,
      params: _params,
    }).then(rsp => {
      if (rsp.code === _state.SUCCESS_CODE) {
        return rsp;
      } else {
        Notify.error("ERROR!WRONG RESPONSE!" + rsp);
      }
    }).catch(rsp => {
      Notify.error("ERROR!WRONG RESPONSE!" + rsp);
    });
  }
}
