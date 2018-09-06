import wepy from 'wepy'
import api from '../api'
import Toast from 'wepy-com-toast'
import util from '../utils/util'
import * as Toolkit from '../utils/toolkit'

export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '学校详情',
    onReachBottom: true,
    onReachBottomDistance: 10
  }
  components = {
    toast: Toast
  }
  data = {
    currentTab: 0,
    modeIndex: 0,
    modeArr: ['按日', '按周', '按月'],
    currentDate: '',
    startDate: '',
    endDate: '',
    pickerWeekArr: [], // picker中range属性值
    weekIndex: 0, // picker中value属性值
    currentMonth: '',
    startMonth: '',
    endMonth: '',
    baseInfo: {},
    business: {},
    device: {
      phoneNum: 0,
      phoneOnline: 0,
      phoneOnlineRate: '0.00',
      phoneOnlineRateNum: '0.00%',
      swipeNum: 0,
      swipeOnline: 0,
      swipeOnlineRate: '0.00',
      swipeOnlineRateNum: '0.00%'
    },
    integralDetails: [],
    searchValue: '',
    baseEmpty: true,
    businessEmpty: true,
    integralEmpty: true,
    codeData: {
      codeArray: [
        {
          id: '0',
          time: '关闭'
        },
        {
          id: '1',
          time: '1小时'

        },
        {
          id: '2',
          time: '2小时'
        }
      ],
      index: 0,
      createTime: '09-03 20:00'
    },
    qrCodeData: {
      createTime: '',
      lastTime: '',
      qrcodeUrl: '',
      validFlag: '',
      id: ''
    },
    fixedTime: null  // 修改过的时间

  }
  methods = {
    changeItem(e) {
      if (this.currentTab === e.target.dataset.current) {
        return false
      } else {
        this.currentTab = e.target.dataset.current
      }
      wepy.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
    },
    async searchValue(e) {
      this.searchValue = e.detail.value
    },

    // 点击修改时间
    bindCodeChange(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.codeData.index = e.detail.value
      let hourNum = this.codeData.codeArray[e.detail.value].time
      let min = parseInt(hourNum) * 60
      this.updateQRcodeTime(min)
      this.$apply()

    },

    // 预览保存二维码
    longTapSaveCode() {
      // console.log('长按事件');
      let curUrl = this.qrCodeData.qrcodeUrl
      wepy.previewImage({
        current: curUrl, // 当前显示图片的http链接
        urls: [`${curUrl}`] // 需要预览的图片http链接列表
      })
    }
  }

  async searchInput(e) {
    this.searchValue = e.detail.value
  }

  async initData() {
    // 根据学校ID获取学校业务情况
    let logdate
    let index = Number(this.modeIndex)
    switch (index) {
      case 0:
        logdate = this.currentDate
        break
      case 1:
        logdate = this.pickerWeekArr[this.weekIndex].name.substring(0, 10)
        break
      default:
        if (this.currentMonth.toString() === this.endMonth.toString()) {
          logdate = util.getBeforDay()
        } else {
          // 根据月份做不同处理
          let splitMonth = this.currentMonth.split('-'),
            curMonth = splitMonth[1].toString(),
            year = parseInt(splitMonth[0])
          logdate = this.judgeMonthDay(curMonth, year)
        }
        break
    }

    // 获取学校统计信息
    this.getSchoolReport(logdate)

    // 获取学校设备信息,并对获取到的信息处理
    this.getSchoolDevice(logdate)

    this.$apply()
  }

  async onLoad(e) {
    console.log('option')
    console.log(e)

    // 处理页面参数
    this.schoolId = e.id
    this.modeIndex = parseInt(e.reportType) - 1

    // 初始化页面日期信息
    this.formatDate()

    // 获取周 , 处理周信息
    await this.handleWeekInfo(e)

    // 获取学校基本信息
    await this.handleSchoolInfo()

    // 获取学校积分详情
    await this.getSchoolScore()

    // 获取二维码信息
     this.getQRcode()

    // 初始化函数
    await this.initData()

    this.$apply()
  }

  changeMode(e) {
    if (this.modeIndex.toString() === e.detail.value) {
      return false
    }
    this.modeIndex = e.detail.value
    if (this.modeIndex === 0 || this.modeIndex === '0') {
      this.currentDate = this.endDate
    } else if (this.modeIndex === 1 || this.modeIndex === '1') {
      this.weekIndex = 0
    } else {
      this.currentMonth = this.endMonth
    }
    this.initData()
  }

  changeDate(e) {
    this.currentDate = e.detail.value
    this.initData()
  }

  changeWeek(e) {
    this.weekIndex = e.detail.value
    this.initData()
  }

  changeMonth(e) {
    this.currentMonth = e.detail.value
    this.initData()
  }

  // 加零操作
  addZero(value) {
    value = Number(value)
    if (value >= 0 && value <= 9) {
      value = '0' + value
    }
    return value
  }

  // 初始化页面日期信息
  formatDate() {
    let today = new Date()
    let myYear = today.getFullYear()
    let myMonth = this.addZero(today.getMonth() + 1)
    let myDate = this.addZero(today.getDate())

    // 当前日期
    let format = 'YYYY-MM-DD'
    let tempDate = new Date() * 1 - (24 * 60 * 60 * 1000)
    let currentDate = Toolkit.dateFormat(tempDate, format)
    this.currentDate = currentDate
    this.startDate = myYear - 3 + '-' + myMonth + '-' + myDate
    this.endDate = currentDate

    // 当前月
    this.currentMonth = myYear + '-' + myMonth
    this.startMonth = myYear - 3 + '-' + myMonth
    this.endMonth = myYear + '-' + myMonth
    this.$apply()
  }

  //  处理周信息
  async handleWeekInfo(e) {
    let getWeekItem = await api.getWeekItem()
    if (getWeekItem.data && getWeekItem.data.length > 0) {
      for (var i = 0; i < getWeekItem.data.length; i++) {
        var l = getWeekItem.data[i].name.length
        getWeekItem.data[i].str = getWeekItem.data[i].name.substring(11, l)
      }
    }
    switch (String(this.modeIndex)) {
      case '0':
        this.currentDate = e.logdate
        break
      case '1':
        this.weekIndex = parseInt(e.logdate)
        break
      default:
        let tempstr = ''
        let curMonth = e.logdate.split('-')
        curMonth.pop()
        tempstr = curMonth.join('-')
        this.currentMonth = tempstr
        break
    }
    this.pickerWeekArr = getWeekItem.data
    this.$apply()

  }

  // 处理学校信息
  async handleSchoolInfo() {
    let baseInfo = await api.getSchoolBaseInfo({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    })
    if (baseInfo.statusCode === 200) {
      this.baseEmpty = false
      if (baseInfo.data.customerManager) {
        baseInfo.data.customerManager = baseInfo.data.customerManager.split(',') // 移动客户经理
      }
      if (baseInfo.data.marketManager) {
        baseInfo.data.marketManager = baseInfo.data.marketManager.split(',') // 公司业务经理
        baseInfo.data.marketTelnum = baseInfo.data.marketTelnum.split(',') // 公司业务经理号码
      }
      if (baseInfo.data.regionManager) {
        baseInfo.data.regionManager = baseInfo.data.regionManager.split(',') // 区域经理
      }
      if (baseInfo.data.customLevel === null) {
        baseInfo.data.customLevel = '无'
      }
      switch (baseInfo.data.customLevel.toString()) {
        case '1':
          baseInfo.data.customLevel = 'A'
          break
        case '2':
          baseInfo.data.customLevel = 'B'
          break
        case '3':
          baseInfo.data.customLevel = 'C'
          break
        case '4':
          baseInfo.data.customLevel = 'D'
          break
      }
      if (baseInfo.data.cardHardtype === null) {
        baseInfo.data.cardHardtype = '无'
      }
      this.baseInfo = baseInfo.data
    } else {
      this.baseEmpty = true
    }
    wepy.setNavigationBarTitle({
      title: this.baseInfo.schoolName // 页面标题为路由参数
    })
    this.$apply()
  }

  // 获取积分详情
  async getSchoolScore() {
    let integralDetails = await api.getSchoolIntegralDetails({
      showLoading: true,
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    })
    if (integralDetails.data && integralDetails.data.data) {
      this.integralEmpty = false
      this.integralDetails = integralDetails.data.data
    } else {
      this.integralEmpty = true
    }
    this.$apply()
  }

  // 根据月份不同，做判断
  judgeMonthDay(curMonth, year) {
    let logdate
    switch (curMonth) {
      case '01':
      case '03':
      case '05':
      case '07':
      case '08':
      case '10':
      case '12':
        logdate = this.currentMonth + '-31'
        break
      case '04':
      case '06':
      case '09':
      case '11':
        logdate = this.currentMonth + '-30'
        break
      case '02':
        // 判断是否是闰年
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
          logdate = this.currentMonth + '-29'
        } else {
          logdate = this.currentMonth + '-28'
        }
        break
    }
    return logdate
  }

  // 获取学校统计信息
  async getSchoolReport(logdate) {
    let business = await api.schoolReport({
      showLoading: true,
      method: 'POST',
      data: {
        schoolId: this.schoolId,
        sumType: 1,
        reportType: parseInt(this.modeIndex) + 1,
        logdate: logdate
      }
    })
    if (business.data.result === 200) {
      if (business.data.businessInfo === null || business.data.businessInfo === 'null') {
        this.businessEmpty = true
        this.business = []
      }
      else {
        this.businessEmpty = false
        this.business = business.data.businessInfo
        this.business.busspsnperNum = parseInt(this.business.busspsnper.substring(0, this.business.busspsnper.length - 1)) // 开通率
        this.business.bussflscrdperNum = parseInt(this.business.bussflscrdper.substring(0, this.business.bussflscrdper.length - 1)) // 开通刷卡率
        this.business.nobussflscrdperNum = parseInt(this.business.nobussflscrdper.substring(0, this.business.nobussflscrdper.length - 1)) // 未开通刷卡率
        this.business.flscrdpsnperNum = parseInt(this.business.flscrdpsnper.substring(0, this.business.flscrdpsnper.length - 1)) // 总体刷卡率
        this.business.bussflscrdtalkpsnperNum = parseInt(this.business.bussflscrdtalkpsnper.substring(0, this.business.bussflscrdtalkpsnper.length - 1)) // 开通人使用率
        this.business.flscrdtalkpsnperNum = parseInt(this.business.flscrdtalkpsnper.substring(0, this.business.flscrdtalkpsnper.length - 1)) // 总体使用率
        if (!this.business.notdormflscrdper || this.business.notdormflscrdper === 'null') {
          this.business.notdormflscrdper = '0.00%'
        }
        this.business.notdormflscrdperNum = parseInt(this.business.notdormflscrdper.substring(0, this.business.notdormflscrdper.length - 1)) // 走读生考勤点刷卡率
        if (!this.business.dormflscrdper || this.business.notdormflscrdper === 'null') {
          this.business.dormflscrdper = '0.00%'
        }
        this.business.dormflscrdperNum = parseInt(this.business.dormflscrdper.substring(0, this.business.dormflscrdper.length - 1)) // 住宿生考勤点刷卡率
        if (!this.business.flscrdpsnper1 || this.business.notdormflscrdper === 'null') {
          this.business.flscrdpsnper1 = '0.00%'
        }
        this.business.flscrdpsnper1Num = parseInt(this.business.flscrdpsnper1.substring(0, this.business.flscrdpsnper1.length - 1)) // 总考勤点刷卡率
        this.business.busstalkperNum = parseInt(this.business.busstalkper.substring(0, this.business.busstalkper.length - 1)) // 电话使用率
      }
    } else {
      this.$invoke('toast', 'show', {
        title: business.data.message || business.data.msg
      })
      this.businessEmpty = true
    }
    this.$apply()

  }

  // 获取学校设备信息，并更新页面信息
  async getSchoolDevice(logdate) {
    let initDevice = this.device
    let device = await api.getBusinessDeviceInfo({
      method: 'POST',
      data: {
        schoolId: this.schoolId,
        sumType: 1,
        reportType: parseInt(this.modeIndex) + 1,
        logdate: logdate
      }
    })
    // 先置空，判断后在赋值
    initDevice = {
      swipeNum: 0,
      phoneNum: 0,
      phoneOnline: 0,
      swipeOnline: 0,
      swipeOnlineRate: '0.00',
      swipeOnlineRateNum: '0.00',
      phoneOnlineRate: '0.00',
      phoneOnlineRateNum: '0.00'
    }

    if (device.data.swipeOnlineRate && device.data.swipeOnlineRate.toString() !== '' && device.data.swipeOnlineRate.toString() !== 'null') {
      this.device.swipeOnlineRateNum = parseInt(device.data.swipeOnlineRate)
      this.device.swipeOnlineRate = device.data.swipeOnlineRate + '%'
    }
    if (device.data.phoneOnlineRate && device.data.phoneOnlineRate.toString() !== '' && device.data.phoneOnlineRate.toString() !== 'null') {
      this.device.phoneOnlineRateNum = parseInt(device.data.phoneOnlineRate)
      this.device.phoneOnlineRate = device.data.phoneOnlineRate + '%'
    }
    if (device.data.phoneNum && device.data.phoneNum.toString() !== '' && device.data.phoneNum.toString() !== 'null') {
      this.device.phoneNum = device.data.phoneNum
    }
    if (device.data.phoneOnline && device.data.phoneOnline.toString() !== '' && device.data.phoneOnline.toString() !== 'null') {
      this.device.phoneOnline = device.data.phoneOnline
    }
    if (device.data.swipeNum && device.data.swipeNum.toString() !== '' && device.data.swipeNum.toString() !== 'null') {
      this.device.swipeNum = device.data.swipeNum
    }
    if (device.data.swipeOnline && device.data.swipeOnline.toString() !== '' && device.data.swipeOnline.toString() !== 'null') {
      this.device.swipeOnline = device.data.swipeOnline
    }
    this.$apply()
  }

  // 搜索老师接口
  async searchTeacher(e) {
    if (!util.vailNum(this.searchValue) && !util.vailChinese(this.searchValue)) {
      this.$invoke('toast', 'show', {
        title: '请输入正确的姓名或手机号'
      })
      return false
    }
    var data = {
      schoolId: this.schoolId
    }
    if (util.vailNum(this.searchValue)) {
      data.telNum = this.searchValue
    } else {
      data.teacherName = this.searchValue
    }
    // 获取学校积分详情
    let integralDetails = await api.getSchoolIntegralDetails({
      method: 'POST',
      data: data
    })
    this.integralDetails = integralDetails.data.data
    this.$apply()
  }

//  获取二维码信息
  async getQRcode() {
    let res = await api.getQRcode({
      method: 'POST',
      data: {
        schoolId: this.schoolId,
        schoolName:this.baseInfo.schoolName
      }
    })
    if (res.data && res.data.result === 200) {
      this.qrCodeData = res.data
    }
    this.$apply();
  }

//  更新二维码信息
  async updateQRcodeTime(min) {

    //  点击确定的时候调用信息
    min = isNaN(min) ? 0 : min
    let res = await api.updateQRcode({
      method: 'POST',
      data: {
        minutes: min,
        id: this.qrCodeData.id
      }
    })
    if (res.data && res.data.result === 200) {
      console.log('查看提交成功的信息')
      this.$invoke('toast', 'show', {
        title: res.data.message
      })
    } else {
      this.$invoke('toast', 'show', {
        title: res.data.message
      })
    }
    this.$apply()

  }

//  修改过期时间
  fixedDeadline(hourTime) {
    let lastTime = this.qrCodeData.lastTime
    if (isNaN(hourTime)) {
      return
    }
    let tempArray = lastTime.split(' ')[1].split(':')
    hourTime = hourTime + tempArray[0] * 1
    hourTime = hourTime >= 24 ? hourTime - 24 : hourTime
    tempArray[0] = hourTime
    this.fixedTime = lastTime.split(' ')[0] + ' ' + tempArray.join(':')
  }
}
