import {handleActions} from 'redux-actions'
import {ADDPERSON,handleSelectData} from '../types/counter'


const equipInfo=getStaticData();
//   处理本地静态数据，保存到全部变量中
 function getStaticData(){
  let data = [], dataList = [];
  let targetObj={};
  // faultType:故障类型
  // hardwareType:硬件类型
  //  faultPhenomenon:故障现象

  ['faultType', 'hardwareType', 'faultPhenomenon', 'faultCause', 'treatmentMeasure', 'remark'].forEach(function (type) {
    switch (type) {
      case 'faultType':
        dataList = []
        data = ['SIM卡', '程序', '参数', '网络', '线路', '硬件']
        data.forEach(function (item, index) {
          let obj = {}
          obj.name = item
          obj.index = index
          obj.selected = false
          dataList.push(obj)
          obj = null
        })
        targetObj.faultType = dataList
        break
      case 'hardwareType':
        dataList = []
        data = ['自定义', '主板', '刷卡线', '喇叭', '语音芯片', '功放板', 'GPRS模块', '天线帽', '显示屏', '话柄', '键盘', '挡板', '锁芯', '挂叉', '电源']
        data.forEach(function (item, index) {
          let obj = {}
          obj.name = item
          obj.index = index
          obj.selected = false
          dataList.push(obj)
          obj = null
        })
        targetObj.hardwareType = dataList
        break
      case 'faultPhenomenon':
        dataList = []
        data = ['自定义', '设备掉线', '黑屏', '白屏', '花屏', '刷卡无声音', '程序版本低', '通话无声音', '按键失灵', '刷卡无反应', '刷卡距离近', '锁打不开', '摘机无反应', '参数错误', '死机']
        data.forEach(function (item, index) {
          let obj = {}
          obj.name = item
          obj.index = index
          obj.selected = false
          dataList.push(obj)
          obj = null
        })
        targetObj.faultPhenomenon = dataList
        break
      case 'faultCause':
        dataList = []
        data = ['自定义', 'SIM卡不正常', '电源坏', '线路无电', '显示屏坏', '喇叭坏', '话柄坏', '远程升级失败', '功放板坏', '语音芯片坏', '刷卡板坏', 'GPRS模块问题', '天线帽损坏', '键盘坏', '锁芯坏', '挂叉坏', '蜂鸣器坏', '程序问题', '主板坏', '人为损坏']
        data.forEach(function (item, index) {
          let obj = {}
          obj.name = item
          obj.index = index
          obj.selected = false
          dataList.push(obj)
          obj = null
        })
        targetObj.faultCause = dataList
        break
      case 'treatmentMeasure':
        dataList = []
        data = ['自定义', '走部门协作', '更换主板', '更换刷卡板', '更换喇叭', '更换语音芯片', '更换功放板', '更换GPRS模块', '更换天线帽', '更换显示屏', '更换话柄', '更换键盘', '更换挡板', '更换锁芯', '更换挂叉', '更换电源', '升级新程序', '修改参数', '更换蜂鸣器', '重写程序']
        data.forEach(function (item, index) {
          let obj = {}
          obj.name = item
          obj.index = index
          obj.selected = false
          dataList.push(obj)
          obj = null
        })
        targetObj[`${type}`] = dataList
        break
      case 'remark':
        dataList = []
        data = ['自定义', 'SIM卡不正常', '2天线', '3天线', '4天线', '定时器', '固定支架', '移动支架', '地埋', '无SIM卡', '线路无电', '网络不稳定', '设备丢失', '设备停用']
        data.forEach(function (item, index) {
          let obj = {}
          obj.name = item
          obj.index = index
          obj.selected = false
          dataList.push(obj)
          obj = null
        })
        targetObj.remark = dataList
        break
    }
  })
   return targetObj;
}


export default handleActions({
  [ADDPERSON](state,obj) {
    equipInfo.repairPerson=obj.payload;
    return {
      ...state,
      repairPerson:obj.payload
    }
  },
  [handleSelectData](state,type){
    console.log('reducerFunction')
    console.log(type);
    let {faultType,hardwareType,faultPhenomenon,faultCause,treatmentMeasure,remark,repairPerson}=type.payload;
    return {
      ...state,
      faultType:faultType,//故障类型
      hardwareType: hardwareType,// 硬件类型
      faultPhenomenon:faultPhenomenon,// 故障现象
      faultCause:faultCause,// 故障原因
      treatmentMeasure:treatmentMeasure,// 处理措施
      remark:remark,// 备注
      repairPerson:repairPerson // 安装人员
    }


  }
}, {
  equipInfo:equipInfo,
  faultType:equipInfo.faultType,//故障类型
  hardwareType: equipInfo.hardwareType,// 硬件类型
  faultPhenomenon:equipInfo.faultPhenomenon,// 故障现象
  faultCause:equipInfo.faultCause,// 故障原因
  treatmentMeasure:equipInfo.treatmentMeasure,// 处理措施
  remark:equipInfo.remark,// 备注
  repairPerson:'' // 安装人员
})
