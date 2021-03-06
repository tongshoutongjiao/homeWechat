import wepy from 'wepy'
import api from '../api'
import util from '../utils/util'
import * as Toolkit from '../utils/toolkit'
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '学校列表'
  };
  data = {
    toCurrentTab: '0',// 当前tab栏 三种状态：0,1,2
    a: [],
    isFilter: false,
    useAreaManagerFilter: false,
    regionLevel: 0,
    postCityId: [],
    postAreaId: [],
    postAreaManagerId: [],
    postBusiManagerId: [],
    str: '0',
    currentTime: '0',
    monthEndTime: '0',
    btomSchollNum: 0,
    btomStudentNum: 0,
    btomPassNum: '0%',
    btomUserNum: 0,
    getDayList: [],
    getWeekList: [],
    getMonthList: [],
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    iconSize: 28,
    iconColor: '#8e8e92',
    iconType: ['search', 'cancel', 'waiting'],
    sortIndex: 0,
    pickSortTypeArr: [],
    sortIdArr: [],
    monthPickArr: [],
    monthIdArr: [],
    monthIndex: 0,
    monthInit: '20l7-05',
    nimationData: '',
    busiManager: false,
    show: false,
    selecHeadPeo: true,
    selecTakeArea: false,
    initDate: '2018-02-05',
    selectDate: '0',
    areaManagerList: [],
    busiPeoList: [],
    cityList: [],
    areaList: [],
    cityChose: false,
    pickerWeekArr: [],// picker中range属性值
    weekIndex: 0,// picker中value属性值
    weekIdArr: [],// 存储id数组
    btmWeekSchollNum: '0',
    btmWeekStudentNum: '0',
    btmWeekPassNum: '0',
    btmWeekUserNum: '0',
    btmMonSchollNum: '0',
    btmMonStudentNum: '0',
    btmMonPassNum: '0',
    btmMonUserNum: '0',
    btomDaySchollNum: '0',
    btomDayStudentNum: '0',
    btomDayPassNum: '0',
    btomDayUserNum: '0',
    getWeekData: [],
    getMonthData: [],
    afterRload: false,
    schoolId: '',
    areaManagerShow: false,
    cityShow: false,
    schoolName :'',
    userType:  0,
    headPeoHidden: true,
    operaType: 6,
    areaManRegionLev: 0,
    areaManUserId: '0',
    regionId: '0',
    cityRegionLevel: '0',
    loadMore: true,
    page: 1,
    size: 10,
    quanJuRegionId: [],
    selectType: '1'
  }
  onUnload() {
    let pageInstance = getCurrentPages().length
    if (pageInstance > 2 && this.hasBack === false) {
      wepy.navigateBack({
        delta: pageInstance - 1
      })
      this.hasBack = true
    }
  }
  checkLogin() {
    let token = wepy.getStorageSync('token')
    if (token) {
      return true
    }
    wepy.redirectTo({url: '/pages/login'})
    return false
  }
  onReady() {
    this.checkLogin()
  }
  onShow() {
    this.checkLogin()
  }
  async onLoad(e) {
    this.userType = Number(wepy.getStorageSync('userType'))
    if (String(this.userType) === '5') {
      return
    }
    if (this.userType == '2') {
      this.headPeoHidden = false
      this.areaManagerShow = false
      this.busiManager = false
    }
    if (e.id === undefined) {
      this.schoolId = ''
    } else {
      this.schoolId = e.id
    }
    if (e.name === undefined) {
      this.schoolName = ''
    } else {
      this.schoolName = decodeURI(e.name)
    }
    if (e.toCurrentTab === undefined) {
    } else {
      this.currentTab = e.toCurrentTab
      if (e.toCurrentTab === '1') {
        this.selectDate = e.showDate
        this.$apply()
        this.str= e.showDate
        let weekParams = {}
        weekParams.userId = wepy.getStorageSync('userId')
        weekParams.userType = this.userType
        weekParams.reportType = '2'
        weekParams.selectType = this.selectType
        weekParams.regionManager = e.regionManager === 'undefined' ? '' : e.regionManager
        weekParams.regionId = e.regionId === 'undefined' ? '' : e.regionId
        weekParams.regionLevel = e.regionLevel === 'undefined' ? '' : e.regionLevel
        weekParams.schoolId = e.id
        weekParams.operaType = this.operaType
        weekParams.logdate = e.searchDate
        this.getWeekList = []
        let getWeekSchoolList = await api.getSchoolList({method: 'POST', data: weekParams})
        this.getWeekList = getWeekSchoolList.data.dataList
        this.btmWeekSchollNum = getWeekSchoolList.data.schoolNum
        this.btmWeekStudentNum = getWeekSchoolList.data.studentNum
        this.btmWeekPassNum = getWeekSchoolList.data.openRate
        this.btmWeekUserNum = getWeekSchoolList.data.adduserNum
        this.$apply()
      } else if (e.toCurrentTab === '2') {
        this.monthInit = e.showDate
        let monthParams = {}
        monthParams.userId = wepy.getStorageSync('userId')
        monthParams.userType = this.userType
        monthParams.reportType = '3'
        monthParams.selectType = this.selectType
        monthParams.regionManager = e.regionManager === 'undefined' ? '' : e.regionManager
        monthParams.regionId = e.regionId === 'undefined' ? '' : e.regionId
        monthParams.regionLevel = e.regionLevel === 'undefined' ? '' : e.regionLevel
        monthParams.schoolId = e.id
        monthParams.operaType = this.operaType
        monthParams.logdate = e.searchDate
        let getMonSchoolList = await api.getSchoolList({method: 'POST', data: monthParams})
        this.getMonthList = getMonSchoolList.data.dataList
        this.btmMonSchollNum = getMonSchoolList.data.schoolNum
        this.btmMonStudentNum = getMonSchoolList.data.studentNum
        this.btmMonPassNum = getMonSchoolList.data.openRate
        this.btmMonUserNum = getMonSchoolList.data.adduserNum
        this.$apply()
      }
    }

    let info = wepy.getSystemInfo()
    // 调用函数时，传入new Date()参数，返回值是日期和时间
    let time = util.getCurrentTime(new Date())
    // 再通过setData更改Page()里面的data，动态更新页面的数据
    // console.log(time);
    this.currentTime = time
    // 获取上一月的日期
    // console.log(util.getCurrentMonth(new Date()))
    this.monthEndTime = util.getCurrentMonth(new Date())
    this.monthInit = e.showDate === undefined ? util.getCurrentMonth(new Date()) : e.showDate
    // 获取当天的上一天的日期
    // console.log(util.getBeforDay(new Date()));
    let getBeforDay = util.getBeforDay(new Date())
    this.initDate = util.getBeforDay(new Date())
    this.selectDate = e.showDate === undefined ? util.getBeforDay(new Date()) : e.showDate
    this.winWidth = info._value.windowWidth;
    this.winHeight = info._value.windowHeight;
    // 排序选择器
    let pickSortTypeArr = []
    let sortIdArr = []
    let sortType = [{
      "id": "0",
      "name": "综合排序"
    }, {
      "id": "1",
      "name": "学校总人数"
    }, {
      "id": "2",
      "name": "开通率"
    }, {
      "id": "3",
      "name": "净增用户数"
    }]
    sortType.forEach(function (e) {
      pickSortTypeArr.push(e.name)
      sortIdArr.push(e.id)
    })
    this.pickSortTypeArr = pickSortTypeArr
    this.sortIdArr = sortIdArr
    // 获取周
    let getWeekItem = await api.getWeekItem()
    // 选择器按周进行选择
    let pickerWeekArr = [],
      weekIdArr = [],
      showWeekArr = Object.prototype.toString.call(getWeekItem.data) === '[object Array]' ? getWeekItem.data : []
    showWeekArr.forEach(function(e) {
      pickerWeekArr.push(e.name)
      weekIdArr.push(e.id)
    })
    this.pickerWeekArr = pickerWeekArr
    this.weekIdArr = weekIdArr
    for (let i = 0; i < this.pickerWeekArr.length; i++) {
      if (i == '0') {
        var str = this.pickerWeekArr[i].split('@')
      }
    }
    // 获取区域经理数据
    if (this.userType == '1' || this.userType == '3' ){
      let userId = wepy.getStorageSync('userId')
      let userType = this.userType
      let getFilterData = await api.getFilterData({method: 'POST', data: {userType: userType,userId: userId}})
      this.areaManagerList = getFilterData.data
      if (this.areaManagerList.data && this.areaManagerList.data.length == 0) {
        this.areaManagerShow = false
      } else {
        this.areaManagerShow = true
      }
      if (this.areaManagerList.data && this.areaManagerList.data.length !== 0) {
        for (var i = 0; i < this.areaManagerList.data.length; i++) {
          this.areaManagerList.data[i].status = 0
        }
      }
      this.$apply()
    }
    if(!str === undefined) {
      this.str = e.showDate === undefined ? str[1] : e.showDate
    }
    // 默认获取按日的学校数据
    if (this.userType == '1' || this.userType == '2' || this.userType == '3' || this.userType == '4') {
      let dayParams = {}
      dayParams.userId = wepy.getStorageSync('userId')
      dayParams.userType = this.userType
      this.operaType = 6
      dayParams.operaType = 6
      dayParams.reportType = '1'
      dayParams.regionManager = ''
      dayParams.regionId = ''
      dayParams.regionLevel = ''
      dayParams.selectType = '1'
      dayParams.schoolId = this.schoolId
      dayParams.pageIndex = this.page
      dayParams.pageSize  = this.size
      dayParams.logdate = util.getBeforDay(new Date())
      let getSchoolList = await api.getSchoolList({method: 'POST',data: dayParams})
      if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length == 0) {
        this.page += 1
      } else {
        this.loadMore = false
      }
      this.getDayList = getSchoolList.data.dataList
      this.btomSchollNum = getSchoolList.data.schoolNum
      this.btomStudentNum = getSchoolList.data.studentNum
      this.btomPassNum = getSchoolList.data.openRate
      this.btomUserNum = getSchoolList.data.adduserNum
      let userId = wepy.getStorageSync('userId')
      this.$apply()
    }
  }

  methods = {
    async swichNav(e) {
      console.log('切换tab栏');

      if (this.userType == '5') { return; }

      if (this.currentTab !== e.target.dataset.current) {
        this.loadMore = true;
        this.currentTab = e.target.dataset.current;
        switch (e.target.dataset.current){
          case '0':
            this.page = 1
            this.selectDate = util.getBeforDay(new Date())
            let dayParams = {}
            dayParams.schoolId = this.schoolId
            dayParams.userType = this.userType
            dayParams.userId = wepy.getStorageSync('userId')
            // dayParams.userId = 1790
            dayParams.reportType = '1'
            dayParams.selectType = this.selectType
            dayParams.logdate = this.selectDate
            dayParams.pageIndex = this.page
            dayParams.pageSize  = this.size
            dayParams.operaType = this.operaType
            if (this.a.length > 0 && this.selecTakeArea == true) {
              dayParams.regionId = this.a
              dayParams.regionLevel = this.regionLevel
              dayParams.regionManager = ''
            } else if(this.a.length >0 && this.selecHeadPeo == true) {
              dayParams.regionManager = this.a
              dayParams.regionId = ''
              dayParams.regionLevel = ''
            } else if (this.a.length == 0) {
              dayParams.regionId = ''
              dayParams.regionLevel = ''
              dayParams.regionManager = ''
            }
            this.getDayList = []
            this.getWeekList = []
            this.getMonthList = []
            let getSchoolList = await api.getSchoolList({method: 'POST',data:dayParams})
            this.getDayList = getSchoolList.data.dataList
            this.btomSchollNum = getSchoolList.data.schoolNum
            this.btomStudentNum = getSchoolList.data.studentNum
            this.btomPassNum = getSchoolList.data.openRate
            this.btomUserNum = getSchoolList.data.adduserNum
            if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length == 0) {
              this.page += 1
            } else {
              this.loadMore = false
            }
            break;
          case '1':
            if (this.toCurrentTab == '1') {
              return false
            }
            else {
              this.loadMore = true
              this.page = 1
              let splitWeek = this.pickerWeekArr[this.weekIndex].split('@')
              this.str = splitWeek[1]
              let weekParams = {}
              weekParams.schoolId = this.schoolId
              weekParams.userId = wepy.getStorageSync('userId')
              // weekParams.userId = 1790
              weekParams.userType = this.userType
              weekParams.selectType = this.selectType
              weekParams.operaType = this.operaType
              // weekParams.userType = this.userType
              weekParams.reportType = '2'
              weekParams.pageIndex = this.page
              weekParams.pageSize  = this.size
              weekParams.logdate = splitWeek[0]
              if (this.a.length > 0 && this.selecTakeArea == true) {
                weekParams.regionId = this.a
                weekParams.regionLevel = this.regionLevel
                weekParams.regionManager = ''
              } else if(this.a.length > 0 && this.selecHeadPeo == true) {
                weekParams.regionManager = this.a
                weekParams.regionId = this.a
                weekParams.regionLevel = ''
              } else if(this.a.length == 0){
                weekParams.regionId = ''
                weekParams.regionLevel = ''
                weekParams.regionManager = ''
              }
              this.getDayList = []
              this.getWeekList = []
              this.getMonthList = []
              let getWeekSchoolList = await api.getSchoolList({method:'POST',data:weekParams})
              this.getWeekList = getWeekSchoolList.data.dataList
              this.btmWeekSchollNum = getWeekSchoolList.data.schoolNum
              this.btmWeekStudentNum = getWeekSchoolList.data.studentNum
              this.btmWeekPassNum = getWeekSchoolList.data.openRate
              this.btmWeekUserNum = getWeekSchoolList.data.adduserNum
              console.log(getWeekSchoolList.data.dataList)
              if (getWeekSchoolList.data.dataList && !getWeekSchoolList.data.dataList.length ==0) {
                this.page += 1
              } else {
                this.loadMore = false
              }
              this.$apply()
            }
           break;
          case '2':
            if (this.toCurrentTab == '2' ) {
              return false
            }
            else {
              this.page = 1
              this.loadMore = true
              this.monthInit = util.getCurrentMonth(new Date())
              let time = util.getCurrentMonth(new Date())
              let splitMonth = this.monthInit.split('-')
              let monthParams = {}
              monthParams.schoolId = this.schoolId
              monthParams.userType = this.userType
              monthParams.userId = wepy.getStorageSync('userId')
              // monthParams.userId = 1790
              monthParams.operaType = this.operaType
              monthParams.reportType = '3'
              monthParams.selectType = this.selectType
              monthParams.pageIndex = this.page
              monthParams.pageSize  = this.size
              if (this.a.length > 0 && this.selecTakeArea == true) {
                monthParams.regionId = this.a
                monthParams.regionLevel = this.regionLevel
                monthParams.regionManager = ''
              } else if (this.a.length > 0 && this.selecHeadPeo == true) {
                monthParams.regionManager = this.a
                monthParams.regionId = this.a
                monthParams.regionLevel = ''
              } else if (this.a.length == 0){
                monthParams.regionId = ''
                monthParams.regionLevel = ''
                monthParams.regionManager = ''
              }
              if (this.monthInit == time) {
                monthParams.logdate = util.getBeforDay(new Date())
                console.log(monthParams.logdate)
              } else if (splitMonth[1] == '01' || splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
                monthParams.logdate = this.monthInit + '-31'
              } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
                monthParams.logdate = this.monthInit + '-30'
                console.log(monthParams.logdate)
              } else if (splitMonth[1] == '02') {
                if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
                  monthParams.logdate = this.monthInit + '-29'
                } else {
                  monthParams.logdate = this.monthInit + '-28'
                }
              }
              this.getDayList = []
              this.getWeekList = []
              this.getMonthList = []
              let getMonthSchoolList = await api.getSchoolList({method: 'POST', data: monthParams})
              if (getMonthSchoolList.data.dataList.length && !getMonthSchoolList.data.dataList.length ==0) {
                this.page += 1
              } else {
                this.loadMore = false
              }
              this.getMonthList = getMonthSchoolList.data.dataList
              this.btmMonSchollNum = getMonthSchoolList.data.schoolNum
              this.btmMonStudentNum = getMonthSchoolList.data.studentNum
              this.btmMonPassNum = getMonthSchoolList.data.openRate
              this.btmMonUserNum = getMonthSchoolList.data.adduserNum
              this.$apply()
            }
            break;
          default:
            break;
        }
        this.$apply();
      }

    },







    async bindChange(e) {
      console.log('bingCHANGE', e)
      if (this.userType == '5') { return }
      this.currentTab = e.detail.current
      this.loadMore = true
      this.page = 1
      let params = {}
      params.schoolId = this.schoolId
      params.userType = this.userType
      params.userId = wepy.getStorageSync('userId')
      params.selectType = this.selectType
      params.logdate = this.selectDate
      params.operaType = this.operaType
      if (this.a.length > 0 && this.selecTakeArea == true) {
        params.regionId = this.a
        params.regionLevel = this.regionLevel
        params.regionManager = ''
      } else if(this.a.length >0 && this.selecHeadPeo == true) {
        params.regionManager = this.a
        params.regionId = ''
        params.regionLevel = ''
      } else if (this.a.length == 0) {
        params.regionId = ''
        params.regionLevel = ''
        params.regionManager = ''
      }
      if (this.currentTab == '0') {
        this.selectDate = util.getBeforDay(new Date())
        params.reportType = '1'
        params.pageIndex = this.page
        params.pageSize  = this.size
        this.getDayList = []
        this.getWeekList = []
        this.getMonthList = []
        let getSchoolList = await api.getSchoolList({method: 'POST',data:params})
        this.getDayList = getSchoolList.data.dataList
        this.btomSchollNum = getSchoolList.data.schoolNum
        this.btomStudentNum = getSchoolList.data.studentNum
        this.btomPassNum = getSchoolList.data.openRate
        this.btomUserNum = getSchoolList.data.adduserNum
        if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length == 0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.$apply()
      } else if (this.currentTab == '1') {
        if (this.toCurrentTab == '1') {
          return false
        }
        else {
          let splitWeek = this.pickerWeekArr[this.weekIndex].split('@')
          this.str = splitWeek[1]
          params.reportType = '2'
          params.pageIndex = this.page
          params.pageSize  = this.size
          params.logdate = splitWeek[0]
          this.getDayList = []
          this.getWeekList = []
          this.getMonthList = []
          let getWeekSchoolList = await api.getSchoolList({method:'POST',data:params})
          this.getWeekList = getWeekSchoolList.data.dataList
          this.btmWeekSchollNum = getWeekSchoolList.data.schoolNum
          this.btmWeekStudentNum = getWeekSchoolList.data.studentNum
          this.btmWeekPassNum = getWeekSchoolList.data.openRate
          this.btmWeekUserNum = getWeekSchoolList.data.adduserNum
          if (getWeekSchoolList.data.dataList && !getWeekSchoolList.data.dataList.length ==0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          this.$apply()
        }
      } else if (this.currentTab == '2') {
        if (this.toCurrentTab == '2' ) {
          return false
        } else {
          this.monthInit = util.getCurrentMonth(new Date())
          let time = util.getCurrentMonth(new Date())
          let splitMonth = this.monthInit.split('-')
          params.reportType = '3'
          params.pageIndex = this.page
          params.pageSize  = this.size
          if (this.monthInit == time) {
            params.logdate = util.getBeforDay(new Date())
            console.log(params.logdate)
          } else if (splitMonth[1] == '01' || splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
            params.logdate = this.monthInit + '-31'
          } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
            params.logdate = this.monthInit + '-30'
            console.log(params.logdate)
          } else if (splitMonth[1] == '02') {
            if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
              params.logdate = this.monthInit + '-29'
            } else {
              params.logdate = this.monthInit + '-28'
            }
          }
          this.getDayList = []
          this.getWeekList = []
          this.getMonthList = []
          let getMonthSchoolList = await api.getSchoolList({method: 'POST', data: params})
          if (getMonthSchoolList.data.dataList && !getMonthSchoolList.data.dataList.length ==0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          this.getMonthList = getMonthSchoolList.data.dataList
          this.btmMonSchollNum = getMonthSchoolList.data.schoolNum
          this.btmMonStudentNum = getMonthSchoolList.data.studentNum
          this.btmMonPassNum = getMonthSchoolList.data.openRate
          this.btmMonUserNum = getMonthSchoolList.data.adduserNum
          this.$apply()
        }
      }
    },
    async bindSortChange(e) {
      if (this.userType == '5') { return }
      this.sortIndex = e.detail.value
      this.loadMore = true
      this.page = 1
      let params = {}
      params.schoolId = this.schoolId
      params.userId = wepy.getStorageSync('userId')
      params.operaType =this.operaType
      params.userType = this.userType
      if (this.quanJuRegionId.length > 0 && this.selecTakeArea == true) {
        params.regionId = this.quanJuRegionId
        params.regionLevel = this.regionLevel
        params.regionManager = ''
      } else if (this.quanJuRegionId.length > 0 && this.selecHeadPeo == true) {
        params.regionManager = this.quanJuRegionId
        params.regionId = ''
        params.regionLevel = ''
      } else if (this.a.length == 0) {
        params.regionId = ''
        params.regionLevel = ''
        params.regionManager = ''
      }
      if (e.detail.value == 0) {
        params.selectType = '1'
        this.selectType = '1'
      } else if (e.detail.value == 1) {
        params.selectType = '2'
        this.selectType = '2'
      } else if (e.detail.value == 2) {
        params.selectType = '3'
        this.selectType = '3'
      } else if (e.detail.value == 3) {
        params.selectType = '4';
        this.selectType = '4'
      }

      if (this.currentTab == '0') {
        params.reportType = '1'
        params.logdate = this.selectDate
        let getSchoolList = await api.getAfterFilterList({method: 'POST', data: params})
        if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length ==0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.getDayList = getSchoolList.data.dataList
        this.$apply()
      } else if (this.currentTab == '1') {
        let splitWeek = this.pickerWeekArr[this.weekIndex].split('@')
        params.reportType = '2'
        params.logdate = splitWeek[0]
        let getSchoolList = await api.getAfterFilterList({method: 'POST', data: params})
        if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length ==0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.getWeekList = getSchoolList.data.dataList
        this.$apply()
      }
      else if (this.currentTab == '2') {
        params.reportType = '3'
        let time = util.getCurrentMonth(new Date())
        if (this.monthInit == time) {
          params.logdate = util.getBeforDay(new Date())
        } else {
          let splitMonth = this.monthInit.split('-')
          if (splitMonth[1] == '01' || splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
            params.logdate = this.monthInit + '-31'
          } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
            params.logdate = this.monthInit + '-30'
          } else if (splitMonth[1] == '02') {
            if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
              params.logdate = this.monthInit + '-29'
            } else {
              params.logdate = this.monthInit + '-28'
            }
          }
        }
        let getSchoolList = await api.getSchoolList({method: 'POST', data: params})
        if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length ==0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.getMonthList = getSchoolList.data.dataList
        this.$apply()
      }
    },
    searchSchoo() {
      if (this.userType == '5') { return }
      let showDate
      let searchDate
      let regionLevel
      let regionId
      let regionManager
      this.toCurrentTab = this.currentTab
      if (this.selecHeadPeo == true && this.a.length > 0) {
        regionManager = this.a
        regionLevel = ''
        regionId = ''
      }else if (this.selecTakeArea == true && this.a.length > 0) {
        regionId = this.a
        regionLevel = this.regionLevel
        regionManager = ''
      }
      if (this.currentTab == '0') {
        searchDate = this.selectDate
        showDate = this.selectDate
      } else if (this.currentTab == '1') {
        let splitWeekDate = this.pickerWeekArr[this.weekIndex].split('@')
        searchDate = splitWeekDate[0]
        showDate = splitWeekDate[1]
      } else if (this.currentTab == '2') {
        let time = util.getCurrentMonth(new Date())
        showDate = this.monthInit
        let splitMonth = this.monthInit.split('-')
        if (this.monthInit == time) {
          searchDate = util.getBeforDay(new Date())
        } else if (splitMonth[1] == '01'||splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
          searchDate = this.monthInit+'-31'
        } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
          searchDate = this.monthInit+'-30'
        } else if (splitMonth[1] == '02') {
          if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
            searchDate = this.monthInit + '-29'
          } else {
            searchDate = this.monthInit + '-28'
          }
        }
      }
      wepy.navigateTo({url: '../pages/search?page_url=/pages/schoolList&page=2&toCurrentTab=' + this.toCurrentTab + '&searchDate=' + searchDate + '&regionLevel=' + regionLevel + '&regionId=' + regionId + '&regionManager=' + regionManager + '&showDate=' + showDate})
    },


    async bindDateChange(e) {
      this.loadMore = true
      if (this.userType == '5') { return }
      this.selectDate = e.detail.value
      let params = {}
      params.schoolId = this.schoolId
      params.userId = wepy.getStorageSync('userId')
      params.userType = this.userType
      params.selectType = this.selectType
      // params.userId = 1790
      params.operaType = this.operaType
      params.reportType = '1'
      params.logdate = this.selectDate
      if (this.a.length > 0 && this.selecTakeArea == true) {
        params.regionId = this.a
        params.regionLevel = this.regionLevel
        params.regionManager = ''
      } else if (this.a.length > 0 && this.selecHeadPeo == true) {
        params.regionManager = this.a
        params.regionId = ''
        params.regionLevel = ''
      } else if (this.a.length == 0) {
        params.regionId = ''
        params.regionLevel = ''
        params.regionManager = ''
      }
      //  请求数据
      let getSchoolList = await api.getSchoolList({method: 'POST', data: params})
      if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length ==0) {
        this.page += 1
      } else {
        this.loadMore = false
      }
      this.getDayList = []
      this.getWeekList = []
      this.getMonthList = []
      this.getDayList = getSchoolList.data.dataList
      this.btomSchollNum = getSchoolList.data.schoolNum
      this.btomStudentNum = getSchoolList.data.studentNum
      this.btomPassNum = getSchoolList.data.openRate
      this.btomUserNum = getSchoolList.data.adduserNum
      this.$apply()
    },
    async bindWeekChange(e) {
      this.loadMore = true
      if (this.userType == '5') { return }
      this.weekIndex = e.detail.value
      for (let i = 0; i < this.pickerWeekArr.length; i++) {
        if (i == e.detail.value) {
          var str = this.pickerWeekArr[i].split('@')
        }
      }
      // 被选后显示的数据
      this.str = str[1]
      // 获取按周的学校数据
      let params = {}
      params.schoolId = this.schoolId
      params.userId = wepy.getStorageSync('userId')
      // params.userId = 1790
      params.userType = this.userType
      params.operaType = this.operaType
      params.reportType = '2'
      params.selectType = this.selectType
      params.logdate = str[0]
      if (this.a.length > 0 && this.selecTakeArea == true) {
        params.regionId = this.a
        params.regionLevel = this.regionLevel
        params.regionManager = ''
      } else if (this.a.length > 0 && this.selecHeadPeo == true) {
        params.regionManager = this.a
        params.regionId = ''
        params.regionLevel = ''
      } else if (this.a.length == 0) {
        params.regionId = ''
        params.regionLevel = ''
        params.regionManager = ''
      }
      let getSchoolList = await api.getSchoolList({method: 'POST', data: params})
      if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length ==0) {
        this.page += 1
      } else {
        this.loadMore = false
      }
      this.getWeekList = getSchoolList.data.dataList
      this.btmWeekSchollNum = getSchoolList.data.schoolNum
      this.btmWeekStudentNum = getSchoolList.data.studentNum
      this.btmWeekPassNum = getSchoolList.data.openRate
      this.btmWeekUserNum = getSchoolList.data.adduserNum
      this.$apply()
    },
    async bindMonthChange(e) {
      this.loadMore = true
      if (this.userType == '5') { return }
      // 要传给后台的参数值
      let params = {}
      params.schoolId = this.schoolId
      params.selectType = this.selectType
      params.userId = wepy.getStorageSync('userId')
      // params.userId = 1790
      params.operaType = this.operaType
      params.userType = this.userType
      params.reportType = '3'
      if (this.a.length > 0 && this.selecTakeArea == true) {
        params.regionId = this.a
        params.regionLevel = this.regionLevel
        params.regionManager = ''
      } else if (this.a.length > 0 && this.selecHeadPeo == true) {
        params.regionManager = this.a
        params.regionId = ''
        params.regionLevel = ''
      } else if (this.a.length == 0) {
        params.regionId = ''
        params.regionLevel = ''
        params.regionManager = ''
      }
      // 被选后显示的月份日期
      this.monthInit = e.detail.value
      // 获取当前月份
      let time = util.getCurrentMonth(new Date())
      // 如果当前月份等于被选的月份，那么传给后台的日期就是当前日期的前一天日期
      if (this.monthInit == time) {
        params.logdate = util.getBeforDay(new Date())
        // 获取按月的学校数据
        let getSchoolList = await api.getSchoolList({method: 'POST', data: params})
        this.getMonthList = getSchoolList.data.dataList
        this.btmMonSchollNum = getSchoolList.data.schoolNum
        this.btmMonStudentNum = getSchoolList.data.studentNum
        this.btmMonPassNum = getSchoolList.data.openRate
        this.btmMonUserNum = getSchoolList.data.adduserNum
        this.$apply()
      } else {
        let splitMonth = this.monthInit.split('-')
        if (splitMonth[1] == '01' || splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
          params.logdate = this.monthInit + '-31'
        } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
          params.logdate = this.monthInit + '-30'
        } else if (splitMonth[1] == '02') {
          if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
            params.logdate = this.monthInit + '-29'
          } else {
            params.logdate = this.monthInit + '-28'
          }
        }
        if (this.a.length > 0 && this.selecTakeArea == true) {
          params.regionId = this.a
          params.regionLevel = this.regionLevel
          params.regionManager = ''
        } else if (this.a.length > 0 && this.selecHeadPeo == true) {
          params.regionManager = this.a
          params.regionId = ''
          params.regionLevel = ''
        } else if (this.a.length == 0) {
          params.regionId = ''
          params.regionLevel = ''
          params.regionManager = ''
        }
        // 获取按月的学校数据
        let getSchoolList = await api.getSchoolList({method: 'POST', data: params})
        if (getSchoolList.data.dataList && !getSchoolList.data.dataList.length ==0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.getMonthList = getSchoolList.data.dataList
        this.btmMonSchollNum = getSchoolList.data.schoolNum
        this.btmMonStudentNum = getSchoolList.data.studentNum
        this.btmMonPassNum = getSchoolList.data.openRate
        this.btmMonUserNum = getSchoolList.data.adduserNum
        this.$apply()
      }
    },
    async filter(e) { // 点击筛选事件
      console.log('筛选筛选筛选');

      if (this.userType == '4' || this.userType == '5') { return }
      let animation = wepy.createAnimation({// 创建动画
        duration: 1000,
        timingFunction: 'ease',
        width: 300,
        height: 800,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        opcity: 0.5
      })
      this.animation = animation
      animation.translateX(-100 + 'vh').step()
      this.nimationData = animation.export()
      this.show = true
    },
    selectHeadPeople() {
      this.selecTakeArea = false
      this.cityChose = false
      this.cityShow = false
      this.postCityId = []
      this.postAreaId = []
      this.areaList = []
      if (this.selecHeadPeo == true) {
        // this.busiManager = true
      } else {
        this.selecHeadPeo = true
        // 判断区域经理是否有数据
        if (this.areaManagerList.data.length > 0) {
          this.areaManagerShow = true
          // 判断业务经理是否有数据
          if (this.busiPeoList.length > 0) {
            this.busiManager = true
          } else {
            this.busiManager = false
          }
        } else {
          this.areaManagerShow = false
        }
      }
    },
    async selectTakeAreas() {
      this.selecHeadPeo = false
      this.areaManagerShow = false
      this.busiManager = false
      if (this.selecTakeArea == false) {
        this.selecTakeArea = true
        let userId = wepy.getStorageSync('userId')
        let userType = wepy.getStorageSync('userType')
        let getCity = await api.getCityNew({
          data: {
            userType: this.userType,
            userId: userId
          }
        })
        this.cityList = getCity.data
        for (var i = 0; i < this.cityList.data.length; i++) {
          this.cityList.data[i].status = 0
        }
        let cityList = this.cityList.data
        this.$apply()
        // 判断城市列表是否有数据，有数据就设置 this.cityShow=true;
        if (cityList.length > 0) {
          this.cityShow = true
          // 判断数据中是否有status == '1'的，如果有，就要显示县区列表
          let that = this
          cityList.forEach(function (e) {
            if (e.status === 1) {
              that.cityChose = true
            }
          })
          this.$apply()
        } else {
          this.cityShow = false
        }
      }
    },
    async seleOnePeo(e) {
      this.loadMore = true
      this.postAreaManagerId = []
      if (e.currentTarget.dataset.status === 0) {
        for (let i = 0; i < this.areaManagerList.data.length; i++) {
          this.areaManagerList.data[i].status = 0
        }
        this.busiPeoList = []
        this.areaManagerList.data[e.currentTarget.dataset.index].status = 1
        this.postAreaManagerId.push(e.currentTarget.dataset.id)
        this.quanJuRegionId = this.postAreaManagerId
        this.reagionId = e.currentTarget.dataset.id
        this.regionLevel = e.currentTarget.dataset.regionlevel
        this.areaManUserId = e.currentTarget.dataset.user
        console.log(e.currentTarget.dataset.id)

        // 拿到被点击的id请求业务经理的数据，如果获取到有数据设置 this.busiManager=true;
        let getBusiManager = await api.getBusiManagerNew({
          data: {
            regionId: e.currentTarget.dataset.id
          }
        })
        let getBusiManagerArr = getBusiManager.data.data
        console.log(getBusiManagerArr)
        if (getBusiManagerArr.length > 0) {
          this.busiManager = true
        } else {
          this.busiManager = false
        }
        let that = this
        getBusiManagerArr.forEach(function (e) {
          that.busiPeoList.push(e)
        })
        for (let i = 0; i < this.busiPeoList.length; i++) {
          that.busiPeoList[i].status = 0
        }
        this.$apply()
      } else {
        this.areaManagerList.data[e.currentTarget.dataset.index].status = 0
        this.postAreaManagerId = []
        this.postBusiManagerId = []
        this.busiManager = false
        this.$apply()
      }
    },
    seleBusiPeo(e) {
      this.loadMore = true
      this.postBusiManagerId = []
      if (e.currentTarget.dataset.status === 0) {
        for (var i = 0; i < this.busiPeoList.length; i++) {
          this.busiPeoList[i].status = 0
        }
        this.busiPeoList[e.currentTarget.dataset.index].status = 1
        this.postBusiManagerId.push(e.currentTarget.dataset.id)
        this.quanJuRegionId = this.postBusiManagerId
        this.regionLevel = e.currentTarget.dataset.regionlevel
        this.areaManUserId = e.currentTarget.dataset.user
        this.regionId = e.currentTarget.dataset.id
        console.log(this.postBusiManagerId)
        this.$apply()
      } else {
        this.busiPeoList[e.currentTarget.dataset.index].status = 0
        this.postBusiManagerId = []
        this.$apply()
      }
    },
    async seleCity(e) {
      this.loadMore = true
      if (e.currentTarget.dataset.status === 0) {
        let that = this
        this.cityList.data[e.currentTarget.dataset.index].status = 1
        this.postCityId.push(e.currentTarget.dataset.id)
        this.quanJuRegionId = this.postCityId
        console.log(e.currentTarget)
        this.cityRegionLevel = e.currentTarget.dataset.regionlevel
        console.log(this.cityRegionLevel)
        console.log(this.postCityId)
        let userId = wepy.getStorageSync('userId')
        let userType = wepy.getStorageSync('userType')
        let getAreaList = await api.getAreaNew({method: 'POST', data: {userId: userId, userType: this.userType, regionId: e.currentTarget.dataset.id}})
        console.log(getAreaList)
        // let getAreaList = city.children
        this.getAreaList = getAreaList.data.data
        if (this.getAreaList.length > 0) {
          this.cityChose = true
        } else {
          this.cityChose = false
        }
        for (var i = 0; i < this.getAreaList.length; i++) {
          this.getAreaList[i].status = 0
        }
        this.getAreaList.forEach(function (e) {
          that.areaList.push(e)
        })
        this.$apply()
      } else {
        let that = this
        this.cityList.data[e.currentTarget.dataset.index].status = 0
        // 拿到被点击数据遍历总数组，从中去掉
        Array.prototype.aindexOf = function(val) {
          for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i
          }
          return -1
        }
        Array.prototype.remove = function(val) {
          let index = this.aindexOf(val)
          if (index > -1) {
            this.splice(index, 1)
          }
        }
        this.postCityId.remove(e.currentTarget.dataset.id)
        console.log(this.postCityId)

        let cityListArr = this.cityList.data
        let city
        for (let i in cityListArr) {
          if (cityListArr[i].id == e.currentTarget.dataset.id) {
            city = cityListArr[i]
            break
          }
        }

        let userId = wepy.getStorageSync('userId')
        let userType = wepy.getStorageSync('userType')
        let getAreaList = await api.getAreaNew({method: 'POST', data: {userId: userId, userType: this.userType, regionId: e.currentTarget.dataset.id}})
        let getAreaListArr= getAreaList.data.data
        getAreaListArr.forEach(function (e) {
          let id = e.regionId
          that.areaList = that.areaList.filter(function (obj) {
            return id !== obj.regionId
          })
        })

        getAreaListArr.forEach(function (e) {
          let id = e.regionId
          that.postAreaId = that.postAreaId.filter(function (obj) {
            return id !== obj
          })
        })
        console.log(this.postAreaId)

        if (this.areaList.length < 1) {
          that.cityChose = false
        } else {
          that.cityChose = true
        }
        this.$apply()
      }
    },
    selectArea(e) {
      this.loadMore = true
      if (e.currentTarget.dataset.status === 0) {
        this.areaList[e.currentTarget.dataset.index].status = 1
        this.postAreaId.push(e.currentTarget.dataset.id)
        this.quanJuRegionId = this.postAreaId
        console.log(this.postAreaId)
        this.$apply()
      } else {
        Array.prototype.aindexOf = function(val) {
          for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i
          }
          return -1
        }
        Array.prototype.remove = function(val) {
          let index = this.aindexOf(val)
          if (index > -1) {
            this.splice(index, 1)
          }
        }
        this.postAreaId.remove(e.currentTarget.dataset.id)
        console.log(this.postAreaId)

        this.areaList[e.currentTarget.dataset.index].status = 0
        this.$apply()
      }
    },
    cancelBton () {
      this.show = false
    },
    async sureBton() {
      this.page = 1
      this.loadMore = true
      let params = {}
      params.schoolId = this.schoolId
      params.userId = wepy.getStorageSync('userId')
      params.userType = this.userType
      params.selectType = this.selectType
      if (this.currentTab == '0') {
        params.reportType = '1'
        params.logdate = this.selectDate
      } else if (this.currentTab == '1') {
        let splitWeek = this.pickerWeekArr[this.weekIndex].split('@')
        params.reportType = '2'
        params.logdate = splitWeek[0]
      } else if (this.currentTab == '2') {
        params.reportType = '3'
        let time = util.getCurrentMonth(new Date())
        if (this.monthInit == time) {
          params.logdate = util.getBeforDay(new Date())
          console.log(params.logdate)
        } else {
          let splitMonth = this.monthInit.split('-')
          if (splitMonth[1] == '01' || splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
            params.logdate = this.monthInit + '-31'
            // console.log(params.logdate)
          } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
            params.logdate = this.monthInit + '-30'
            console.log(params.logdate)
          } else if (splitMonth[1] == '02') {
            if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
              params.logdate = this.monthInit + '-29'
            } else {
              params.logdate = this.monthInit + '-28'
            }
            console.log(params.logdate)
          }
        }
      }
      if (this.selecTakeArea == true) {
        if (this.postCityId.length <= 0) {
          this.a = []
          this.isFilter = false
          this.show = false
          params.regionId = ''
          params.regionLevel = ''
          params.regionManager = ''
          params.operaType = 6
          this.operaType = 6
          let afterFiterList = await api.getSchoolList({method: 'POST', data: params})
          if (afterFiterList.data.dataList && !afterFiterList.data.dataList.length == 0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          if (this.currentTab == '0') {
            this.getDayList = afterFiterList.data.dataList
            this.show = false
            this.btomSchollNum = afterFiterList.data.schoolNum
            this.btomStudentNum = afterFiterList.data.studentNum
            this.btomPassNum = afterFiterList.data.openRate
            this.btomUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '1') {
            this.getWeekList = afterFiterList.data.dataList
            this.show = false
            this.btmWeekSchollNum = afterFiterList.data.schoolNum
            this.btmWeekStudentNum = afterFiterList.data.studentNum
            this.btmWeekPassNum = afterFiterList.data.openRate
            this.btmWeekUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '2') {
            this.getMonthList = afterFiterList.data.dataList
            this.show = false
            this.btmMonSchollNum = afterFiterList.data.schoolNum
            this.btmMonStudentNum = afterFiterList.data.studentNum
            this.btmMonPassNum = afterFiterList.data.openRate
            this.btmMonUserNum = afterFiterList.data.adduserNum
            this.$apply()
          }
          this.$apply()
        } else if (this.postCityId.length > 0 && this.postAreaId.length > 0) {
          this.a = this.postAreaId
          this.isFilter = true
          params.regionId = this.postAreaId
          this.quanJuRegionId = this.postAreaId
          params.regionLevel = this.cityRegionLevel
          params.regionManager = ''
          params.operaType = 4
          this.operaType = 4
          let afterFiterList = await api.getAfterFilterList({method: 'POST', data: params})
          if (afterFiterList.data.dataList && !afterFiterList.data.dataList.length == 0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          if (this.currentTab == '0') {
            this.getDayList = afterFiterList.data.dataList
            this.show = false
            this.btomSchollNum = afterFiterList.data.schoolNum
            this.btomStudentNum = afterFiterList.data.studentNum
            this.btomPassNum = afterFiterList.data.openRate
            this.btomUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '1') {
            this.getWeekList = afterFiterList.data.dataList
            this.show = false
            this.btmWeekSchollNum = afterFiterList.data.schoolNum
            this.btmWeekStudentNum = afterFiterList.data.studentNum
            this.btmWeekPassNum = afterFiterList.data.openRate
            this.btmWeekUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '2') {
            this.getMonthList = afterFiterList.data.dataList
            this.show = false
            this.btmMonSchollNum = afterFiterList.data.schoolNum
            this.btmMonStudentNum = afterFiterList.data.studentNum
            this.btmMonPassNum = afterFiterList.data.openRate
            this.btmMonUserNum = afterFiterList.data.adduserNum
            this.$apply()
          }
        } else if (this.postCityId.length > 0 && this.postAreaId.length <= 0) {

          let that = this
          let areaReginonId = []
          this.areaList.forEach(function (e) {
            console.log(e)
            areaReginonId.push(e.regionId)
          })
          // this.a = this.postCityId
          // console.log(this.areaList.length)
          if (this.areaList.length > 0) {
            params.regionId = areaReginonId
            this.quanJuRegionId = areaReginonId
          } else {
            params.regionId = this.postCityId
            this.quanJuRegionId = this.postCityId
          }
          this.a = areaReginonId
          console.log(this.a)
          this.isFilter = true
          this.regionLevel = this.cityRegionLevel
          // params.regionId = areaReginonId
          params.regionLevel = this.regionLevel
          params.regionManager = ''
          params.operaType = 3
          this.operaType = 3
          let afterFiterList = await api.getAfterFilterList({method: 'POST', data: params})
          if (afterFiterList.data.dataList && !afterFiterList.data.dataList.length == 0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          if (this.currentTab == '0') {
            this.getDayList = afterFiterList.data.dataList
            this.show = false
            this.btomSchollNum = afterFiterList.data.schoolNum
            this.btomStudentNum = afterFiterList.data.studentNum
            this.btomPassNum = afterFiterList.data.openRate
            this.btomUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '1') {
            this.getWeekList = afterFiterList.data.dataList
            this.show = false
            this.btmWeekSchollNum = afterFiterList.data.schoolNum
            this.btmWeekStudentNum = afterFiterList.data.studentNum
            this.btmWeekPassNum = afterFiterList.data.openRate
            this.btmWeekUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '2') {
            this.getMonthList = afterFiterList.data.dataList
            this.show = false
            this.btmMonSchollNum = afterFiterList.data.schoolNum
            this.btmMonStudentNum = afterFiterList.data.studentNum
            this.btmMonPassNum = afterFiterList.data.openRate
            this.btmMonUserNum = afterFiterList.data.adduserNum
            this.$apply()
          }
        }
      } else if (this.selecHeadPeo == true) {
        if (this.postAreaManagerId.length <= 0) {
          this.a = []
          this.show = false
          params.regionId = ''
          params.regionLevel = ''
          params.regionManager = ''
          params.operaType = 6
          this.operaType = 6
          let afterFiterList = await api.getSchoolList({method: 'POST', data: params})
          if (afterFiterList.data.dataList && !afterFiterList.data.dataList.length == 0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          if (this.currentTab == '0') {
            this.getDayList = afterFiterList.data.dataList
            this.show = false
            this.btomSchollNum = afterFiterList.data.schoolNum
            this.btomStudentNum = afterFiterList.data.studentNum
            this.btomPassNum = afterFiterList.data.openRate
            this.btomUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '1') {
            this.getWeekList = afterFiterList.data.dataList
            this.show = false
            this.btmWeekSchollNum = afterFiterList.data.schoolNum
            this.btmWeekStudentNum = afterFiterList.data.studentNum
            this.btmWeekPassNum = afterFiterList.data.openRate
            this.btmWeekUserNum = afterFiterList.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '2') {
            this.getMonthList = afterFiterList.data.dataList
            this.show = false
            this.btmMonSchollNum = afterFiterList.data.schoolNum
            this.btmMonStudentNum = afterFiterList.data.studentNum
            this.btmMonPassNum = afterFiterList.data.openRate
            this.btmMonUserNum = afterFiterList.data.adduserNum
            this.$apply()
          }
        } else if (this.postAreaManagerId.length > 0 && this.postBusiManagerId.length > 0) {
          // this.useAreaManagerFilter = true
          this.a = this.postBusiManagerId
          params.regionManager = this.postBusiManagerId
          params.regionId = this.reagionId
          params.regionLevel = this.regionLevel
          params.operaType = 2
          this.operaType = 2
          params.userType = this.userType // 当选择是区域经理时，userType暂时为1
          params.userId = this.areaManUserId
          let afterManagerFiter = await api.getAfterManagerFiter({method: 'POST', data: params})
          if (afterManagerFiter.data.dataList && !afterManagerFiter.data.dataList.length == 0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          console.log(afterManagerFiter)
          if (this.currentTab == '0') {
            this.getDayList = afterManagerFiter.data.dataList
            this.show = false
            this.btomSchollNum = afterManagerFiter.data.schoolNum
            this.btomStudentNum = afterManagerFiter.data.studentNum
            this.btomPassNum = afterManagerFiter.data.openRate
            this.btomUserNum = afterManagerFiter.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '1') {
            this.getWeekList = afterManagerFiter.data.dataList
            this.show = false
            this.btmWeekSchollNum = afterManagerFiter.data.schoolNum
            this.btmWeekStudentNum = afterManagerFiter.data.studentNum
            this.btmWeekPassNum = afterManagerFiter.data.openRate
            this.btmWeekUserNum = afterManagerFiter.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '2') {
            this.getMonthList = afterManagerFiter.data.dataList
            this.show = false
            this.btmMonSchollNum = afterManagerFiter.data.schoolNum
            this.btmMonStudentNum = afterManagerFiter.data.studentNum
            this.btmMonPassNum = afterManagerFiter.data.openRate
            this.btmMonUserNum = afterManagerFiter.data.adduserNum
            this.$apply()
          }
        } else if (this.postAreaManagerId.length > 0 && this.postBusiManagerId.length <= 0) {
          // this.useAreaManagerFilter=true
          this.a = this.postAreaManagerId
          params.userType = this.userType// 当选择是区域经理时，userType暂时为1
          params.regionManager = this.postAreaManagerId
          params.regionId = this.reagionId
          params.regionLevel = this.regionLevel
          params.userId = this.areaManUserId
          params.operaType = 1
          this.operaType = 1
          let afterManagerFiter = await api.getAfterManagerFiter({method: 'POST', data: params})
          if (afterManagerFiter.data.dataList && !afterManagerFiter.data.dataList.length == 0) {
            this.page += 1
          } else {
            this.loadMore = false
          }
          if (this.currentTab == '0') {
            this.getDayList = afterManagerFiter.data.dataList
            this.show = false
            this.btomSchollNum = afterManagerFiter.data.schoolNum
            this.btomStudentNum = afterManagerFiter.data.studentNum
            this.btomPassNum = afterManagerFiter.data.openRate
            this.btomUserNum = afterManagerFiter.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '1') {
            this.getWeekList = afterManagerFiter.data.dataList
            this.show = false
            this.btmWeekSchollNum = afterManagerFiter.data.schoolNum
            this.btmWeekStudentNum = afterManagerFiter.data.studentNum
            this.btmWeekPassNum = afterManagerFiter.data.openRate
            this.btmWeekUserNum = afterManagerFiter.data.adduserNum
            this.$apply()
          } else if (this.currentTab == '2') {
            this.getMonthList = afterManagerFiter.data.dataList
            this.show = false
            this.btmMonSchollNum = afterManagerFiter.data.schoolNum
            this.btmMonStudentNum = afterManagerFiter.data.studentNum
            this.btmMonPassNum = afterManagerFiter.data.openRate
            this.btmMonUserNum = afterManagerFiter.data.adduserNum
            this.$apply()
          }
        }
      }
    },
    async toDetial(e) {
      let reportType = ''
      let logdate = ''
      if (this.currentTab == '0') {
        reportType = 1
        logdate = this.selectDate
      } else if (this.currentTab == '1') {
        reportType = 2
        logdate = this.weekIndex
      } else if (this.currentTab == '2') {
        reportType = 3
        logdate = this.monthInit
      }
      await wepy.navigateTo({url: '../pages/schoolDetail?id=' + e.currentTarget.dataset.id + '&reportType=' + reportType + '&logdate=' + logdate})
    },
    cleanSchool() {
      this.schoolId = ''
      this.$apply()
    },
    async loadMoreData (e) {
      let userId = wepy.getStorageSync('userId')
      let loadMoreParams = {}
      loadMoreParams.userType = this.userType
      loadMoreParams.selectType = this.selectType
      if(this.operaType == '4' || this.operaType == '3' ) {
        loadMoreParams.userId = this.areaManUserId
      }else {
        loadMoreParams.userId = userId
      }
      if (this.operaType == '1') {
        loadMoreParams.regionLevel = this.regionLevel
      }else{
        loadMoreParams.regionLevel = ''
      }
      loadMoreParams.regionManager = ''
      loadMoreParams.operaType = this.operaType
      loadMoreParams.regionId = this.quanJuRegionId
      loadMoreParams.schoolId = this.schoolId
      loadMoreParams.pageIndex = this.page
      loadMoreParams.pageSize  = this.size
      if (this.currentTab == '0') {
        loadMoreParams.reportType = 1
        loadMoreParams.logdate = this.selectDate
        let loadMoreData = await api.getSchoolList({method: 'POST', data: loadMoreParams})
        console.log(loadMoreData.data.dataList)
        this.getDayList = this.getDayList.concat(loadMoreData.data.dataList)
        console.log(loadMoreData.data.dataList.length)
        if (loadMoreData.data.dataList && !loadMoreData.data.dataList.length == 0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.$apply()
      } else if (this.currentTab == '1') {
        let splitWeek = this.pickerWeekArr[this.weekIndex].split('@')
        loadMoreParams.logdate = splitWeek[0]
        loadMoreParams.reportType = 2
        let loadMoreData = await api.getSchoolList({method: 'POST', data: loadMoreParams})
        this.getWeekList = this.getWeekList.concat(loadMoreData.data.dataList)
        if (loadMoreData.data.dataList && !loadMoreData.data.dataList.length == 0) {
          this.page += 1
        } else {
          this.loadMore = false
        }
        this.$apply()
      }else if (this.currentTab == '2') {
        loadMoreParams.reportType = 2
        let time = util.getCurrentMonth(new Date())
        if (this.monthInit == time) {
          loadMoreParams.logdate = util.getBeforDay(new Date())
        } else {
          let splitMonth = this.monthInit.split('-')
          if (splitMonth[1] == '01' || splitMonth[1] == '03' || splitMonth[1] == '05' || splitMonth[1] == '07' || splitMonth[1] == '08' || splitMonth[1] == '10' || splitMonth[1] == '12') {
            loadMoreParams.logdate = this.monthInit + '-31'
            // console.log(loadMoreParams.logdate)
          } else if (splitMonth[1] == '04' || splitMonth[1] == '06' || splitMonth[1] == '09' || splitMonth[1] == '11') {
            loadMoreParams.logdate = this.monthInit + '-30'
            console.log(loadMoreParams.logdate)
          } else if (splitMonth[1] == '02') {
            if ((splitMonth[0] % 4 == 0) && (splitMonth[0] % 100 != 0 || splitMonth[0] % 400 == 0)) {
              loadMoreParams.logdate = this.monthInit + '-29'
            } else {
              loadMoreParams.logdate = this.monthInit + '-28'
            }
            console.log(loadMoreParams.logdate)
          }
        }
        let loadMoreData = await api.getSchoolList({method: 'POST', data: loadMoreParams})
        this.getMonthList = this.getMonthList.concat(loadMoreData.data.dataList)
        if (loadMoreData.data.dataList && !loadMoreData.data.dataList.length == 0){
          this.page += 1
          if (loadMoreData.data.dataList.length < this.size) {
            this.loadMore = false
          }
        } else {
          this.loadMore = false
        }
        this.$apply()
      }
    }
  }
}