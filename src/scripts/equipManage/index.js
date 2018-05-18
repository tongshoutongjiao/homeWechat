import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {
  };
  config = {
    navigationBarTitleText: '设备管理'
  };

  data = {
    grayFlag: true,
    equipInfo: [],
    fixFlag: false,//维修状态 只有选中数目为1时，状态为fale
    selectAllFlag: false,//全选按钮
    dialogFlag: false,// 维修单
    confirmFlag: false,// 确认初始化弹出框
    selectLength: 0,//选中维修设备的个数
    identify:'repairMan',// repairMan 维修人员 planter 安装员 other
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
      let userIdentify=e.currentTarget.dataset.user;
     switch (userIdentify){
       case 'repairMan':
         // 是否有维修单，有就显示，没有直接跳到新建维修单页面
         this.navigatorToRepainDetail(e);
         this.dialogFlag = true;
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

    //
    clickFixRecord: function (e) {
      console.log('点击修改对应日期的维修单');
      this.navigatorToRepainDetail(e);
    }
  };

  events = {
    'letter-index': (e, letter) => {
    }
  };

  async onLoad(e) {
    console.log('load..');
    console.log(this.$parent);

    setTimeout(() => {
      this.$preload('list', this.testFn())
    }, 3000);




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
    this.$redirect(`./repairDetail?` + str)
    // wepy.navigateTo({
    //   url: `/pages/repairDetail?` + str
    // });
  }

  //
  navigatorToPlanterPage(e) {
    let str = Toolkit.jsonToParam(e.currentTarget.dataset);
    // this.$redirect(`./planterDetail?` + str)
    wepy.navigateTo({
      url: `/pages/planterDetail?` + str
    });
  }


  async initData(e) {

    this.equipInfo = [
      {
        id: 1,
        index: 0,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 2,
        index: 1,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 3,
        index: 2,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 4,
        index: 3,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 5,
        index: 4,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 6,
        index: 5,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 7,
        index: 6,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      },
      {
        id: 8,
        index: 7,
        location: '勤东教学楼一',
        SN: '312323325012',
        equipType: 'c[新电话终端]',
        status: '在线',
        active: false
      }
    ];

    //  判断登录人是维修，安装还是其他人
    this.judgeOperator(e);

  }

  //   1安装  2维修  3其他
  judgeOperator() {

    switch (operator) {
      case'1':
        break;
      case'2':
        break;
      case '3':
        break;

    }

  }

//  预加载测试函数
  testFn(){
   let  name=[
      {name:'zhl',
      age:'12'},
      {name:'zll',age:'26'}
    ];
   return name;


  }
}