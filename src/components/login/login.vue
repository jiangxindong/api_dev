<template>
  <div class="content">
    <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm">
      <el-form-item prop="userId">
        <el-input
          class="input"
          placeholder="请输入用户名"
          v-model="ruleForm.userId"
          autocomplete="off"
        ></el-input>
        <img src="/images/login/user.png" />
      </el-form-item>
      <el-form-item prop="pass">
        <el-input
          class="input"
          placeholder="请输入口令"
          type="password"
          v-model="ruleForm.pass"
          autocomplete="off"
        ></el-input>
        <img src="/images/login/password.png" />
      </el-form-item>
      <el-form-item>
        <el-button
          style="margin-bottom: 10px"
          :loading="loading"
          type="primary"
          @keyup.enter="autoLogin"
          class="button"
          @click="submitForm('ruleForm')"
          >账号登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Processor, PropsConfig, JApi } from "../common/services";
export default {
  data() {
    var checkUser = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("用户名不能为空"));
      }
      callback();
    };
    var validatePass = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入密码"));
      }
      callback();
    };
    return {
      popCount: 0,
      loading: false,
      ruleForm: {
        userId: "",
        pass: "",
      },
      rules: {
        userId: [{ validator: checkUser, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
      },
    };
  },
  methods: {
    autoLogin() {
      this.login();
    },
    login() {
      const loginData = {
        userId: this.ruleForm.userId,
        password: this.ruleForm.pass,
      };
      const url = `/default/org.gocom.components.coframe.auth.login.login.flow`;
      this.loading = true;
      JApi.post("org.gocom.components.coframe.auth.login.login.flow", {
        userId: this.ruleForm.userId,
        password: this.ruleForm.pass,
      }).then((res) => {
        if (res.statusCode === 2000) {
          window.localStorage.setItem("token", res.token);
          document.onkeydown = null;
          const url = `/default/com.cestc.commons.config.getServerAddress.biz.ext`;
          this.axios.post(url).then((res) => {
            if (res.code === 2000) {
              window.localStorage.setItem("wpsUrl", res.data);
              const next = window.localStorage.getItem("nextUrl");
              if (
                loginData.userId == "权限管理员" ||
                loginData.userId == "用户管理员" ||
                loginData.userId == "审计管理员"
              ) {
                const managerUrl = "/default/skins/itc/index.jsp";
                window.open(managerUrl, "_self");
              } else if (next) {
                Processor.getLoginUserInfo(this, next);
              } else {
                Processor.getLoginUserInfo(this, "/main/shouye-tongzhi");
              }
            }
          });
        } else if (res.statusCode === 4000) {
          console.log(res);
          debugger;
          this.popInfo("用户名密码不正确");
        }
        this.loading = false;
      });
      // this.axios.post(url, loginData).then((data) => {
      //   data = data.data;
      //   if (data == undefined || data.statusCode == undefined) {
      //     this.popInfo("服务器异常，无法登录");
      //   } else if (data.statusCode === 2000) {
      //     window.localStorage.setItem("token", data.token);
      //     document.onkeydown = null;
      //     const url = `/default/com.cestc.commons.config.getServerAddress.biz.ext`;
      //     this.axios.post(url).then((data) => {
      //       if (data.code === 2000) {
      //         window.localStorage.setItem("wpsUrl", data.data);
      //         const next = window.localStorage.getItem("nextUrl");
      //         if (
      //           loginData.userId == "权限管理员" ||
      //           loginData.userId == "用户管理员" ||
      //           loginData.userId == "审计管理员"
      //         ) {
      //           const managerUrl = "/default/skins/itc/index.jsp";
      //           window.open(managerUrl, "_self");
      //         } else if (next) {
      //           Processor.getLoginUserInfo(this, next);
      //         } else {
      //           Processor.getLoginUserInfo(this, "/main/shouye-tongzhi");
      //         }
      //       }
      //     });
      //   } else if (data.statusCode === 4000) {
      //     this.popInfo("用户名密码不正确");
      //   }
      //   this.loading = false;
      // });
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.login();
        } else {
          return false;
        }
      });
    },

    popInfo(val) {
      const _self = this;
      const h = this.$createElement;
      if (_self.popCount == 0) {
        _self.popCount++;
        _self.$notify.info({
          title: "消息",
          message: h("p", { style: "color: #2295EE;font-weight:900" }, val),
          position: "bottom-right",
          onClose: function () {
            _self.popCount--;
          },
        });
      }
    },
  },
  created() {
    const _self = this;
    document.onkeydown = function (ev) {
      const event = window.event || ev;
      const key = event.keyCode;
      if (key == 13) {
        _self.autoLogin();
      }
    };
  },
};
</script>

<style>
</style>