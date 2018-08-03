import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '考勤记录'
  };
  data = {
    curAttendName: '出入校考勤',
    schoolId: '',
    schoolName: '',
    attendanceObj: {
      schoolId: '',// 学校id
      content: '全校',// 考勤范围
      classId: '',// 班级id
      gradeId: '',// 年级id
      typeId: '',// 考勤方式id
      queryType: '',// 按宿舍查寝(4:全校 3：宿舍楼 2：楼层 1：宿舍) 按班级查寝（3：全校 2：年级 1：班级）
      floorId: '',//宿舍楼id（按宿舍楼查寝 必填）
      layerId: '',//楼层id（按宿舍楼查寝 必填）
      dormId: '',// 宿舍id
      selectType: 'dorm'// 选择类型
    },
    cardRecordData: {
      schoolId: '',
      gradeId: '',
      classId: '',
      kaoqinTypeId: 1,
      attendanceDate: '',//
    },// 出入校考勤默认传递的数据

    recordData: [],// 考勤返回的数据
    attendStyle: {
      array: [
        {
          typeName: '出入校考勤',
          typeId: 1
        },
        {
          typeName: '宿舍考勤',
          typeId: 3
        }
      ],
      index: '0'
    },
    date: "06-04",
    nodeType: 'school4Dorm',// 判断按班级还是按宿舍楼 默认宿舍楼


    requestFlag:false,
  };
  methods = {
    // 点击跳转到条件选择页面
    clickSelectOption: function (e) {
      if(this.requestFlag){
        return;
      }
      // 判断是按出入校考勤还是宿舍考勤
      // 宿舍考勤默认选择宿舍方式
      wepy.navigateTo({
        url: `/pages/classOptionPage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
      });
      this.$apply();
    },

    // 点击选择日期或者考勤类型
    bindChangeStyle: function (e) {
      if(this.requestFlag){
        return;
      }

      let bindType = e.currentTarget.dataset.bindType,
        cardRecordData = this.cardRecordData;
      let typeId = this.cardRecordData.kaoqinTypeId,
        selectedInfo = this.$parent.globalData.selectedInfo,
        dormInfo = this.$parent.globalData.dormInfo;

      if (bindType === 'date') {
        // 日期
        cardRecordData.attendanceDate = e.detail.value;
        cardRecordData.date = e.detail.value.substring(5);

        cardRecordData.kaoqinTypeId == 1 ? this.getCardRecord(selectedInfo) : this.getDormAttendanceInfo(dormInfo);
      }
      else {
        // 考勤类型
        this.attendStyle.index = e.detail.value;
        cardRecordData.kaoqinTypeId = this.attendStyle.array[e.detail.value].typeId;

        // 判断用户是否切换筛选条件，如果切换，则修改默认值，否则正常执行
        if (typeId !== this.attendStyle.array[e.detail.value].typeId) {
          console.log('测试测试');
          console.log(this);
          console.log(this.attendanceObj);
          this.attendanceObj.content = '全校';
          let tempObj = {
            gradeId: '',
            classId: '',
            layerId: '',
            dormId: '',
            floorId: '',
            queryType: '4',
            schoolId: this.schoolId
          };
          Object.assign(this.cardRecordData, tempObj);
          Object.assign(dormInfo || {}, tempObj);
          cardRecordData.kaoqinTypeId === 1 ? this.getCardRecord(selectedInfo) : this.getDormAttendanceInfo(dormInfo);
          return;
        }
        cardRecordData.kaoqinTypeId === 1 ? this.getCardRecord(selectedInfo) : this.getDormAttendanceInfo(dormInfo);
      }
      this.$apply();
    },

    //  点击跳转到考勤记录页面
    clickNavigateToRecordPage: function (e) {
      let navType = e.currentTarget.dataset.navigateType;
      this.navigateToRecordPage(e, navType)
    },

    //  点击搜索学校名字
    handleSearch: function () {
      wepy.navigateBack({
        delta: 1
      })
    },

  //
    switchSelection:function () {
      console.log('切换考勤方式');
      if(this.requestFlag){
        return;
      }

    }
  };

  async onLoad(e) {
    this.schoolId = e.id;
    this.schoolName = decodeURIComponent(e.name);

    //  获取到当前的时间日期，年月日格式 学校id
    this.handDefaultData();

    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onShow() {
    console.log('show !');

    // 根据typeId 判断当前页面选择的数据
    this.handleDefaultSelectData();
  }

  onUnload() {
    console.log('退出页面时，清除全局变量中的数据');
    this.$parent.globalData = {};
    this.$apply();
  }

  initData() {

    // 获取考勤方式
    this.getAttendanceMethods();

    // 获取默认选中的数据

    this.handleDefaultSelectData()
  }

  // 处理默认选中的信息
  handleDefaultSelectData() {
    let typeId = this.cardRecordData.kaoqinTypeId,
      selectedInfo = this.$parent.globalData.selectedInfo,
      dormInfo = this.$parent.globalData.dormInfo;
    dormInfo && (this.attendanceObj.selectType = dormInfo.nodeType === 'school4Dorm' ? 'dorm' : 'className');
    if (typeId == '1') {
      Object.assign(this.attendanceObj, selectedInfo);
      this.getCardRecord(selectedInfo);
    } else {
      Object.assign(this.attendanceObj, dormInfo);
      this.getDormAttendanceInfo(dormInfo)
    }
    this.$apply();
  }

  handDefaultData() {
    let format = '',
      date = new Date(),
      cardRecordData = this.cardRecordData;
    let formatDate = Toolkit.dateFormat(date, format = 'YYYY-MM-DD');
    cardRecordData.attendanceDate = formatDate;
    cardRecordData.date = formatDate.substring(5);
    cardRecordData.schoolId = this.schoolId;
    this.$apply();
  }

  // 获取考勤方式
  async getAttendanceMethods() {
    let res = await api.getAttendanceMethods({
      method: 'POST',
    });
    if (res.data.result === 200) this.attendStyle.array = res.data.data;
  }

  // 获取刷卡记录
  async getCardRecord(optionObj) {
    let defaultObj = this.cardRecordData;
    defaultObj = optionObj ? Object.assign(defaultObj, optionObj) : defaultObj;
    defaultObj.attentanceDate = defaultObj.attendanceDate;
    console.log('获取学校考勤数据');
    console.log(defaultObj);
    this.requestFlag=true;
    let res = await api.getCardRecord({
      method: 'POST',
      data: defaultObj
    });
    if (res.data.result === 200 && !!res.data.data[0]) {
      this.recordData = res.data.data[0];
      this.requestFlag=false;
      // 保存当前页面的选择条件
      this.handleRecordPageData(defaultObj);
      this.$apply()
    }
    else {
      this.requestFlag=false;
      wx.showToast({
        title: '请求失败',
        icon: 'loading',
        duration: 1000
      });
      this.recordData = [];
      this.$apply()
    }
  }

//  宿舍考勤统计
  async getDormAttendanceInfo(defaultObj) {

    let tempObj = {
      schoolId: this.schoolId,
      attendanceDate: this.cardRecordData.attendanceDate,
      nodeType: this.nodeType,
      queryType: '4'
    };
    tempObj = defaultObj ? Object.assign(tempObj, defaultObj) : tempObj;
    // 请求宿舍考勤信息
    this.judgeAttendanceType(tempObj);
    this.$apply();
  }

// 宿舍考勤参数处理 判断是根据宿舍楼查寝还是班级查寝  默认按照宿舍考勤
  async judgeAttendanceType(self) {
    let defaultData = {};
    this.requestFlag=true;
    if (self.nodeType === 'school') {
      defaultData.nodeType = 'school';
      switch (self.queryType) {
        case'3':
          defaultData.schoolId = self.schoolId;
          break;
        case '2':
          defaultData.schoolId = self.schoolId;
          defaultData.gradeId = self.gradeId;
          break;
        case '1':
          defaultData.schoolId = self.schoolId;
          defaultData.gradeId = self.gradeId;
          defaultData.classId = self.classId;
          break;
      }
    }
    else {
      defaultData.nodeType = 'school4Dorm';
      switch (self.queryType) {
        case '4':
          // 按学校
          defaultData.schoolId = self.schoolId;
          break;
        case'3':
          // 按宿舍楼
          defaultData.schoolId = self.schoolId;
          defaultData.floorId = self.floorId;
          break;
        case '2':
          // 按楼层
          defaultData.schoolId = self.schoolId;
          defaultData.floorId = self.floorId;
          defaultData.layerId = self.layerId;
          break;
        case '1':
          // 按房间号
          defaultData.schoolId = self.schoolId;
          defaultData.floorId = self.floorId;
          defaultData.layerId = self.layerId;
          defaultData.dormId = self.dormId;
          break;
      }
    }
    defaultData.queryType = self.queryType;
    defaultData.attentanceDate = self.attendanceDate;
    let res = await api.getDormAttendanceInfo({
      method: 'POST',
      data: defaultData,
    });
    if (res.data.result === 200 && !!res.data.data[0]) {
      this.recordData = res.data.data[0];
      this.requestFlag=false;
      // 处理当前页面选择的参数
      this.handleRecordPageData(defaultData);
    } else {
      this.recordData = [];
      this.requestFlag=false;
    }
    this.$apply();
  }

// 点击span内容的时候，将当前页面选择的数据保存到全局变量
  handleRecordPageData(defaultObj) {
    let recordPageData = {};
    recordPageData.kaoqinTypeId = this.cardRecordData.kaoqinTypeId;
    recordPageData.isdorm = '0';
    recordPageData.page = '0';
    recordPageData.number = '100';
    Object.assign(recordPageData, defaultObj);
    delete recordPageData.preHand;
    delete recordPageData.version;
    delete recordPageData.token;
    delete recordPageData.platformType;
    this.$parent.globalData.recordPageData = recordPageData;
    console.log('查看页面需要查询的信息');
    console.log(defaultObj);
    console.log(this.$parent.globalData.recordPageData);

  }

  //  跳转到明细页面
  async navigateToRecordPage(e) {
    wepy.navigateTo({
      url: `/pages/recordPage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
    });
  }
}
