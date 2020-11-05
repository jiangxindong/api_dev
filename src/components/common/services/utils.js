import notify from './notify';
import {format} from "date-fns";
export default {
    // 根据表单配置检查是否有必填项未填
    checkFormValidate(params, config) {
        for (let i = 0; i < config.length; i++) {
            const { key, required, label,type } = config[i];
            if (required) {
                if(key==='title'&&params[key]){
                    params[key] = params[key].replace(/(^\s*)|(\s*$)/g, "");
                }
                const isError = (Array.isArray(params[key]) && !params[key].length) || !params[key];
                if (isError&&type ==='select') {
                    notify.warning(`请选择[${label}]`);
                    return false;
                }else if (isError) {
                    notify.warning(`请填写[${label}]`);
                    return false;
                }
            }
        }
        return true;
    },
    // 打开WPS函数
    openWPS(onlyRead, router, state, params, covert) {
        const { userName } = state;
        // const token = window.localStorage.getItem('token');
        const ua = navigator.userAgent.toLocaleLowerCase();
        const name = ua.indexOf("linux") > -1 ? "wps" : 'wps-win';
        let routeData = {};
        if(params.rootid && !onlyRead) {
            routeData = router.resolve({
                name,
                query: {
                    onlyRead,
                    userName,
                    // token,
                    processinstid: params.processinstid,
                    rootid: params.rootid,
                    covert,
                    secretlev: params.secretlev,
                    copysend: params.copysend,
                    docsignid: params.docsignid,
                    docdept: params.docdept,
                    draftdate: params&&params.draftdate&&params.draftdate.split(" ")[0],
                    primarysend: params.primarysend
                }
            });
        }else {
            routeData = router.resolve({
                name,
                query: {
                    onlyRead,
                    userName,
                    // token,
                    processinstid: params.processinstid,
                    rootid: params.rootid,
                    covert
                }
            });
        }
        window.open(routeData.href, "_blank");
    },
    // 深拷贝对象（不包括函数）
    copy(data) {
        return typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data;
    },
    // 处理流程列表数据（查看或者起草）
    parseProcessData(data,status) {
        return data.map(item => {
            const {
                processDefID,
                bizObject,
                currentState,
                actionURL,
                actionUrl,
                workItemID
            } = item;
            item.path = actionURL||actionUrl;
            if (currentState !== 10 && currentState !== 4 ) {
                // item.path += "-chakan";
                item.isFinish = "2";
            } else {
                item.isFinish = "1";
            }
            const result = { ...item, ...bizObject };
            const {  processinstid, processInstID, activityDefID, isFinish,processDefName} = result;
            result.query = { processinstid:processinstid||processInstID, activityDefID, processDefID, isFinish, workitemid: workItemID ,processDefName,status};
            return result;
        });
    },
    parseProcessData2(data,status) {
        return data.map(item => {
            const {
                processDefID,
                actionUrl,
                actionURL,
            } = item;
            item.path = actionURL||actionUrl;
            item.isFinish = "2";
            const result = { ...item };
            const { processinstid, processInstID, isFinish,processDefName} = result;
            result.query = { processinstid:processinstid||processInstID, activityDefID:'finishActivity', processDefID, isFinish, workitemid: "1" ,processDefName,status};
            return result;
        });
    },
    //时间格式化
    formatDateTime(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h=h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var second=date.getSeconds();
        second=second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
    },
    //规范后端传过来的日期格式
    formatTime(time) {
        if(time == null || time == '') return '';
        return format(new Date(time), "yyyy-MM-dd HH:mm:ss");
    },
    formatDate(time) {
        if(time == null || time == '') return '';
        return format(new Date(time), "yyyy-MM-dd");
    },
    getRequest(urlStr) {
        if (typeof urlStr == "undefined") {
            var url = decodeURI(location.search); //获取url中"?"符后的字符串
        } else {
            var url = "?" + urlStr.split("?")[1];
        }
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            const strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    },
    needRequestOther(){
        const host = window.location.host;
        return false;
        // if(this.needCheckHost()){
        //     return this.getRequest().status == "3";
        // }else{
        //     return false;
        // }
    },
    needCheckHost(){
        const host = window.location.host;
        if(host=='10.68.142.82'||host=='172.16.86.91'||host.startsWith('localhost')){
        //if(host=='10.68.142.82'||host=='172.16.86.91'){
            return false;
        }else{
            return false;
        }
    },
    replaceOtherServe(str){
        return str.replace('/default/','/re/');
    }
}
