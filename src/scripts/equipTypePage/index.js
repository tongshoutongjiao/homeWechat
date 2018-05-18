import wepy from 'wepy';
import querystring from 'querystring';
import LetterIndex from '../components/letter-index/letter-index';

import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {};
  config = {
    navigationBarTitleText: '设备管理选择页面'
  };

  data = {
    type: '',
    iconFlag: true,
    selectInfo: []
  };

  methods = {

    // 点击选择对应的选项
    clickSelectType: function (e) {
      console.log(e);
      let index = e.currentTarget.dataset.index,
        type=this.type,
        curType = this.selectInfo[index];
      curType.selected = !curType.selected;
      this.$parent.globalData[`${type}`]=this.selectInfo;
      this.$apply();
    },

    //  点击保存按钮，将选中信息存储在全局变量中

    clickSaveSelected: function () {
      let type = this.type,
        tempArray = [],
        selectItem=[],
        selectString = '';
      selectItem = this.selectInfo.filter(function (item, index, arr) {
        console.log(arguments);
        return item.selected === true;
      });

      selectItem.forEach(function (item) {
        if(item.name!=='自定义')
          tempArray.push(item.name);


      });

      // 判断总共有多少个字，如果大于14，在后边拼接上...，否则直接显示
      selectString = tempArray.join(',').length>14?tempArray.join(',').substring(0,14)+'...':tempArray.join(',');

      this.$parent.globalData[`${type}selected`] = selectString;
      tempArray=null;
      selectItem=null;
      wepy.navigateBack({
        delta: 1
      })
    },

    clickInputContent:function (e) {
      console.log('输入内容');
    }
  };

  events = {};

  async onLoad(option) {
    console.log(option);
    this.type = option.type;
    // 初始化页面数据
    setTimeout(e => this.initData());

  }

  onReady() {
    console.log('ready..');

  }

  onShow() {
    console.log('show..');
  //   根据globalData中的数据，更新最新的选中状态




  }

  async initData(e) {

    //   判断进入当前页面，是维修还是新建维修单
    //  1 维修:
    //  2 新建维修单：

    // 处理页面数据
    this.handleData();

  }

  handleData() {

    // 当前页面数据分三种情况
    // 1 需要通过接口获取数据  维修人员
    // 2 是否需要自定义的样式  故障类型维修人员不需要，其他都需要
    let type,
      data = [],
      dataList = [];
    type = this.type;
    // 赋值前 需要判断是不是第一次进入该页面，如果是的话，执行switch方法，如果不是的话,直接遍历globalData中的数据
    if(this.$parent.globalData[`${type}`]){
      console.log('之前已经赋值');
      this.selectInfo=this.$parent.globalData[`${type}`]
    }else {
      console.log("首次进入该页面");
      switch (type) {
        case 'faultType':
          data = ['SIM卡', '程序', '参数', '网络', '线路', '硬件'];
          break;
        case 'repairPerson':
          // 请求接口
          data = ['1', '2', '3', '4'];
          break;
        case 'hardware':
          data = ['自定义', '主板', '刷卡线', '喇叭', '语音芯片', '功放板', 'GPRS模块', '天线帽', '显示屏', '话柄', '键盘', '挡板', '锁芯', '挂叉', '电源'];
          break;
        case 'faultView':
          data = ['自定义', '设备掉线', '黑屏', '白屏', '花屏', '刷卡无声音', '程序版本低', '通话无声音', '按键失灵', '刷卡无反应', '刷卡距离近', '锁打不开', '摘机无反应', '参数错误', '死机'];
          break;
        case 'faultReason':
          data = ['自定义', 'SIM卡不正常', '电源坏', '线路无电', '显示屏坏', '喇叭坏', '话柄坏', '远程升级失败', '功放板坏', '语音芯片坏', '刷卡版坏', 'GPRS模块问题', '天线帽损坏', '键盘坏', '锁芯坏', '挂叉坏', '蜂鸣器坏', '程序问题', '主板坏', '人为损坏'];
          break;
        case 'handleMeasures':
          data = ['自定义', '走部门协作', '更换主板', '更换刷卡版', '更换喇叭', '更换语音芯片', '更换功放板', '更换GPRS模块', '更换天线帽', '更换显示屏', '更换话柄', '更换键盘', '更换挡板', '更换锁芯', '更换挂叉', '更换电源', '升级新程序', '修改参数', '更换蜂鸣器'];
          break;
        case 'remark':
          data = ['自定义', 'SIM卡不正常', '2天线', '3天线', '4天线', '定时器', '固定支架', '移动支架', '地埋', '无SIM卡'];
          break;
      }
      data.forEach(function (item, index) {
        let obj = {};
        obj.name = item;
        obj.index = index;
        obj.selected = false;
        dataList.push(obj);
        obj = null;
      });
      this.selectInfo = dataList;
      this.$parent.globalData[`${type}`] = dataList;
    }
  }


}