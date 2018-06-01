import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {};
  config = {
    navigationBarTitleText: '设备管理'
  };

  data = {
    schoolName: '',
    schoolId: '',
    grayFlag: true,
    equipInfo: [],
    repairList: [],// 维修单列表
    fixFlag: false,//维修状态 只有选中数目为1时，状态为fale
    selectAllFlag: false,//全选按钮
    dialogFlag: false,// 维修单
    confirmFlag: false,// 确认初始化弹出框
    selectLength: 0,//选中维修设备的个数
    identify: 'repairMan',// repairMan 维修人员 planter 安装员 other
    terminalId: '',
  };

  methods = {

    // 点击搜索框
    handleSearch: function (e) {
      wepy.navigateBack({
        delta: 1
      })
    },

    // 点击单个选中
    clickSelectEquip: function (e) {
      let equipInfo = this.equipInfo,
        selectLength = 0;
      // 可以选一个，也可以选择多个，选择一个时，维修按钮为可点击状态，反之不可点击，需要初始化为最初始态
      let index = e.currentTarget.dataset.index;
      let curEquip = equipInfo[index];
      curEquip.active = !curEquip.active;
      curEquip.active ? '' : this.selectAllFlag = false;
      for (let i = 0, curData; i < equipInfo.length; i++) {
        curData = equipInfo[i];
        curData.active ? selectLength += 1 : '';
      }

      selectLength === 0 || selectLength > 1 ? this.fixFlag = false : this.fixFlag = true;
      this.selectLength = selectLength;
    },

    //  点击全选
    clickSelectOperateEquip: function (e) {
      let selectType = e.currentTarget.dataset.selectType;
      if (selectType === 'all') {
        this.selectAllFlag = !this.selectAllFlag;
        if (this.selectAllFlag) {
          this.fixFlag = false;
          this.selectLength = this.equipInfo.length;
          for (let i = 0; i < this.equipInfo.length; i++) {
            this.equipInfo[i].active = true;
          }
        } else {
          this.fixFlag = false;
          this.selectLength = 0;
          for (let i = 0; i < this.equipInfo.length; i++) {
            this.equipInfo[i].active = false;
          }
        }

      } else {
        //  点击弹出确认弹窗
        if (this.selectLength) {
          this.confirmFlag = true;
        } else {
          wx.showToast({
            title: '请先选择需要初始化的设备',
            icon: 'none',
          });
        }
      }

    },

    //  点击确定或者取消执行初始化操作
    clickConfirmReformat: function (e) {
      let type = e.currentTarget.dataset.type;
      if (type === 'sure') {   //
        this.reformatEquipments();
      }
      this.confirmFlag = false;
    },

    //  点击跳转至维修页面
    clickNavigatorToRestore: function (e) {
      let that = this;
      // 判断用户是安装人员还是维修人员 1 安装人员 直接跳转到安装页面
      // 2 维修人员需要进一步判断近期是否有维修单？ 有的话先弹出维修单，没有的话直接跳转到新建维修单页面
      // 点击判断是否有维修单，如果有就显示，如果没有则直接跳转至新增维修单页面
      let userIdentify = e.currentTarget.dataset.user;
      switch (userIdentify) {
        case 'repairMan':
          // 是否有维修单，有就显示，没有直接跳到新建维修单页面

          // 遍历所有的设备，获取到有选中状态设备的id
          // 点击某一个机台获取设备维修记录
          that.judgeOrderList(e);
          break;
        case 'planter':
          this.navigatorToPlanterPage(e);
          break;
      }


    },

    // 点击操作维修表单
    clickOperateOrder: function (e) {
      let type = e.currentTarget.dataset.type;
      if (type === 'cancel') {
        this.dialogFlag = false;
      } else {
        //
        this.navigatorToRepainDetail(e);
      }
    },

    // 点维修记录的修改按钮，跳转到编辑维修单页面
    clickFixRecord: function (e) {
      this.navigatorToRepainDetail(e);
    },

    //  点击编号跳转到终端详情页面
    clickNavigateToEquipList: function (e) {
      this.navigatorToEquipListPage(e);
    }
  };

  events = {
    'letter-index': (e, letter) => {
    }
  };

  async onLoad(e) {
    this.schoolId = e.id;
    this.schoolName = decodeURI(e.name);
    // 初始化页面数据
    setTimeout(e => this.initData());

  }
  onShow() {
    console.log('show..');

    // 初始化页面数据
    this.initData();
    //   返回这个页面时，刷新数据
    this.dialogFlag = true ? this.dialogFlag = false : '';
    this.fixFlag=false;
  }

  // 跳转进入维修详情页面
  navigatorToRepainDetail(e) {
    this.$parent.globalData.curRepairData.schoolName = this.schoolName;
    this.$parent.globalData.curRepairData.schoolId = this.schoolId;

    let str = Toolkit.jsonToParam(e.currentTarget.dataset);

    this.$navigate(`./repairDetail?` + str);
  }

  // 跳转进入安装页面
  navigatorToPlanterPage(e) {
    let str = Toolkit.jsonToParam(e.currentTarget.dataset);
    let curEquip = this.equipInfo.filter(function (item) {
      return item.active === true;
    });
    curEquip[0].schoolName = this.schoolName;


    this.$parent.globalData.curPlantEquip = curEquip[0];
    wepy.navigateTo({
      url: `/pages/planterDetail?` + str
    });
  }

  // 跳转终端详情页面
  navigatorToEquipListPage(e) {
    let str = Toolkit.jsonToParam(e.currentTarget.dataset);
    // this.$redirect(`./planterDetail?` + str)

    wepy.navigateTo({
      url: `/pages/equipDetail?` + str
    });
  }

  // 初始化页面数据
  async initData(e) {
    this.equipInfo = [];

    //  判断登录人是维修，安装还是其他人
    this.judgeOperator(e);

    // 处理静态数据
    this.getStaticData();

    // 请求安装时终端类型数据
    this.getTypeName();
  }

  //   1安装  2维修  3其他
  async judgeOperator(e) {
    // repairMan 维修人员 planter 安装员 other
    let userId = wepy.getStorageSync('userId');
    let userIdentify = await api.getUserIdentifyById(
      {
        method: 'POST',
        data: {
          userId
        }
      }
    );
    if (userIdentify.statusCode === 200) {
      let identify = userIdentify.data.id;
      switch (userIdentify.data.id) {
        case 11:
          wepy.setStorageSync('operateId', 11);
          this.identify = 'repairMan';

          // 请求维修人员
          this.getGroupPerson();
          break;
        case 10:
          wepy.setStorageSync('operateId', 10);
          this.$parent.globalData.operateId = 10;
          this.identify = 'planter';

          // 请求安装人员
          this.getGroupPerson();
          break;
        default:
          wepy.setStorageSync('operateId', '');
          this.identify = 'other';
      }

    }

    let res = await api.getEquipListBySchoolId({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    console.log('当前学校的设备列表');
    this.equipInfo = res.statusCode === 200 ? res.data.data : [];
    this.equipInfo.forEach(function (item, index) {
      item.active = false;
      item.index = index;
    });
    this.$apply();
  }

  // 判断是否有维修单
  async judgeOrderList(e) {
    let curData = this.equipInfo.filter(function (item, index) {
      return item.active === true;
    });
    this.$parent.globalData.curRepairData = curData[0];
    this.terminalId = curData[0].id;

    //
    let resRecord = await api.getRepairRecordByTerminalId({
      method: 'POST',
      data: {
        terminalId: this.terminalId
      }
    });
    if (resRecord.statusCode === 200) {
      if (resRecord.data.data.length > 4) {
        this.repairList = resRecord.data.data.slice(0, 4)
      } else {
        this.repairList = resRecord.data.data;
      }
      this.repairList.forEach(function (item, index) {
        item.recordId = index + 1;
      });
      this.$parent.globalData.recordData = this.repairList;
      this.repairList.length ? this.dialogFlag = true : this.navigatorToRepainDetail(e);
    }
    this.$apply();
  }

  // 初始化选中设备
  async reformatEquipments() {
    let userName = wepy.getStorageSync('userName');
    let userId = wepy.getStorageSync('userId');
    let tempArray = [], tempStr = '';
    this.equipInfo.filter(function (item) {
      if (item.active === true) {
        tempArray.push(item.id)
      }
    });
    tempStr = tempArray.join(',');
    let res = await api.reformatEquipments({
      method: 'POST',
      data: {
        userName,
        userId,
        ids: tempStr
      }
    });
    if (res.statusCode === 200) {
      this.selectAllFlag = false;
      this.fixFlag = false;
      for (let i = 0; i < this.equipInfo.length; i++) {
        this.equipInfo[i].active = false;
      }
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      });

    } else {
      wx.showToast({
        title: '初始化失败',
        icon: 'none',
        duration: 2000
      });
    }
    this.$apply();
  }

  //  获取维修人员列表
  async getGroupPerson() {
    let operateId = wepy.getStorageSync('operateId'),
      personList,
      personListData = [];
    let res = await api.getGroupPersonById({
      method: 'POST',
      data: {
        groupId: operateId
      }
    });
    if (res.statusCode === 200) {
      personList = res.data.data;
      personList.forEach(function (item, index) {
        let obj = {};
        obj.name = item.personName;
        obj.id = item.personId;
        obj.index = index;
        obj.selected = false;
        personListData.push(obj);
        obj = null;
      });
      this.$parent.globalData.repairPerson = personListData;
    }
    this.$apply();


  }

  //   处理本地静态数据，保存到全部变量中
  async getStaticData() {
    let data = [], dataList = [], self = this;
    ['faultType', 'hardware', 'faultView', 'faultReason', 'handleMeasures', 'remark'].forEach(function (type) {
      switch (type) {
        case 'faultType':
          dataList = [];
          data = ['SIM卡', '程序', '参数', '网络', '线路', '硬件'];
          data.forEach(function (item, index) {
            let obj = {};
            obj.name = item;
            obj.index = index;
            obj.selected = false;
            dataList.push(obj);
            obj = null;
          });
          self.$parent.globalData.faultType = dataList;
          break;
        case 'hardware':
          dataList = [];
          data = ['自定义', '主板', '刷卡线', '喇叭', '语音芯片', '功放板', 'GPRS模块', '天线帽', '显示屏', '话柄', '键盘', '挡板', '锁芯', '挂叉', '电源'];
          data.forEach(function (item, index) {
            let obj = {};
            obj.name = item;
            obj.index = index;
            obj.selected = false;
            dataList.push(obj);
            obj = null;
          });
          self.$parent.globalData.hardware = dataList;
          break;
        case 'faultView':
          dataList = [];
          data = ['自定义', '设备掉线', '黑屏', '白屏', '花屏', '刷卡无声音', '程序版本低', '通话无声音', '按键失灵', '刷卡无反应', '刷卡距离近', '锁打不开', '摘机无反应', '参数错误', '死机'];
          data.forEach(function (item, index) {
            let obj = {};
            obj.name = item;
            obj.index = index;
            obj.selected = false;
            dataList.push(obj);
            obj = null;
          });
          self.$parent.globalData.faultView = dataList;
          break;
        case 'faultReason':
          dataList = [];
          data = ['自定义', 'SIM卡不正常', '电源坏', '线路无电', '显示屏坏', '喇叭坏', '话柄坏', '远程升级失败', '功放板坏', '语音芯片坏', '刷卡版坏', 'GPRS模块问题', '天线帽损坏', '键盘坏', '锁芯坏', '挂叉坏', '蜂鸣器坏', '程序问题', '主板坏', '人为损坏'];
          data.forEach(function (item, index) {
            let obj = {};
            obj.name = item;
            obj.index = index;
            obj.selected = false;
            dataList.push(obj);
            obj = null;
          });
          self.$parent.globalData.faultReason = dataList;
          break;
        case 'handleMeasures':
          dataList = [];
          data = ['自定义', '走部门协作', '更换主板', '更换刷卡版', '更换喇叭', '更换语音芯片', '更换功放板', '更换GPRS模块', '更换天线帽', '更换显示屏', '更换话柄', '更换键盘', '更换挡板', '更换锁芯', '更换挂叉', '更换电源', '升级新程序', '修改参数', '更换蜂鸣器'];
          data.forEach(function (item, index) {
            let obj = {};
            obj.name = item;
            obj.index = index;
            obj.selected = false;
            dataList.push(obj);
            obj = null;
          });
          self.$parent.globalData[`${type}`] = dataList;
          break;
        case 'remark':
          dataList = [];
          data = ['自定义', 'SIM卡不正常', '2天线', '3天线', '4天线', '定时器', '固定支架', '移动支架', '地埋', '无SIM卡'];
          data.forEach(function (item, index) {
            let obj = {};
            obj.name = item;
            obj.index = index;
            obj.selected = false;
            dataList.push(obj);
            obj = null;
          });
          self.$parent.globalData.remark = dataList;
          break;
      }

    });
    this.$apply();
  }

//
  async getTypeName() {

    let resRecord = await api.getTerminalType({
      method: 'POST',
      data: {}
    });
    this.$parent.globalData.terminalTypeData = resRecord.data.result === 200 ? resRecord.data.data : '';
  }

}