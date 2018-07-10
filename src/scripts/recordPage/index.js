import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';


const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '刷卡明细',
    // "enablePullDownRefresh": true
  };

  data = {
    recordData: [],
    typeId: 1,
    curPageData: {},
    bindData: {
      array: [
        {
          typeName: '走读',
          isDorm: '0'
        },
        {
          typeName: '住宿',
          isDorm: '1'
        },
        {
          typeName: '待定',
          isDorm: '2'
        }
      ],
      index: '0'
    },
    loadingFlag: true,
    restFlag: false,
    isDormFlag: 0,
    inOutFlag:false,
    scrollHeight:null,
  };
  methods = {
    bindChangeStyle: function (e) {
      this.bindData.index = e.detail.value;
      let data = this.curPageData;
      data.isdorm = e.detail.value;
      data.isDorm = e.detail.value;
      this.isDormFlag = e.detail.value;
      this.recordData = [];

      console.log('每次点击之后重新请求加载页面数据');
      console.log(data);
      this.getAttendanceData();
      this.$apply();
    },

    bindLower:function () {
      let pageFlag = true;
      this.getAttendanceData(pageFlag);
      this.$apply()
    }


  };

  async onLoad(e) {
    let curPageData = this.$parent.globalData.recordPageData;
    curPageData.navigateType = e.navigateType;
    curPageData.kaoqinSpanId = e.spanId;
    this.typeId = curPageData.kaoqinTypeId;
    this.curPageData = curPageData;



    //  出入校考勤:
    console.log('出入校考勤');
    console.log(curPageData);
    if(curPageData.navigateType==='in'||curPageData.navigateType==='out'){
      this.inOutFlag=true;
      // this.getMockData();
      console.log('入校数据统计')
    }

    setTimeout(e => this.initData());




    this.$apply();
  }

  onShow() {

  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉加载数据');

  }

  initData(e) {

    this.getAttendanceData();
    this.calculateHeight();

    let defaultData = {
      schoolId: '',
      gradeId: '',
      classId: '',
      isdorm: '',//是否住宿 0 否 1 是 2 待定
      kaoqinSpanId: '',// 考勤时段
      attendanceDate: '',// 考勤日期
      kaoqinTypeId: '',//考勤类型id
      director: '',//刷卡状态 1 入校 0 出校 -1 未刷卡
      page: '',//当前页码
      number: ''// 每页数据条数
    };

    this.recordData = [];
  }

  // 获取考勤数据
  getAttendanceData(pageFlag,chooseIcon) {
    let data = this.curPageData;
    data.attendanceDate = data.attentanceDate;
    data.number = '20';
    pageFlag? data.page++:data.page=0;
    console.log('页面请求数据页面请求数据');
    data.navigateType === 'rest' ? this.getRestData(data) : this.getInOutData(data);
    this.$apply();
  }

  // 计算scroll-view 的高度
  calculateHeight(){
    let scrollHeight;
    wx.getSystemInfo({
      success: function(res) {
        scrollHeight=res.windowHeight-100;
      }
    });
    this.scrollHeight=scrollHeight;
    this.$apply()
  }

//   获取请假数据
  async getRestData(data) {
    let resData = null;
    data.isDorm = data.isdorm;
    wepy.setNavigationBarTitle({
      title: '请假明细' //页面标题为路由参数
    });
    this.restFlag = true;
    if (data.kaoqinTypeId === 1) {
      resData = await api.InOutRestData({
        method: 'POST',
        data: data
      })
    } else {
      resData = await api.dormRestData({
        method: 'POST',
        data: data
      });
    }
    if (resData.data.result === 200) {
      this.recordData = this.recordData.concat(resData.data.data);
    }
    this.$apply();
  }

//   获取出入校数据
  async getInOutData(data) {
    //   考勤id
    let typeId = data.kaoqinTypeId;
    let resData = [];
    wepy.setNavigationBarTitle({
      title: '出入校明细'//页面标题为路由参数
    });
    if (typeId === 1) {
      switch (data.navigateType) {
        case 'in':
          data.director = '1';
          break;
        case 'out':
          data.director = '0';
          break;
        case 'card':
          data.director = '-1';
          break;
      }
      resData = await api.InOutData({
        method: 'POST',
        data: data
      });
      if (resData.data.result === 200) {
        this.recordData = this.recordData.concat(resData.data.data);
        // this.recordData=this.getMockData();
      }
    } else {
      switch (data.navigateType) {
        case 'in':
          data.director = '1';
          break;
        case 'out':
          data.director = '0';
          break;
        case 'card':
          data.director = '-1';
          break;
      }
      resData = await api.dormData({
        method: 'POST',
        data: data
      });
      if (resData.data.result === 200) {
        this.recordData = this.recordData.concat(resData.data.data);
        // this.recordData=this.getMockData();
      }
    }
    this.$apply();
  }

//   出入校假数据
  getMockData(){
    let tempArray=[];
    for(let i=0;i<12;i++){
      tempArray.push({
        index:i,
        cardCode:'1245665',
        className:'国际06班',
        gradeId:6863,
        studentName:'赵海龙',
        cardTime:'06-11 14:57',
        isdorm:1,
      })
    }

    return tempArray;
  }
}
