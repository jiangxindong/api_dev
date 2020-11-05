import ApiService from './api.service';
import Notify from './notify';
import Utils from './utils';
import Print from './print';

export default {
  getDataSource(self, types) {
    if (types[0] === "ITCF_COMMON_OPINION") {
      ApiService.getOpinion().then(data => {
        self.$set(self.dataSource, "ITCF_COMMON_OPINION", data.data);
        // self.dataSource["ITCF_COMMON_OPINION"] = data.data;
      })
    } else {
      types.forEach(dictTypeId => {
        ApiService.getDataSource(dictTypeId).then(data => {
          self.dataSource[dictTypeId] = data.out1 || [];
        });
      });
    }
  },
  initPersonInfo(self, name, org, tel) {
    ApiService.getPersonalInfo().then(data => {
      const { drafttel, userName, userOrg, draftdate, draftdept } = data;
      self.$set(self.params, name, userName);
      self.$set(self.params, org, userOrg);
      self.$set(self.params, tel, drafttel);
      self.$set(self.params, 'draftdate', draftdate);
      self.$set(self.params, 'draftdept', draftdept);
      self.$set(self.params, 'draftman', userName);
    });
  },
  initDocsignid(self) {
    self.$set(self.params, "docsignid", "CB-[" + self.params.docyear + "]-" + "001");
  },
  getFormData(self, needPreOpinions, activityDefID) {
    const success = data => {
      if (!data.exception) {
        self.params = Object.assign({}, self.params, data.entity);
        self.params.urgencydegree =
          self.params.urgencydegree === "null" ? "无" : self.params.urgencydegree;
        if (self.params.recvregister) {
          const arr = self.params.recvregister.split("-");
          self.params.dengji1 = arr[0];
          self.params.dengji2 = arr[1];
          self.params.dengji3 = arr[2];
          self.params.dengji4 = arr[3];
        }
        if (self.params.preprocessinstid) {
          const lcbdForm = self.$refs["lcbdForm"];
          // const uploadCom = lcbdForm.$refs["uploadDialog1"];
          // uploadCom&&uploadCom.getFileList(self.params.predoctype, self.params.preprocessinstid, "01");
          // const uploadCom2 = lcbdForm.$refs["uploadDialog2"];
          // uploadCom2&&uploadCom2.getFileList(self.params.predoctype, self.params.preprocessinstid, "02");
          // const uploadCom = lcbdForm.$refs["uploadDialog1"];
          // uploadCom&&uploadCom.getFileList(self.params.predoctype, self.params.preprocessinstid, "01");
          const uploadCom3 = lcbdForm.$refs["uploadDialog3"];
          uploadCom3 && uploadCom3.getFileList(self.params.predoctype, self.params.preprocessinstid, '02');
          if (needPreOpinions) {
            const lcbdForm = self.$refs["lcbdForm"];
            lcbdForm.getProcessInstOpinions(self.params.preprocessinstid, activityDefID);
          }
        }
      }
    };
    ApiService.getFormData(self.params.processinstid, self.config).then(success);
  },
  getUnProcessFormData(self) {
    const success = data => {
      if (!data.exception) {
        self.params = Object.assign({}, self.params, data.entity);
      }
    };
    ApiService.getUnProcessFormData(self.params.docid, self.config.entityName).then(success);
  },
  getFWMenu(self, processDefId, activityDefID, isFinish) {
    const getMenuData = () => {
      const success = data => {
        if (!data.exception) {
          //self.menuList = data.data.concat([{ menuId: 'printBd', menuName: '打印表单' }]);
          self.menuList = data.data;
          // 定时拉取菜单数据
          if (self.$route.name === 'main.fawen') {
            clearTimeout(self.freshHandler);
            self.freshHandler = setTimeout(() => getMenuData(), 2000 * 60);
          }
        }
      };
      ApiService.getFWMenu(processDefId, activityDefID || "startActivity", isFinish).then(success);
    };
    getMenuData();
  },
  getMethod(self) {
    const menuOfMethod = {
      save: self.save,
      submit: self.initSubmitStatus,
      viewProcess: self.showFlowChart,
      viewDoc: self.openWPS,
      editDoc: self.openWPS,
      delete: self.deleteForm,
      back2Inital: self.backtoWPS,
      spqConvert: self.showPrintModal,
      noteOFD: self.viewNoteOFD,
      "rollback_step": self.rollbackStep,
      "recall": self.callback,
      "fqdb": self.fqdb,
      "sendzb": self.showZBDialog,
      "jq": self.showJQDialog,
      printBd: () => Print('.form')
    };
    return menuOfMethod;
  },
  deleteForm(self) {
    self.$confirm('此操作将永久删除该流程, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const { deleteFormURL, entityName } = self.config;
      const success = data => {
        if (data.result === "1") {
          Notify.success("删除成功");
          self.$emit("closeTab");
          self.$router.push({ path: "/main/liucheng", query: { status: 1 } });
        } else {
          Notify.error("删除失败");
        }
      };
      ApiService.deleteForm(deleteFormURL, {
        processInstId: self.params.processinstid,
        entityName
      }).then(success);
    });
  },
  rollbackStep(self, item) {
    self.$confirm("确认要退回该公文?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const url = `/default/com.itc.oa.base.wf.pubmenu.menuback.rollBackToEX.biz.ext`;
        if (item._pageCond) delete item._pageCond;
        delete item.bizObject;
        delete item.query;
        const params = {
          workitem: item,
          items: "one_step"
        };
        const success = data => {
          if (!data.exception) {
            Notify.success("退回成功");
            self.$router.push({ path: "/main/liucheng", query: { status: 1 } });
          }
          self.$set(self.loadingParams, 'submit', false);
        };
        self.axios.post(url, params).then(success);
      })
      .catch(() => {
        self.$message({
          type: "info",
          message: "已取消退回"
        });
      });
  },
  async saveSubmit(self, activityDefID) {
    const {
      entityName,
      processDefName,
      saveFormURL,
      processDefID,
      doctype,
      uploadPath
    } = self.config;
    if (self && self.zzzData && self.zzzData.entity) {
      self.params.wftype = 'zzk'
    }
    const success = async function (data) {
      self.$set(self.loadingParams, 'save', false);
      const { result, processInstID, docid } = data;
      if (result === "1") {
        Notify.success("保存成功");
        self.params.processinstid = processInstID;
        self.params.docid = docid;
        if (self.$refs["lcbdForm"].submitUpload) {
          self.$refs["lcbdForm"].submitUpload(doctype, uploadPath); //调用子类的上传附件方法
        }
        const query = Object.assign({}, self.$route.query, {
          processinstid: processInstID,
          processDefID: processDefID,
          processDefId: processDefID,
          activityDefID
        });
        // if (self.params.listzs && self.params.listcs) {
        //   await self.saveFWModel(docid, self.params.listzs, self.params.listcs);
        // }
        // self.init(query, processDefID); // 保存成功后不刷新页面，重新初始化流程数据
        if (self && self.zzzData && self.zzzData.filepath && self.zzzData.pkid) {
          await self.saveZZZFile(self.zzzData.pkid, processInstID);
          await self.updateWF(self.zzzData.pkid, processInstID);
          delete query.zzzData;
          self.zzzData = null;
        }
        self.$router.replace({ path: self.$route.path, query });
        self.getFWMenu(self.$route.query, processDefID);
        // if(self.getFWMenu){
        //   self.getFWMenu(self.$route.query, processDefID); //获取发文菜单
        // }else{
        //   const getMenuData = () => {
        //     const success = data => {
        //       if (!data.exception) {
        //         self.menuList = data.data.concat([{ menuId: 'printBd', menuName: '打印表单' }]);
        //         // 定时拉取菜单数据
        //         if (self.$route.name === 'main.fawen') {
        //           clearTimeout(self.freshHandler);
        //           self.freshHandler = setTimeout(() => getMenuData(), 2000 * 60);
        //         }
        //       }
        //     };
        //     ApiService.getFWMenu(self.$route.query.processDefId, self.$route.query.activityDefID).then(success);
        //   };
        //   getMenuData();
        // }
      } else {
        Notify.error("提交失败");
      }
    };
    return ApiService.save(saveFormURL, {
      entity: self.params,
      entityName,
      processDefName
    }).then(success);
  },
  saveSubmitOnly(self, activityDefID) {
    const {
      entityName,
      processDefName,
      saveFormURL,
      processDefID,
      doctype,
      uploadPath
    } = self.config;
    const success = async function (data) {
      self.$set(self.loadingParams, 'save', false);
      const { result, processInstID, docid } = data;
      if (result === "1") {
        self.params.processinstid = processInstID;
        self.params.docid = docid;
        if (self.$refs["lcbdForm"].submitUpload) {
          self.$refs["lcbdForm"].submitUpload(doctype, uploadPath); //调用子类的上传附件方法
        }
      } else {
        Notify.error("保存失败");
      }
    };
    return ApiService.save(saveFormURL, {
      entity: self.params,
      entityName,
      processDefName
    }).then(success);
  },
  async save(self, activityDefID, docSignIdKey, configKey, docPrefix) {
    self.$set(self.loadingParams, 'save', true);
    //如果有发文编号并且第一次保存时，先获取发文编号
    if (docSignIdKey && !self.params[docSignIdKey]) {
      const data = await ApiService.getDocsignid(configKey)
      if (!data.exception) {
        self.params[docSignIdKey] = docPrefix + "-[" + self.params.docyear + "]-" + data.max;
        self.params.doccodeseq = data.max;
      }
    }
    return this.saveSubmit(self, activityDefID)
  },
  async saveOnly(self, activityDefID, docSignIdKey, configKey, docPrefix) {
    self.$set(self.loadingParams, 'save', true);
    //如果有发文编号并且第一次保存时，先获取发文编号
    if (docSignIdKey && !self.params[docSignIdKey]) {
      const data = await ApiService.getDocsignid(configKey)
      if (!data.exception) {
        self.params[docSignIdKey] = docPrefix + "-[" + self.params.docyear + "]-" + data.max;
        self.params.doccodeseq = data.max;
      }
    }
    return this.saveSubmitOnly(self, activityDefID)
  },
  submit(self, data) {
    const { submitParams, processConfigData, selectedActivityDefId } = data;
    // 判断是否结束环节，如果是，可以不用选择人员
    if (
      selectedActivityDefId !== "finishActivity" &&
      !submitParams.selectPartName
    ) {
      Notify.warning("请选择人员");
      return;
    }
    const { workitem, process } = processConfigData;
    self.$set(self.loadingParams, 'submit', true);
    const success = res => {
      if ((self.config.doctype == "nb_recvdoc" && (self.params.urgentlev == "1" || self.params.urgentlev == "2")) || self.config.doctype == "nb_senddoc") {
        const params = {
          content: `您有一个《${self.params.title}》待办，请尽快处理`,
          msgType: "text",
          processinstid: self.params.processinstid,
          userIdList: data.submitParams.selectPartName.split('|').join(',')
        }
        const url = `/com.cestc.nb.duban.biz.sendMsg.biz.ext`;
        self.axios.post(`/default/${url}`, params);
      }
      if (!res.exception) {
        Notify.success("提交成功");
        self.$router.push({ path: "/main/liucheng", query: { status: 2 } });
      }
      self.$set(self.loadingParams, 'submit', false);
    };
    ApiService.submit({
      workitem,
      process: { ...process, ...submitParams }
    }).then(success);
  },
  openWPS(self, onlyRead, flag) {
    const covert = self.menuList.findIndex(item => {
      return item.menuId === "convertOFD"
    });
    const stamp = self.menuList.findIndex(item => {
      return item.menuId === "stamp"
    });
    ApiService.isOFD(self.params.processinstid).then(data => {
      if (data.data) {
        if (!onlyRead) {
          Notify.warning("已转版，无法编辑");
          return;
        } else {
          const routeData = self.$router.resolve({
            path: '/WPS/ofd',
            query: {
              token: window.localStorage.getItem('token'),
              recordId: self.params.processinstid,
              stamp: stamp,
              flag: flag
            }
          });
          window.open(routeData.href, "_blank");
        }
      } else {
        Utils.openWPS(
          onlyRead,
          self.$router,
          self.$store.state,
          self.params,
          covert
        );
      }
    });
  },
  backtoWPS(id) {
    const params = {
      recordId: id
    };
    ApiService.backtoWPS(params).then(data => {
      if (data.code === 2000) {
        Notify.success("退回WPS成功");
      } else {
        Notify.warning("正文未转版");
      }
    });
  },
  viewNoteOFD(self) {
    ApiService.isSignOFD(self.params.processinstid).then(data => {
      if (data.data === false) {
        Notify.warning("签署页未转版");
      } else {
        const token = window.localStorage.getItem('token');
        const stamp = self.menuList.findIndex(item => {
          return item.menuId === "stamp"
        });
        const routeData = self.$router.resolve({
          path: '/WPS/ofd',
          query: {
            recordId: self.params.processinstid,
            sign: true,
            token: token,
            stamp: stamp
          }
        });
        window.open(routeData.href, "_blank");
      }
    });
  },
  getFormVisible(self, processDefID, activityDefID, isFinish) {
    ApiService.getFormVisible(processDefID, activityDefID || "startActivity", isFinish).then(
      data => {
        if (!data.exception && data.results) {
          data.results.forEach(item => {
            const { wfFieldID, state } = item;
            // state === '2' 表示该字段为不可编辑状态
            self.$set(self.disabledMap, wfFieldID.split('.')[1], state === "2");
          });
        }
      }
    );
  },
  checkWPS(self) {
    return new Promise((resolve, reject) => {
      self.$set(self.loadingParams, 'submit', true);
      ApiService.getWPSContent(self.params.processinstid).then(data => {
        if (data.data === false) {
          Notify.warning("请填写正文");
          self.$set(self.loadingParams, 'submit', false);
          return;
        }
        const convert = self.menuList.findIndex(item => {
          return item.menuId === "convertOFD"
        });
        if (convert !== -1) {
          ApiService.isOFD(self.params.processinstid).then(data => {
            if (data.data === false) {
              Notify.warning("请转版正文");
              reject();
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
        self.$set(self.loadingParams, 'submit', false);
      });
    })
  },
  exportExcel(params) {
    ApiService.exportExcel(params).then(data => {
      window.open(data.downloadFile);
    });
  },
  getMeetingRoom(self) {
    let meetingParams = {
      "criteria/_entity": "com.cestc.sjz.meeting.newdataset.SjzOaMeetingaddress",
      page: { begin: 0, length: 200 }
    }
    ApiService.getMeetingRoom(meetingParams).then(data => {
      if (!data.exceptions) {
        let dataList = data.datalist;
        self.meetingRoomList = dataList.map(item => {
          let room = {};
          room.id = item.docid;
          room.title = item.name;
          room.eventColor = "rgba(183,182,182,0.35)";
          return room;
        })
      }
    })
  },
  getEvents(self) {
    let eventParams = {
      // meetingdate: "2019-11-02"
      meetingdate: Utils.formatDateTime(new Date()).substring(0, 10)
    }
    ApiService.getEvents(eventParams).then(data => {
      if (!data.exceptions) {
        let dateList = data.dateList;
        self.eventList = dateList.map(item => {
          let event = {};
          event.resourceId = item.addressid;
          if (self.params && self.params.processinstid && self.params.processinstid == item.processinstid) {
            event.title = "当前会议";
          }
          event.start = item.meetingbgdate.split(' ')[0] + "T" + item.meetingbgdate.split(' ')[1] + "+00:00";
          event.end = item.meetingeddate.split(' ')[0] + "T" + item.meetingeddate.split(' ')[1] + "+00:00";
          event.processinstid = item.processinstid;
          return event;
        })
      }
    })
  },
  getReceivedDept(self, processinstid, pageIndex, size) {
    const querySignParams = {
      processinstid: processinstid,
      page: {
        length: size ? size : 10,
        begin: (pageIndex - 1) * 10
      }
    };
    ApiService.getReceivedDept(querySignParams).then(data => {
      if (!data.exception) {
        self.receivedDeptList = data.sigin;
        if (self.pages) {
          self.pages.count = data.total;
        }
        if (self.alreadySendDepts) {
          self.alreadySendDepts = data.sigin.map(item => {
            return item.receivedept;
          })
        }
      }
    });
    self.receivedDeptDialogVisible = true;
  },
  handleBackInside(self, data) {
    let neituiParams = {
      workitem: data,
      activityDefId: "OA_ZF_SQ",
      item: "firstAct"
    };
    const success = data => {
      if (!data.exception) {
        Notify.info("内退成功");
        self.submitDialogVisible = false;
        self.$router.push({ path: "/main/liucheng", query: { status: 1 } });
      }
    };
    return ApiService.handleBackInside(neituiParams).then(success);
  },
  getSendInfo(self, data) {
    const sendInfo = {
      docid: data,
      page: {
        begin: 0,
        length: 20
      }
    };
    ApiService.getSendInfo(sendInfo).then(data => {
      if (!data.exception && data.code != 5000) {
        const { qdlist } = data;
        self.gridData = [];
        self.primarysendlist = [];
        self.copysendlist = [];
        qdlist.map(item => {
          const { jsdwmc, jsdwid, jsfs, wjzt } = item;
          const obj = {
            jsdwmc,
            jsdwid,
            jsfs,
            wjzt
          };
          self.gridData.push(obj);
          if (item.wjzt === "zs") {
            self.primarysendlist.push(obj);
          } else {
            self.copysendlist.push(obj);
          }
        });
      } else {
        Notify.error("获取信息失败");
      }
    });
  },
  deleteBatch(self, params) {
    self.$confirm("确定删除选中信息？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const url = `/com.cestc.sjz.infosubmit.biz.deleteList.biz.ext`;
        self.axios.post(`/default/${url}`, params).then(resp => {
          if (resp.code === "2000") {
            Notify.success("删除成功");
            self.getDataList();
          }
        });
      })
      .catch(() => {
        self.$message({
          type: "info",
          message: "已取消删除"
        });
      });
  },
  // getRoleInfo(){
  //   ApiService.getRoleInfo().then(data => {
  //     if(!data.exceptions){
  //       return data.roleNames
  //     }
  //   });
  // },
  getLoginUserInfo(self, convertUrl) {
    ApiService.getPersonalInfo().then(async function (data) {
      self.$store.commit("setUserName", data.userName);
      self.$store.commit("setPersonalInfo", data);
      const dataRole = await ApiService.getRoleInfo();
      const messageFlag =
        dataRole.roleNames.indexOf("信息处") > -1 ||
        dataRole.roleNames.indexOf("县区直属单位信息员") > -1;
      window.localStorage.setItem("messageFlag", messageFlag);
      if (dataRole.roleNames.indexOf("信息处") > -1) {
        self.$router.push({ path: "/main/xin-xi-liu-lan" });
      } else if (dataRole.roleNames.indexOf("县区直属单位信息员") > -1) {
        self.$router.push({ path: "/main/yi-bao-xin-xi" });
      } else {
        // self.$router.push({ path: convertUrl });
        window.location.href = convertUrl;
      }
      window.localStorage.setItem("personalInfo", JSON.stringify(data));
      window.localStorage.setItem("roleNames", JSON.stringify(dataRole.roleNames));
    });
  }
}
