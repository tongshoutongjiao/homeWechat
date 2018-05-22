import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {};
  config = {
    navigationBarTitleText: '设备管理'
  };

  data = {
    grayFlag: true,
    equipInfo: [],
    repairList:[],// 维修单列表
    fixFlag: false,//维修状态 只有选中数目为1时，状态为fale
    selectAllFlag: false,//全选按钮
    dialogFlag: false,// 维修单
    confirmFlag: false,// 确认初始化弹出框
    selectLength: 0,//选中维修设备的个数
    identify: 'repairMan',// repairMan 维修人员 planter 安装员 other
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
        console.log('选中数目选中数目');
        console.log(this.selectLength);
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
        this.selectAllFlag = false;
        this.fixFlag = false;
        for (let i = 0; i < this.equipInfo.length; i++) {
          this.equipInfo[i].active = false;
        }
      }
      this.confirmFlag = false;
    },

    //  点击跳转至维修页面
    clickNavigatorToRestore: function (e) {
      // 判断用户是安装人员还是维修人员 1 安装人员 直接跳转到安装页面
      // 2 维修人员需要进一步判断近期是否有维修单？ 有的话先弹出维修单，没有的话直接跳转到新建维修单页面
      // 点击判断是否有维修单，如果有就显示，如果没有则直接跳转至新增维修单页面
      let userIdentify = e.currentTarget.dataset.user;
      switch (userIdentify) {
        case 'repairMan':
          // 是否有维修单，有就显示，没有直接跳到新建维修单页面
          this.dialogFlag = true;
          // this.navigatorToRepainDetail(e);
          // 遍历所有的设备，获取到有选中状态设备的id
          // 点击某一个机台获取设备维修记录
          console.log(this.equipInfo);
          let curData=this.equipInfo.filter(function (item,index) {
            return item.active===true;

          });
          let terminalId=this.terminalId;
          let res = api.getRepairRecordByTerminalId({
            method: 'POST',
            data: {
              terminalId: curData[0].id
            }

          });
          // res 维修结果
          console.log('');
          this.repairList=[
            {
              id:'',// 维修单主键
              schoolName:'',// 学校名字
              schoolID:'',// 学校id
              terminalNum:'',//终端编号
              simNum:'',//sim卡号
              terminalName:'',//终端名字
              orderTime:'2018-03-24',// 接单日期
              serviceTime:'2018-04-24',// 维修日期
              serviceman:'罗大锤',// 维修人员
            },
            {
              id:'',// 维修单主键
              schoolName:'',// 学校名字
              schoolID:'',// 学校id
              terminalNum:'',//终端编号
              simNum:'',//sim卡号
              terminalName:'',//终端名字
              orderTime:'2018-05-24',// 接单日期
              serviceTime:'2018-06-24',// 维修日期
              serviceman:'测试名',// 维修人员
            }
          ];
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
      console.log('点击修改对应日期的维修单');
      this.navigatorToRepainDetail(e);
    },

  //  点击编号跳转到终端详情页面
    clickNavigateToEquipList:function (e) {
      console.log(e);
      this.navigatorToEquipListPage(e);
    }

  };

  events = {
    'letter-index': (e, letter) => {
    }
  };

  async onLoad(e) {
    console.log('load..');
    console.log(this.$parent);
    console.log(e);
    this.schoolId = e.id;

    // 初始化页面数据
    setTimeout(e => this.initData());

  }

  onReady() {
    console.log('ready..');

  }

  onShow() {
    console.log('show..');
  }

  // 跳转进入维修详情页面
  navigatorToRepainDetail(e) {
    let str = Toolkit.jsonToParam(e.currentTarget.dataset);
    wepy.navigateTo({
      url: `/pages/repairDetail?` + str
    });
  }

  // 跳转进入安装页面
  navigatorToPlanterPage(e) {
    let str = Toolkit.jsonToParam(e.currentTarget.dataset);
    // this.$redirect(`./planterDetail?` + str)
    wepy.navigateTo({
      url: `/pages/planterDetail?` + str
    });
  }

  // 跳转终端详情页面
  navigatorToEquipListPage(e){
    let str = Toolkit.jsonToParam(e.currentTarget.dataset);
    // this.$redirect(`./planterDetail?` + str)
    wepy.navigateTo({
      url: `/pages/equipDetail?` + str
    });
  }


  async initData(e) {


    this.equipInfo = [
      {
        id: 1,
        index: 0,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '0',
        active: false
      },
      {
        id: 2,
        index: 1,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '0',
        active: false
      },
      {
        id: 3,
        index: 2,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '1',
        active: false
      },
      {
        id: 4,
        index: 3,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '1',
        active: false
      },
      {
        id: 5,
        index: 4,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '1',
        active: false
      },
      {
        id: 6,
        index: 5,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '1',
        active: false
      },
      {
        id: 7,
        index: 6,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '1',
        active: false
      },
      {
        id: 8,
        index: 7,
        installAddress: '勤东教学楼一',
        terminalNum: '312323325012',
        terminalName: 'c[新电话终端]',
        isLogin: '1',
        active: false
      },
      {
        id: '',// 设备唯一主键
        typeName: '',// 终端类型
        installAddress: '',// 安装位置
        terminalNum: '',// 终端编号
        isLogin: '',// 状态 1在线 0 离线
        simNum: '',// sim卡号
        terminalState: '',// 使用状态
        terminalName: ''// 终端名字
      }
    ];

    //  判断登录人是维修，安装还是其他人
    this.judgeOperator(e);


  }

  //   1安装  2维修  3其他
  async judgeOperator(e) {
    // repairMan 维修人员 planter 安装员 other

    // 通过学校信息,获取设备列表
    console.log('this.schoolId');
    console.log(this.schoolId);
    let res = await api.getEquipListBySchoolId({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    console.log(res);


    switch (e) {
      case'1':

        break;
      case'2':
        break;
      case '3':
        break;
    }

    this.$apply();
  }
}