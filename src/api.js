import wepy from 'wepy'
const wxRequest = async (params = {}, url) => {
  if (true) {
    wepy.showLoading({
      title: '加载中'
    })
  }
  if (!params.data) {
    params.data = {}
  }
  params.data.platformType = 3
  params.data.version = '1.0.0'
  params.data.token = encodeURI(wepy.getStorageSync('token')).replace(/\+/g, '%2B')
  params.data.preHand = 1
  let res = await wepy.request({
    url: url,
    method: params.method || 'GET',
    data: params.data,
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  if (true) {
    wepy.hideLoading()
  }
  if (res.statusCode === 401 || res.data.result === 401 || res.statusCode === 400 || res.data.result === 400) {
    wepy.removeStorageSync('token')
    wepy.removeStorageSync('userId')
    wepy.removeStorageSync('noticeTimeStamp')
    wepy.redirectTo({url: 'login'})
  }
  /* if (res.data.result === 300) {
    this.$invoke('toast', 'show', {
      title: result.data.error || result.data.msg || result.data.message || '请求参数错误'
    })
  }
  if (res.data.result === 500) {
    this.$invoke('toast', 'show', {
      title: result.data.error || result.data.msg || result.data.message || '请求参数错误'
    })
  } */
  return res
}
const apiMall = 'http://192.168.5.125:8380' // 开发（晨宇）
// const apiMall = 'http://182.92.131.35:8081' // 测试（appServer）
// const apiMall = 'https://api.967111.com' // 正式

const login = (params) => wxRequest(params, apiMall + '/manageHelper/login.do')
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
const getSchoolList = (params) => wxRequest(params, apiMall + '/helperReport/reportList.do?userId='+params.userId+'&reportType='+params.reportType+'&logdate='+params.logdate+"&regionId="+params.regionId+"&regionLevel="+params.regionLevel+"&regionManager="+params.regionManager)
const getAfterFilterList = (params) => wxRequest(params, apiMall + '/helperReport/reportList.do?userId='+params.userId+'&reportType='+params.reportType+'&logdate='+params.logdate+"&regionId="+params.regionId+"&regionLevel="+params.regionLevel+"&regionManager="+params.regionManager)
const getCity = (params) => wxRequest(params, apiMall + '/helperReport/queryConditionsRegion.do?userId='+params)
const getAreaManager = (params) => wxRequest(params, apiMall + '/helperReport/queryConditionsRManager.do?userId='+params)
const getBusiManager = (params) => wxRequest(params, apiMall + '/helperReport/queryConditionsBManager.do?regionId='+params)
const getAfterManagerFiter = (params) => wxRequest(params, apiMall + '/helperReport/reportList.do?userId='+params.userId+'&reportType='+params.reportType+'&logdate='+params.logdate+"&regionManager="+params.regionManager+"&regionId="+params.regionId+"&regionLevel="+params.regionLevel)
const logout = (params) => wxRequest(params, apiMall + '/manageHelper/logout.do') // 注销登录
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
  logout
}
