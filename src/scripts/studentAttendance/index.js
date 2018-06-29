import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';


const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '考勤记录'
  };
  data = {
    curAttendName: '出入校考勤',
    schoolId: '',
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
    },
    cardRecordData: {
      schoolId: '',
      gradeId: '',
      classId: '',
      kaoqinTypeId: 1,
      attendanceDate: '',
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

  };
  events = {};
  methods = {
    clickSelectOption: function (e) {
      this.navigatorToClassOption(e);
    },
    selectAttendStyle: function (e) {
      let attendIndex = e.currentTarget.dataset.attendIndex;
      this.curAttendName = this.attendStyle[attendIndex].attendName;
      this.selectIndex = attendIndex;
      this.$apply();
    },

    // 点击选择日期或者考勤类型
    bindChangeStyle: function (e) {
      let bindType = e.currentTarget.dataset.bindType,
        cardRecordData = this.cardRecordData;
      let typeId = this.cardRecordData.kaoqinTypeId,
        selectedInfo = this.$parent.globalData.selectedInfo,
        dormInfo = this.$parent.globalData.dormInfo;
      if (bindType === 'date') {
        cardRecordData.attendanceDate = e.detail.value;
        cardRecordData.date = e.detail.value.substring(5);
        cardRecordData.kaoqinTypeId === 1 ? this.judgeGlobalData(selectedInfo, this.getCardRecord) : this.judgeGlobalData(dormInfo, this.getDormAttendanceInfo);
      } else {
        // 考勤类型
        this.attendStyle.index = e.detail.value;
        cardRecordData.kaoqinTypeId = this.attendStyle.array[e.detail.value].typeId;

        // 判断用户是否切换筛选条件，如果切换，则修改默认值，否则正常执行
        if (typeId !== this.attendStyle.array[e.detail.value].typeId) {
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
          cardRecordData.kaoqinTypeId === 1 ? this.judgeGlobalData(selectedInfo, this.getCardRecord) : this.judgeGlobalData(dormInfo, this.getDormAttendanceInfo);
          return;
        }
        cardRecordData.kaoqinTypeId === 1 ? this.judgeGlobalData(selectedInfo, this.getCardRecord) : this.judgeGlobalData(dormInfo, this.getDormAttendanceInfo);
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
    }
  };

  async onLoad(e) {
    this.schoolId = e.id;

    //  获取到当前的时间日期，年月日格式
    this.handDefaultData();

    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onShow() {
    console.log('show !');

    // 根据typeId 判断当前页面选择的数据
    this.handleDefaultSelectData();
  }

  initData() {
    this.getAttendanceMethods()
  }

  handleDefaultSelectData() {
    let typeId = this.cardRecordData.kaoqinTypeId,
      selectedInfo = this.$parent.globalData.selectedInfo,
      dormInfo = this.$parent.globalData.dormInfo;
    typeId == '1' ? this.judgeGlobalData(selectedInfo, this.getCardRecord) : this.judgeGlobalData(dormInfo, this.getDormAttendanceInfo);
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

  async getAttendanceMethods() {
    let res = await api.getAttendanceMethods({
      method: 'POST',
    });
    if (res.data.result === 200) this.attendStyle.array = res.data.data;
  }

  navigatorToClassOption(e) {
    let index = this.attendStyle.index;
    let obj = this.attendStyle.array[index];
    //  根据选中的类型，请求不同的数据接口
    this.getClassInfo(e);
  }

  async getClassInfo(e) {
    wepy.navigateTo({
      url: `/pages/classOptionPage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
    });
  }

  // 获取刷卡记录
  async getCardRecord(self, optionObj) {
    let defaultObj = self.cardRecordData;
    defaultObj = optionObj ? Object.assign(defaultObj, optionObj) : defaultObj;
    defaultObj.attentanceDate = defaultObj.attendanceDate;


    // 测试数据
    // defaultObj.schoolId = '69';
    // defaultObj.attentanceDate = '2018-06-11';
    // defaultObj.attendanceDate = '2018-06-11';



    let res = await api.getCardRecord({
      method: 'POST',
      data: defaultObj
    });
    if (res.data.result === 200 && !!res.data.data[0]) {
      self.recordData = res.data.data[0];
      self.handleRecordPageData(defaultObj);
    } else {
      self.recordData = [];
    }
    self.$apply();
  }

//  宿舍考勤统计
  async getDormAttendanceInfo(self, defaultObj) {
    let tempObj = {
      schoolId: self.schoolId,
      attendanceDate: self.cardRecordData.attendanceDate,
      nodeType: self.nodeType,
      queryType: '4'
    };
    tempObj = defaultObj ? Object.assign(tempObj, defaultObj) : tempObj;
    self.judgeAttendanceType(tempObj);
  }

//  跳转到明细页面
  async navigateToRecordPage(e) {
    wepy.navigateTo({
      url: `/pages/recordPage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
    });
  }

// 宿舍考勤参数处理 判断是根据宿舍楼查寝还是班级查寝  默认按照宿舍考勤
  async judgeAttendanceType(self) {
    let defaultData = {};
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
    } else {
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

    console.log('获取所有的日期日期信息');
    console.log(defaultData);


    // 测试数据
    //  defaultData.schoolId = '69';
    //  defaultData.attentanceDate = '2018-06-11';
    // defaultData.attentanceDate = '2018-06-04';


    let res = await api.getDormAttendanceInfo({
      method: 'POST',
      data: defaultData,
    });
    if (res.data.result === 200 && !!res.data.data[0]) {
      this.recordData = res.data.data[0];
      // 处理recordPage 页面需要的数据
      this.handleRecordPageData(defaultData);
    } else {
      this.recordData = [];
    }
    this.$apply();
  }

// 判断是否需要使用globalData中的数据
  judgeGlobalData(data, fn) {
    if (data !== undefined) {
      this.attendanceObj = data;
      fn(this, data);
      return;
    }
    fn(this);
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
  }
}
