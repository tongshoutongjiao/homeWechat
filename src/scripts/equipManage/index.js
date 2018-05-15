import wepy from 'wepy';
import querystring from 'querystring';
import LetterIndex from '../components/letter-index/letter-index';

import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {
    'letter-index': LetterIndex
  };
  config = {
    navigationBarTitleText: '设备管理'
  };

  data = {
    grayFlag: true,
    equipInfo: [],
    fixFlag: true,
    selectAllFlag:false,
    dialogFlag:false,
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
        selectLength=0;
      // 可以选一个，也可以选择多个，选择一个时，维修按钮为可点击状态，反之不可点击，需要初始化为最初始态
      let index = e.currentTarget.dataset.index;
      let curEquip = equipInfo[index];
      curEquip.active = !curEquip.active;
      curEquip.active?'':this.selectAllFlag=false;
      for (let i = 0, curData; i < equipInfo.length; i++) {
        curData = equipInfo[i];
        console.log(curData);
        curData.active ? selectLength+=1 : '';
      }
      selectLength>1?this.fixFlag = false:this.fixFlag = true;
    },

    //  点击全选
    clickSelectOperateEquip:function (e) {
      let selectType=e.currentTarget.dataset.selectType;
      console.log(selectType);
      if(selectType==='all'){
        this.selectAllFlag=true;
        this.fixFlag = false;
          for (let i=0;i<this.equipInfo.length;i++){
            this.equipInfo[i].active=true;
          }
    }else {
        this.selectAllFlag=false;
        this.fixFlag = true;

        for (let i=0;i<this.equipInfo.length;i++){
          this.equipInfo[i].active=false;
        }

      }

  },

   //  点击跳转至维修页面
    clickNavigatorToRestore:function (e) {
      // 点击判断是否有维修单，如果有就显示，如果没有则直接跳转至新增维修单页面
      let hasRecord=false;
      if(hasRecord){



      }else {

      }

      let str = Toolkit.jsonToParam(e.currentTarget.dataset);


      this.dialogFlag=true;

      // wepy.navigateTo({
      //   url: `/pages/?` +str
      // });

    },

   // 点击操作维修表单
    clickOperateOrder:function (e) {
      let type=e.currentTarget.dataset.type;
      console.log(type);
      if(type==='cancel'){
        this.dialogFlag=false;

      }else {
      //

        console.log('跳转至新增表单页面')
      }
    }
   };

  events = {
    'letter-index': (e, letter) => {
    }
  };

  async onLoad(e) {
    console.log('load..');
    console.log(this.$parent);

    // 初始化页面数据
    setTimeout(e => this.initData());

  }

  onReady() {
    console.log('ready..');

  }

  onShow() {
    console.log('show..');
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
    ]

    //  判断登录人是维修，安装还是其他人
    this.judgeOperator(e)

  }

  judgeOperator(){
  //   1安装  2维修  3其他
    switch (operator){
      case'1':
        break;
      case'2':
        break;
      case '3':
        break;

    }



  }
}