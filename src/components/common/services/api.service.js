import Vue from 'vue';
import utils from './utils';
export default {
    checkTitle(title) {
        const url = `/default/com.cestc.sjz.senddoc.biz.CheckTitle.biz.ext`;
        return Vue.axios.post(url, { title });
    },
    getDataSource(dictTypeId) {
        const url = `/default/com.itc.oa.base.wf.fundation.dictUtil.getDictInfoByType.biz.ext`;
        return Vue.axios.post(url, { dictTypeId });
    },
    save(url, params) {
        return Vue.axios.post(`/default/${url}`, params);
    },
    submit(data) {
        const url = `/default/com.itc.oa.base.wf.fundation.wf.submitWI.biz.ext`;
        return Vue.axios.post(url, data);
    },
    getConfig(key) {
         const url =`/default/com.cestc.nb.${key}.biz.paramConfig.biz.ext`
       // const url = `/default/com.cestc.sjz.${key}.biz.paramConfig.biz.ext`;
        return Vue.axios.post(url, {})
    },
    getProcess(processInstID) {
        const url = `/default/com.itc.oa.wf.common.bizCommon.queryWorkitemIDA.biz.ext`;
        return new Promise(resolve => {
            this.getPersonalInfo().then(data => {
                Vue.axios.post(url, { processInstID, participant: data.userID }).then(data => {
                    if (!data.exception) {
                        const url = `/default/com.itc.oa.base.wf.fundation.wf.queryWFWorkitem.biz.ext`;
                        Vue.axios.post(url, { workItemId: data.workItemID }).then(data => {
                            if (!data.exception) {
                                const url = `/default/com.itc.oa.base.wf.fundation.wf.publicSubmit.biz.ext`;
                                Vue.axios.post(url, { ...data, process: {} }).then(data => {
                                    resolve(data);
                                });
                            }
                        });
                    }
                });
            });
        });
    },
    getActPerson(activityDefId, { process, workitem }) {
        let url = `com.itc.oa.base.wf.fundation.wf.getActivityUserByWfConfig.biz.ext`;
        if (process.huiqian === "1") {
            url = `com.itc.oa.base.wf.fundation.wf.getActivityUserByHuiqian.biz.ext`;
        } else if (process.PreviousActivitie === activityDefId) {
            url = `com.itc.oa.base.wf.fundation.wf.getActivityUserByQianqu.biz.ext`;
        }
        return Vue.axios.post(`/default/${url}`, {
            workitem,
            activityDefId
        });
    },
    getActPerson2(activityDefId, { process, workitem }) {
        let url = `com.cestc.nb.common.wf.queryTwoUserList.biz.ext`;
        return Vue.axios.post(`/default/${url}`, {
            "roleNameA": "局领导",
            "roleNameB": "处室领导"
          });
    },
    getProcessInstOpinions(processInstId, activityDefID) {
        let url = `/default/com.itc.oa.base.wf.fundation.wf.queryProcessInstOpinion.biz.ext.biz.ext`;
        // if(utils.needRequestOther()){
        //     url = utils.replaceOtherServe(url)
        // }
        return Vue.axios.post(url, { processInstId, activityDefID })
    },
    loadOrgNode(orgid) {
        const url = `/default/org.gocom.components.coframe.participantselect.deptselect.deptList.biz.ext`;
        // const url=`com.itc.oa.base.wf.fundation.wf.queryOrgRelationXX.biz.ext`
        return Vue.axios.post(url, { orgid });
    },
    // detail 为true，则是获取人员详细信息
    // detail 为false，只获取姓名，id
    getPersonList(orgid, detail = false) {
        const url = !detail ? `/default/com.itc.oa.base.wf.fundation.wf.getUserByOrg.biz.ext`
            : `/default/com.itc.oa.base.wf.fundation.wf.getUserByOrgFull.biz.ext`;
        return Vue.axios.post(url, { orgid })
    },
    getZBPersonList() {
        const url = `/default/com.cestc.nb.common.manage.getUsers.biz.ext`;
        return Vue.axios.post(url, {})
    },
    // 根据姓名模糊搜索人员
    getPersonListFuzzy(params) {
        const url = `/default/com.itc.oa.base.wf.fundation.wf.queryAllUserFuzzy.biz.ext`;
        return Vue.axios.post(url, params);
    },
    getPersonDetailInfo(userId) {
        const url = `/default/com.itc.oa.base.wf.fundation.wf.getUsersInfo.biz.ext`;
        return Vue.axios.post(url, { userId });
    },
    getFormVisible(processDefID, activityDefID, isFinish) {
        const params = {
            isFinish: isFinish || "1",
            workitem: {
                processDefID,
                activityDefID
            }
        };
        let url = `/default/com.itc.oa.base.wf.pubmenu.WfPubFieldctrl.queryFieldByProcess.biz.ext`;
        // if(utils.needRequestOther()){
        //     url = utils.replaceOtherServe(url)
        // }
        return Vue.axios.post(url, params);
    },
    getFormData(processInstID, config) {
        const { queryFormURL, entityName } = config;
        let url = `/default/${queryFormURL}`;
        if(utils.needRequestOther()){
            url = utils.replaceOtherServe(url)
        }
        return Vue.axios.post(url, { processInstID, entityName });
    },
    getFileList(doctype, docid) {
        let url = `/default/com.itc.oa.base.fundation.subFile.query.biz.ext`;
        if(utils.needRequestOther()){
            url = utils.replaceOtherServe(url)
        }
        return Vue.axios.post(url, { doctype, docid });
    },
    removeFile(fileId) {
        const url = `/default/com.itc.oa.base.fundation.subFile.delete.biz.ext`;
        return Vue.axios.post(url, { fileId });
    },
    deleteForm(url, data) {
        return Vue.axios.post(`/default/${url}`, data);
    },
    //获取分文菜单
    getFWMenu(processDefId, activityDefId, isFinish) {
        let url = `/default/com.itc.oa.base.wf.config.activitymgr.getActivityWfMenu.biz.ext`;
        // if(utils.needRequestOther()){
        //     url = utils.replaceOtherServe(url)
        // }
        return Vue.axios.post(url, { processDefId, activityDefId, isFinish: isFinish || '1' });
    },
    getPersonalInfo() {
        const url = `/default/com.itc.oa.base.wf.fundation.wf.getUserInfo.biz.ext`;
        return Vue.axios.post(url, {});
    },
    getProcessList(begin) {
        const url = `/default/com.cestc.sjz.senddoc.biz.queryConfirmSecret.biz.ext`
        let data = {
            "page": { "begin": begin, "length": 10 }
        }
        return Vue.axios.post(url, data);
    },
    getEntityName() {
        const url = `/default/com.cestc.sjz.confirmSecret.biz.paramConfig.biz.ext`;
        return Vue.axios.post(url);
    },
    getWPSContent(processinstid) {
        const url = `/default/com.itc.oa.base.wps.editDoc.hasDoc.biz.ext`;
        const data = {
            "recordId": processinstid
        };
        return Vue.axios.post(url, data);
    },
    getDocsignid(configKey) {
        const url = `/default/com.cestc.sjz.` + configKey + `.biz.getMaxNum.biz.ext`;
        return Vue.axios.post(url);
    },
    queryCollectStatus(processinstid) {
        const url = `/default/com.cestc.sjz.common.biz.queryCollectFlag.biz.ext`;
        return Vue.axios.post(url, { processinstid });
    },
    saveYZ(entity) {
        const params = {
            "sjzoasealregist": entity
        }
        const url = `/default/com.cestc.sjz.sealregist.sjzoasealregistbiz.addSjzOaSealregist.biz.ext`;
        return Vue.axios.post(url, params);
    },
    updateYZ(entity) {
        const params = {
            "sjzoasealregist": entity
        }
        const url = `/default/com.cestc.sjz.sealregist.sjzoasealregistbiz.updateSjzOaSealregist.biz.ext`;
        return Vue.axios.post(url, params);
    },
    deleteYZ(entity) {
        let deleteItems = [];
        deleteItems.push(entity);
        //删除操作方法
        const deleteParam = {
            "sjzoasealregists": deleteItems
        };
        const url = `/default/com.cestc.sjz.sealregist.sjzoasealregistbiz.deleteSjzOaSealregists.biz.ext`;
        return Vue.axios.post(url, deleteParam);
    },
    saveUnProcessForm(params) {
        const url = `/default/com.cestc.sjz.common.bizUnProcess.saveForm.biz.ext`;
        return Vue.axios
            .post(url, params);
    },
    getUnProcessList(params, isDraft = false) {
        const url = `/default/com.cestc.sjz.common.bizUnProcess.queryList${isDraft ? 'Draft' : ''}.biz.ext`;
        return Vue.axios.post(url, params);
    },
    // 草稿箱
    getUnProcessFormData(docid, entityName) {
        const url = `/default/com.cestc.sjz.common.bizUnProcess.queryForm.biz.ext`;
        return Vue.axios.post(url, { docid, entityName });
    },
    submitMessage(data) {
        const url = `/default/com.cestc.sjz.report.sjzoareportbiz.sendReport.biz.ext`;
        console.log(data);
        const { docid, receivers, draftman, ifdept } = data;
        return Vue.axios.post(url, { docid, receivers, draftman, ifdept });
    },
    getGroupList(data) {
        const url = `/default/com.cestc.sjz.common.myGroup.queryMyGroupList.biz.ext`;
        return Vue.axios.post(url, data);
    },
    createGroup(data) {
        const url = `/default/com.cestc.sjz.common.myGroup.addMyGroup.biz.ext`;
        return Vue.axios.post(url, data);
    },
    editGroup(data) {
        const url = `/default/com.cestc.sjz.common.myGroup.updateMyGroup.biz.ext`;
        return Vue.axios.post(url, data);
    },
    chooseGroup(data) {
        const url = `/default/com.cestc.sjz.common.myGroup.queryForm.biz.ext`;
        return Vue.axios.post(url, data);
    },
    editUnitCate(data) {
        const url = `/default/com.itc.oa.officialDoc.wf.sendDoc.sendMgr.deptCategoryForSendDoc.saveDeptCatoMenu.biz.ext`;
        return Vue.axios.post(url, data);
    },
    backtoWPS(data) {
        const url = `/default/com.itc.oa.base.wps.ofd.reject.biz.ext`;
        return Vue.axios.post(url, data);
    },
    isOFD(data) {
        const url = `/default/com.itc.oa.base.wps.ofd.isConvert.biz.ext`;
        const params = {
            recordId: data
        };
        return Vue.axios.post(url, params);
    },
    isSignOFD(data) {
        const url = `/default/com.itc.oa.base.wps.ofd.hasSign.biz.ext`;
        const params = {
            recordId: data
        };
        return Vue.axios.post(url, params);
    },
    messageIsRead(rdocid) {
        const url = `/default/com.cestc.sjz.report.biz.readReport.biz.ext`;
        const params = {
            rdocid: rdocid
        };
        return Vue.axios.post(url, params);
    },
    exportExcel(params) {
        const url = `/default/com.cestc.sjz.excel.excel.exportExcel.biz.ext`;
        return Vue.axios.post(url, params);
    },
    getMeetingRoom(data) {
        const url = `/default/com.cestc.sjz.common.bizUnProcess.queryList.biz.ext`;
        return Vue.axios.post(url, data);
    },
    getEvents(data) {
        const url = `/default/com.cestc.sjz.meeting.address.queryList.biz.ext`;
        return Vue.axios.post(url, data);
    },
    sendDoc(data) {
        const url = `/default/com.cestc.sjz.senddoc.biz.senddocToReceivedoc.biz.ext`;
        return Vue.axios.post(url, data);
    },
    withDraw(data) {
        const url = `/default/com.cestc.sjz.senddoc.recall.updateByTemplate.biz.ext`;
        return Vue.axios.post(url, data);
    },
    getReceivedDept(data) {
        const url = `/default/default/com.cestc.sjz.senddoc.biz.querySignIn.biz.ext`;
        return Vue.axios.post(url, data);
    },
    getSwList(data) {
        const url = `/default/com.cestc.sjz.receiveDoc.biz.queryFwList.biz.ext`;
        return Vue.axios.post(url, data);
    },
    handleBackInside(data) {
        const url = `/default/com.itc.oa.base.wf.pubmenu.menuback.rollBackToEX.biz.ext`;
        return Vue.axios.post(url, data);
    },
    saveFWModel(docid, listzs, listcs) {
        const url = `/default/com.cestc.sjz.sendTableModel.fwqd.saveQDLsit.biz.ext`;
        return Vue.axios.post(url, { docid, listzs, listcs });
    },
    getSendInfo(data) {
        const url = `/default/com.cestc.sjz.sendTableModel.fwqd.queryList.biz.ext`;
        return Vue.axios.post(url, data);
    },
    addNotify(data){
        const url = `/default/com.cestc.sjz.common.read.addReadDataRportII.biz.ext`;
        return Vue.axios.post(url, data);
    },
    getRoleInfo(){
        const url = `/default/com.cestc.sjz.common.biz.queryRoleList.biz.ext`;
        return Vue.axios.post(url, {});
    },
    getOpinion() {
        const url = `/default/com.itc.oa.base.wf.fundation.itcopinion.empOpinion.biz.ext`;
        return Vue.axios.post(url, {});
    }
}
