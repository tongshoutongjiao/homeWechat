import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import sliderFilter from '../components/slider-filter/slider-filter';

export default class Index extends wepy.page {
  components = {
    'filter-slider': sliderFilter
  };

  config = {
    navigationBarTitleText: '学校列表'
  };
  data = {
    schoolId: '',
    currentTab: '0',
    initMonthDate: '',// 初始化月份信息
    selectDate: {
      value: '',
    },// 顶部选择框中的值
    monthData: {
      value: '',
      requestValue: '',// 月份请求值
    },
    weekInfo: {
      index: 0,
      weekData: []
    },// 用户选择的周信息
    rankInfo: {
      index: '0',
      rankArray: []
    },// 排序中的值
    curItemIndex: '0',// 当前swiper的index
    ajaxData: {
      schoolId: '',//
      userId: '',
      userType: '',// 用户类型
      operaType: '6',//
      reportType: '1',// 日周月类型
      selectType: '',// 排序类型
      pageIndex: '1',// 页码
      pageSize: '10',// 每页显示的个数
      logdate: '',// 具体日期
      regionManager: '',
      regionId: '',
      regionLevel: '',
    },
    schoolInfo: {
      searchFlag: true,
    },// 选中的学校信息
    countData: {
      schoolNum: '',
      studentNum: '',
      openRate: '',
      adduserNum: ''
    },// 底部统计数据
    schoolListData: [],
    pageData: false,
  };

  events = {

    'filter-confirm': (e, ret) => {
      console.log(e, ret);

      // 判断是按照区域还是按负责人
      if (ret.type < 2) {
        console.log('按照负责人排序');
        this.ajaxData.regionManager = ret.selectedItems.map(item => item.regionId).join(',');
        this.ajaxData.regionLevel = ret.selectedItems.map(item => item.regionLevel).join(',');
        this.ajaxData.regionId = ret.selectedItems.length ? ret.selectedItems[0].regionId.substr(0, 6) : '';
      }
      else {
        console.log('按照区域排序');
        this.ajaxData.regionManager = '';
        this.ajaxData.regionId = ret.selectedItems.map(item => item.regionId).join(',');
        this.ajaxData.regionLevel = ret.selectedItems.map(item => item.regionLevel).join(',');
      }
      this.ajaxData.operaType = ret.selectedItems.length ? ret.type : 6;
      this.ajaxData.userId = ret.userId || wepy.getStorageSync('userId');
      this.initSchoolData();
      this.getSchoolListData();
      this.$apply();
    },
    'filter-cancel': e => {
      console.log(e);
    },

  };

  methods = {

    // 顶部选择功能
    switchOption: function (e) {
      let currentTab = e.currentTarget.dataset.current;
      this.currentTab = currentTab;
      this.curItemIndex = currentTab;
      this.$apply();
    },

    // 编辑日期函数
    bindDateChange: function (e) {
      this.selectDate.value = e.detail.value;
      this.ajaxData.logdate = e.detail.value;
      this.initSchoolData();
      this.getSchoolListData();
      this.$apply();
    },

    //  编辑周函数
    bindWeekChange: function (e) {
      this.weekInfo.index = e.detail.value;
      this.ajaxData.logdate = this.weekInfo.weekData[this.weekInfo.index].name.split('@')[0];
      this.initSchoolData();
      this.getSchoolListData();
      this.$apply()
    },

    //  编辑月函数
    bindMonthChange: function (e) {
      this.monthData.value = e.detail.value;
      this.handleCurMonthDate();
      this.initSchoolData();
      this.getSchoolListData();
      this.$apply();
    },

    //   综合排序选择器
    bindRankChange: function (e) {
      console.log('综合排序选择器');
      console.log(e.detail.value);
      let index = e.detail.value * 1 + 1;
      this.rankInfo.index = e.detail.value;
      this.ajaxData.selectType = index;
      this.initSchoolData();
      this.getSchoolListData();
      this.$apply();
    },

    // 点击跳转搜索学校
    navigateToSchool: function (e) {
      wepy.navigateTo({url: '../pages/search'})
    },

    //  切换swiper列表
    bindChange: function (e) {
      let curItemIndex = e.detail.current;
      let selectIndex = this.rankInfo.index + 1,
        typeIndex = curItemIndex + 1;
      let tempObj = {
        reportType: typeIndex,
        pageIndex: 1,
      };
      switch (curItemIndex) {
        case 0:
          this.ajaxData.rankStyle = 'day';
          tempObj.logdate = this.selectDate.value;
          break;
        case 1:
          tempObj.logdate = this.weekInfo.weekData[this.weekInfo.index].name.split('@')[0];
          break;
        case 2:
          this.handleCurMonthDate();
          tempObj.logdate = this.monthData.requestValue;
          break;
      }
      this.currentTab = String(curItemIndex);
      Object.assign(this.ajaxData, tempObj);
      this.initSchoolData();
      this.getSchoolListData();
      this.$apply();
    },

    //   清除学校信息
    cleanSchool: function (e) {
      this.schoolInfo.searchFlag = true;
      this.ajaxData.schoolId = '';
      delete this.schoolInfo.schoolName;
      delete this.$parent.globalData.schoolInfo;
      this.initSchoolData();
      this.getSchoolListData();
      //  重新请求函数
      this.$apply();
    },

    // 上拉加载更多数据
    loadMoreData: function (e) {
      console.log('来呀加载更多数据呀');
      // 判断请求到的数据是否为空，如果为空，提示用户信息已加载完毕，否则继续加载
      let pageIndex = ++this.ajaxData.pageIndex;
      if (this.pageData === false) {
        this.getSchoolListData(pageIndex)
      } else {
        console.log('加载完毕');
        return;
      }


    },

    //   筛选功能
    selectSchoolByCondition: function (e) {
      console.log('筛选筛选');
      if (this.ajaxData.userType == '4' || this.ajaxData.userType == '5') {
        return void (0)
      }
      // 点击筛选按钮，调用筛选组件
      this.$invoke('filter-slider', 'open', true);
      this.$apply()
    }

  };

  onLoad(e) {
    this.initData(e);
  }
  onUnload() {
    console.log('退出页面时，清除全局变量中的数据');
    delete this.$parent.globalData.schoolInfo;
    this.$apply();
  }

  onShow() {
    console.log('show..');

    // 当有学校时，获取到当前学校的信息,
    this.handleSchoolInfo();
  }

  async initData(e) {

    //   初始化日期函数
    this.formatDate();

    //  初始化月函数
    this.formatMonth();

    // 获取周数据
    this.getWeekList();

    // 获取所有的排序信息
    this.getRankInfo();

    //   初始化页面请求数据
    this.initDataInfo();
  }

  // 获取页面最初的数据
  initDataInfo() {
    let userId = wepy.getStorageSync('userId'),
      userType = wepy.getStorageSync('userType'),
      index = this.rankInfo.index * 1 + 1;
    this.ajaxData.userId = userId;
    this.ajaxData.userType = userType;
    this.ajaxData.logdate = this.selectDate.value;
    this.ajaxData.selectType = index;
    this.getSchoolListData();
    this.$apply();
  }

  // 初始化日期函数
  formatDate() {
    let format = 'YYYY-MM-DD';
    let yesterday = new Date() * 1 - (24 * 60 * 60 * 1000);
    let formatDay = Toolkit.dateFormat(yesterday, format);
    this.selectDate.value = formatDay;
    this.$apply();
  }

  // 初始化月函数信息
  formatMonth() {
    let format = 'YYYY-MM',
      formatDate = 'YYYY-MM-DD',
      curMonth = Toolkit.dateFormat(new Date() * 1, format),
      curDate = Toolkit.dateFormat(new Date() * 1 - 24 * 60 * 60 * 1000, formatDate);
    this.monthData.value = curMonth;
    this.monthData.requestValue = curDate;
    this.initMonthDate = curDate;
    this.$apply();
  }

  // 获取周信息
  async getWeekList() {
    let resResult = await api.getWeekItem();
    let weekData;
    if (resResult.statusCode === 200) {
      resResult.data.forEach((item) => {
        let weekName = item.name.split('@')[1];
        item.weekName = weekName;
      });
      this.weekInfo.weekData = resResult.data;
    }
    this.$apply();
  }

  // 重新发送请求前 清空页码及内存中的数据的页面数据
  initSchoolData() {
    this.schoolListData = [];
    this.pageData = false;
    this.$apply();
  }

  //  本地获取排序信息
  getRankInfo() {
    let rankArray = ['综合排序', '学校总人数', '开通率', '净增用户数'];
    this.rankInfo.rankArray = rankArray;
    this.$apply();
  }

  // 请求接口,获取学校列表数据
  async getSchoolListData(pageIndex = 1) {
    this.ajaxData.pageIndex = pageIndex;
    let defaultObj = this.ajaxData;
    let getSchoolList = await api.getAfterFilterList({method: 'POST', data: defaultObj});
    console.log('学校列表查询结果');
    console.log(getSchoolList);
    if (getSchoolList.statusCode === 200) {
      console.log(getSchoolList.data);

      // 底部统计数据
      for (let key in this.countData) {
        this.countData[key] = getSchoolList.data[key]
      }

      // swiper 滑动区域数据
      if (getSchoolList.data.dataList.length === 0) {
        this.pageData = true;
        return;
      }
      this.schoolListData = this.schoolListData.length === 0 ? getSchoolList.data.dataList : this.schoolListData.concat(getSchoolList.data.dataList);
    }
    this.$apply()
  }

  // 回显学校信息
  handleSchoolInfo() {
    if (this.$parent.globalData.schoolInfo !== undefined) {
      this.ajaxData.schoolId = this.$parent.globalData.schoolInfo.id;
      this.schoolInfo.searchFlag = false;
      this.schoolInfo.schoolName = this.$parent.globalData.schoolInfo.name;
      this.initSchoolData();
      this.getSchoolListData();
    }
    this.$apply();
  }

//   处理当前月份信息
  handleCurMonthDate() {
    let month = this.monthData.value.split('-')[1];
    let year = this.monthData.value.split('-')[0];
    let format = 'MM';
    let curMonth = Toolkit.dateFormat(new Date() * 1, format);
    let curMonthDate;

    // 判断选择的月份是否是当前月份，如果是的话则传递今天的日期，否则传递选择月份的最后一天
    if (month === curMonth) {
      this.monthData.requestValue = this.initMonthDate;
      this.ajaxData.logdate = this.initMonthDate;
      return void (0);
    }
    switch (month) {
      case '01':
      case'03':
      case '05':
      case '07':
      case '08':
      case '10':
      case '12':
        curMonthDate = `${this.monthData.value}-31`;
        break;
      case '02':
        // 判断是否是闰年
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
          curMonthDate = `${this.monthData.value}-29`;
        } else {
          curMonthDate = `${this.monthData.value}-28`;
        }
        break;
      case '04':
      case '06':
      case '09':
      case '11':
        curMonthDate = `${this.monthData.value}-30`;
        break;
    }
    this.monthData.requestValue = curMonthDate;
    this.ajaxData.logdate = curMonthDate;
    this.$apply();
    return void (0);
  }
}