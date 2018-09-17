import wepy from 'wepy'
import querystring from 'querystring'

let requestLength = 0

const wxRequest = async (params = {}, url) => {
  requestLength++
  if (true) {
    wx.showLoading({
      title: '加载中',
      mask: params.mask || false
    })
  }
  if (!params.data) {
    params.data = {}
  }
  params.data.platformType = 3
  params.data.version = '1.0.0'
  params.data.token = encodeURI(wepy.getStorageSync('token')).replace(/\+/g, '%2B')
  // params.data.userTelNum = encodeURI(wepy.getStorageSync('userTelNum')).replace(/\+/g, '%2B');
  // params.data.userName = wepy.getStorageSync('userName');
  params.data.preHand = 1
  let res = await wepy.request({
    url: url,
    method: params.method || 'GET',
    data: params.data,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  if (--requestLength <= 0) {
    wx.hideLoading()
  }
  if (res.statusCode === 401 || res.data.result === 401 || res.statusCode === 400 || res.data.result === 400) {
    wepy.removeStorageSync('token')
    wepy.removeStorageSync('userId')
    wepy.removeStorageSync('noticeTimeStamp')
  }
  return res
}

// const apiMall = 'http://192.168.5.133:8380'; // 开发（晨宇）
// const apiMall = 'http://192.168.5.106:8081'; // 开发（晨宇 设备管理）

// const apiMall = 'http://182.92.131.35:8081'; // 测试（）
//  const apiMall = 'http://192.168.12.168:8087'; // 亚杰（）;
//  const apiMall = 'http://192.168.12.147:8090'; // 练莉（）;
//  // const apiMall = 'http://192.168.5.131:8380';
const apiMall = 'https://api.967111.com'; // 正式
const login = (params) => wxRequest(params, apiMall + '/manageHelper/login.do');
const searchSchool = (params) => wxRequest(params, apiMall + '/manageHelper/listUserSchoolByAtuh.do')
const queryGrade = (params) => wxRequest(params, apiMall + '/manageHelper/getGradeBySchoolId.do')
const queryClass = (params) => wxRequest(params, apiMall + '/manageHelper/getClassByGradeId.do')
const schoolBusinessList = (params) => wxRequest(params, apiMall + '/manageHelper/schoolBusinessList.do')
const studentBusinessList = (params) => wxRequest(params, apiMall + '/manageHelper/studentBusinessList.do')
const businessList = (params) => wxRequest(params, apiMall + '/manageHelper/getBusinessList.do')
const openProduct = (params) => wxRequest(params, apiMall + '/manageHelper/openProduct.do')
const getSchoolBaseInfo = (params) => wxRequest(params, apiMall + '/manageHelper/getSchoolBaseInfo.do') // 获取学校基本信息
const schoolReport = (params) => wxRequest(params, apiMall + '/helperReport/schoolReport.do') // 根据学校ID获取学校业务情况
const getBusinessDeviceInfo = (params) => wxRequest(params, apiMall + '/manageHelper/getBusinessDeviceInfo.do') // 根据学校ID获取学校设备情况
const getWeekItem = (params) => wxRequest(params, apiMall + '/helperReport/listWeeks.do') // 获取周
const getSchoolIntegralDetails = (params) => wxRequest(params, apiMall + '/manageHelper/getSchoolIntegralDetails.do') // 获取学校的积分情况
const getSchoolList = (params) => wxRequest(params, apiMall + '/helperReport/reportList.do')
const getAfterFilterList = (params) => wxRequest(params, apiMall + '/helperReport/reportList.do')
const getCity = (params) => wxRequest(params, apiMall + '/helperReport/queryConditionsRegion.do?userId=' + params)
const getAreaManager = (params) => wxRequest(params, apiMall + '/helperReport/queryConditionsRManager.do?userId=' + params)
const getBusiManager = (params) => wxRequest(params, apiMall + '/helperReport/queryConditionsBManager.do?regionId=' + params)
const getAfterManagerFiter = (params) => wxRequest(params, apiMall + '/helperReport/reportList.do')
const logout = (params) => wxRequest(params, apiMall + '/manageHelper/logout.do') // 注销登录
const getType = (params) => wxRequest(params, apiMall + '/manageHelper/getUserType.do') // 登录成功，进入main.wpy页面时请求数据
const getFilterData = (params) => wxRequest(params, apiMall + '/helperReport/getManagerRegion.do')
const getBusiManagerNew = (params) => wxRequest(params, apiMall + '/helperReport/getManagerRegionBusiness.do')
const sms = (params) => wxRequest(params, apiMall + '/sms.do') // 获取验证码
const findPwd = (params) => wxRequest(params, apiMall + '/manageHelper/findPwd.do') // 重置密码
const getCityNew = (params) => wxRequest(params, apiMall + '/helperReport/getAreaRegion.do')
const getAreaNew = (params) => wxRequest(params, apiMall + '/helperReport/getLareaRegion.do')

//- lawrence
const getSchoolsByUserId = params => wxRequest(params, apiMall + '/photoGraphController/listUserSchoolByAtuh.do')
const getGradeBySchoolId = params => wxRequest(params, apiMall + '/photoGraphController/getGradeBySchoolId.do')
const getClassByGradeId = params => wxRequest(params, apiMall + '/photoGraphController/getClassByGradeId.do')
const getStudentsByClassId = params => wxRequest(params, apiMall + '/photoGraphController/getStudentsByClass.do')

const getPerformanceForEquipment = params => wxRequest(params, apiMall + '/myPerformance/equipmentPerformance.do')
const getPerformanceForSchool = params => wxRequest(params, apiMall + '/myPerformance/schoolPerformance.do')
const getPerformanceForCardHoding = params => wxRequest(params, apiMall + '/myPerformance/queryReportDeatail.do')
const getPerformanceForOrders = params => wxRequest(params, apiMall + '/myPerformance/queryProductCodeSum.do')
const getPerformanceForOrderPeoples = params => wxRequest(params, apiMall + '/myPerformance/queryProductPersonRunChart.do')
const getPerformanceForTrend = params => wxRequest(params, apiMall + '/myPerformance/queryProductRunChart.do')
const getPerformanceForTrendAdd = params => wxRequest(params, apiMall + '/myPerformance/queryProductRunChartAdd.do')
const getPerformanceForTrendCut = params => wxRequest(params, apiMall + '/myPerformance/queryProductRunChartCut.do')
const getPerformanceForTrendUp = params => wxRequest(params, apiMall + '/myPerformance/queryProductRunChartUp.do')
const getPerformanceForApp = params => wxRequest(params, apiMall + '/myPerformance/queryAppUseRunChart.do')
const getStudentsInfoById = params => wxRequest(params, apiMall + '/teacher/student/queryStudent.do')
const updateStudentsInfo = params => wxRequest(params, apiMall + '/manageHelper/updateStudent.do')
const searchStudentsInfoBySchoolId = params => wxRequest(params, apiMall + '/manageHelper/listStudentNew.do')
const getlistProductSchool = params => wxRequest(params, apiMall + '/teacher/business/listProductSchool.do')
const addNewStudent = params => wxRequest(params, apiMall + '/manageHelper/addStudent.do')
const getRegionProvince = params => wxRequest(params, apiMall + '/region/listProvince.do')
const getRegionCity = params => wxRequest(params, apiMall + '/region/listCity.do')
const getRegionCounty = params => wxRequest(params, apiMall + '/region/listRegion.do')
const getEquipListBySchoolId = params => wxRequest(params, apiMall + '/manageHelper/machine/terminalList.do')
const getRepairRecordByTerminalId = params => wxRequest(params, apiMall + '/manageHelper/machine/terminalRepairList.do')
const getUserIdentifyById = params => wxRequest(params, apiMall + '/manageHelper/machine/checkUserType.do')
const getGroupPersonById = params => wxRequest(params, apiMall + '/manageHelper/machine/groupManList.do')
const updateEquipInfo = params => wxRequest(params, apiMall + '/manageHelper/machine/updateOrInsertTerminalSer.do')
const reformatEquipments = params => wxRequest(params, apiMall + '/manageHelper/machine/operationTerminal.do')
const getTerminalType = params => wxRequest(params, apiMall + '/manageHelper/machine/seachTerminalType.do')
const installCurEquip = params => wxRequest(params, apiMall + '/manageHelper/machine/installTerminal.do')
const getEquipInfoById = params => wxRequest(params, apiMall + '/manageHelper/machine/getTerminalById.do')
const saveEquipAddressInfo = params => wxRequest(params, apiMall + '/manageHelper/machine/updateTerminalReAdrById.do')
const getAttendanceMethods = params => wxRequest(params, apiMall + '/manageHelper/kaoqin/listKaoqinType.do')
const getCardRecord = params => wxRequest(params, apiMall + '/teacher/kaoqin/listKaoqinSumNew.do')
const getDormInfo = params => wxRequest(params, apiMall + '/manageHelper/kaoqin/getAllSchoolFloorInfo.do')
const getDormAttendanceInfo = params => wxRequest(params, apiMall + '/dorm/countDormChecking.do')
const getDormListByFloorId = params => wxRequest(params, apiMall + '/dorm/getTeacherDormInfo.do')
const dormRestData = params => wxRequest(params, apiMall + '/dorm/infoDormRestChecking.do')
const InOutRestData = params => wxRequest(params, apiMall + '/teacher/kaoqin/infoSchoolRestChecking.do')
const InOutData = params => wxRequest(params, apiMall + '/teacher/kaoqin/listGateKaoqinDetailNew.do')
const dormData = params => wxRequest(params, apiMall + '/dorm/detailDormChecking.do')
const searchStudentByCardOrPhone = params => wxRequest(params, apiMall + '/manageHelper/listStudentByCardOrPhone.do')
const getEquipListInfoBySchoolId = params => wxRequest(params, apiMall + '/manageHelper/machine/seachLonlatBySchool.do')
const updateEquipInfoByLocation = params => wxRequest(params, apiMall + '/manageHelper/machine/updateTerminalLongLatById.do')
const getFailedStudentList = params => wxRequest(params, apiMall + '/manageHelper/getAuditCountList.do')
const getQRcode = params => wxRequest(params, apiMall + '/manageHelper/getQRcode.do')
const updateQRcode = params => wxRequest(params, apiMall + '/manageHelper/setQRcode.do')

const addStudentPhoto = async (params) => {
  wepy.showLoading({
    title: '正在上传..',
    mask: true
  })
  const defaultParams = {
    platformType: 3,
    version: '1.0.0',
    preHand: 1
  };



  const ret = await wepy.uploadFile({
    url: apiMall + '/photoGraphController/uploadPhotoToQiNiu.do?' + querystring.stringify(defaultParams) + '&token=' + encodeURI(encodeURI(wepy.getStorageSync('token')).replace(/\+/g, '%2B')),
    ...params,
    success: function (res) {
      console.log('upload success', res)
    }
  })

  wepy.hideLoading()
  return ret
}
const uploadStudentPhoto = async (params) => {

  const defaultParams = {
    platformType: 3,
    version: '1.0.0',
    preHand: 1
  }
  console.log('上传请求函数上传请求函数')

  const ret = await wepy.uploadFile({
    url: apiMall + '/photoGraphController/uploadStudentPhoto.do?' + querystring.stringify(defaultParams) + '&token=' + encodeURI(encodeURI(wepy.getStorageSync('token')).replace(/\+/g, '%2B')),
    ...params,
    success: function (res) {
      console.log('upload success', res)
    }
  })
  return ret

}
module.exports = {
  login,
  searchSchool,
  queryGrade,
  queryClass,
  schoolBusinessList,
  studentBusinessList,
  businessList,
  openProduct,
  getSchoolBaseInfo,
  schoolReport,
  getBusinessDeviceInfo,
  getWeekItem,
  getSchoolIntegralDetails,
  getSchoolList,
  getCity,
  getAfterFilterList,
  getAreaManager,
  getBusiManager,
  getAfterManagerFiter,
  logout,
  sms,
  findPwd,
  getType,
  getFilterData,
  getBusiManagerNew,
  getCityNew,
  getAreaNew,
  getSchoolsByUserId,
  getGradeBySchoolId,
  getClassByGradeId,
  uploadStudentPhoto,
  getStudentsByClassId,
  getPerformanceForEquipment,
  getPerformanceForSchool,
  getPerformanceForCardHoding,
  getPerformanceForOrders,
  getPerformanceForOrderPeoples,
  getPerformanceForTrend,
  getPerformanceForTrendAdd,
  getPerformanceForTrendCut,
  getPerformanceForTrendUp,
  getPerformanceForApp,
  getStudentsInfoById,
  updateStudentsInfo,
  searchStudentsInfoBySchoolId,
  getlistProductSchool,
  getRegionProvince,
  getRegionCity,
  getRegionCounty,
  addNewStudent,
  addStudentPhoto,
  getEquipListBySchoolId,
  getRepairRecordByTerminalId,
  getUserIdentifyById,
  getGroupPersonById,
  updateEquipInfo,
  reformatEquipments,
  getTerminalType,
  installCurEquip,
  getEquipInfoById,
  saveEquipAddressInfo,
  getAttendanceMethods,
  getCardRecord,
  getDormInfo,
  getDormAttendanceInfo,
  getDormListByFloorId,
  dormRestData,
  InOutRestData,
  InOutData,
  dormData,
  searchStudentByCardOrPhone,
  getEquipListInfoBySchoolId,
  updateEquipInfoByLocation,
  getFailedStudentList,
  getQRcode,
  updateQRcode
}
