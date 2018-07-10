import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';

export default class Index extends wepy.page {

  config = {
    navigationBarTitleText: '定位设备'
  };
  data = {
    schoolId: '',
    equipID: '',// 当前设备id值
    longitude: '113.324520',
    latitude: '23.099994',
    scale: '20',
    displayStatus: true,
    mapHeight: '738rpx',
    equipLength: '',
    cardLength: '',
    locationFlag: false,// 当前设备默认未定位

    deviceInfo: {
      deviceHeight: ''
    },
    equipInfo: {},
    equipListData: [],// 所有的设备信息
    markers: [],
    locationInfo: {
      status: false,
    },
    lengthInfo: {
      equipLength: 0,
      cardLength: 0,
      phoneLength: 0,
    },// 设备数目信息
  };

  methods = {

    clickRelocation: function () {
      console.log('点击重新定位');
      let lat, long;

      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.$apply()
        }
      });


      this.updateEquipInfo();
      this.$apply();
    },

    clickCollapseBox: function () {
      console.log('点击合起设备盒子');
      this.displayStatus = !this.displayStatus;
      this.mapHeight = this.displayStatus ? '738rpx' : (this.deviceInfo.deviceHeight - 38) + 'px';
      this.$apply();
    },

    //  点击转换
    markertap: function (e) {
      console.log('点击切换按钮');
      console.log(e);
      let id = e.markerId;
      this.switchEquipInfo(id);
    },
  };

  onLoad(e) {
    // 当前页面需要知道的信息 schoolId 设备id 是否已定位
    console.log(e);
    this.schoolId = e.schoolId;
    this.equipID = e.equipId;
    this.locationFlag = e.locationFlag;
    console.log('首先加载页面的信息信息信息');
    // 初始化页面数据
    setTimeout(e => this.initData());
    this.$apply();
  }

  onShow() {
    console.log('show..');
  }

  async initData(e) {

    //   获取设备的高度和宽度
    this.getDeviceInfo();

    //  判断当前设备是否已定位，如果已定位则显示已定位的样式，否则显示重新定位的样式
    this.getCurLocation();

    // 初始化当前设备定位信息
    this.initEquipData();
  }

  // 获取设备的高度和宽度
  getDeviceInfo() {
    console.log('获取设备的高度和宽度');
    wx.getSystemInfo({
      success: (res) => {
        this.deviceInfo.deviceHeight = res.windowHeight;
        this.$apply();
      }
    })
  }

  // 定位当前设备
  getCurLocation() {
    // 判断设备是否已定位，如果未定位，则定位当前位置，否则直接定位到设备之前的位置
    if (this.locationFlag === 'true') {
      // 定位过一定有数据 可以直接调用列表接口。
      let latitude = wx.getStorageSync('lat'),
        longitude = wx.getStorageSync('long');
      this.longitude = longitude;
      this.latitude = latitude;
    } else {
      console.log('自动定位当前位置');
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
        }
      });
    }

    this.getEquipListInfoBySchoolId();
    this.$apply();
  }

// 获取学校设备信息的列表
  async getEquipListInfoBySchoolId() {
    console.log('根据学校id,获取设备列表');

    let res = await api.getEquipListInfoBySchoolId({
      method: 'POST',
      data: {
        schoolId: this.schoolId,
      }
    });
    console.log('设备列表');
    if (res.data.result === 200) {
      let data = res.data.data;
      this.handleResData(data);
      this.handleMarkerIcon(data);
    }
    if (res.data.result === 300) {

      console.log('该学校第一次定位设备,首先将当前设备的信息更新至数据库');
      this.updateEquipInfo();
    }
    this.$apply();
  }

//  更新设备经纬度
  async updateEquipInfo() {
    console.log('更新设备信息');
    let res = await api.updateEquipInfoByLocation({
      method: 'POST',
      data: {
        id: this.equipID,// 设备id
        longitude: this.longitude,// 经度
        latitude: this.latitude,// 纬度
      }
    });
    if (res.data.result === 200) {
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 1000
      });
      this.latFlag = wx.setStorageSync('lat',this.latitude);
      this.longFlag = wx.setStorageSync('long',this.longitude);
      this.equipInfo.status !== 'true' ? this.equipInfo.status = 'true' : '';
    }

    this.getEquipListInfoBySchoolId();
    this.$apply();
  }

// 点击marker时候显示相对应设备的信息
  switchEquipInfo(id) {
    console.log('点击设备时，根据 marker的id值来切换相对应的设备信息');
    // 根据id值来获取到相应的设备信息
    for (let i = 0; i < this.markers.length; i++) {
      let curMark = this.markers[i];
      if (curMark.id === id) {
        curMark.width = 60;
        curMark.height = 60;
      } else {
        curMark.width = 40;
        curMark.height = 40;
      }
    }
    this.equipListData.forEach((item) => {
      if (item.id === id) {
        this.equipInfo = item;
      }
    });
    id === Number(this.equipID) ? this.equipInfo.isCurEquip = true : this.equipInfo.isCurEquip = false;
    console.log('当前设备是否已经定位');
    if (String(this.locationFlag) === 'true') {
      this.equipInfo.status = 'true';
    }
    this.$apply();
  }

  // 计算出设备数 刷卡器数目，电话机数目
  handleResData(data) {
    let equipLength = data.length,
      cardLength = 0,
      phoneLength = 0,
      transferLength = 0;
    data.forEach(function (item) {
      switch (item.machineType) {
        case '0':
          cardLength++;
          break;
        case '1':
          phoneLength++;
          break;
        case '2':
          transferLength++;
          break;
      }
    });
    console.log('计算设备的数量');
    this.lengthInfo = {
      equipLength,
      cardLength,
      phoneLength
    };
    this.$apply();
  }

// 处理marker的小图标  当前的-> 其他设备的。
  handleMarkerIcon(data) {
    // 当前的 其他设备的 1 刷卡机 2 电话机 3刷卡@电话机
    for (let i = 0; i < data.length; i++) {
      let defaultObj = {},
        curData = data[i];
      defaultObj.width = 40;
      defaultObj.height = 40;

      for (let key in curData) {
        switch (key) {
          case 'id':
            defaultObj.id = curData[key];
            break;
          case 'latitude':
            defaultObj[key] = curData[key];
            break;
          case 'longitude':
            defaultObj[key] = curData[key];
            break;
        }
        if (key === 'machineType') {
          switch (curData[key]) {
            case '0':
              defaultObj.iconPath = '/images/card_icon.png';
              break;
            case '1':
              defaultObj.iconPath = '/images/phone_icon.png';
              break;
            case '2':
              defaultObj.iconPath = '/images/q_icon.png';
              break;
          }
        }
      }
      if (Number(this.equipID) === curData.id) {

        console.log('测试测试测试测试');
        console.log(Number(this.equipID) );


        defaultObj.iconPath = '/images/dq_icon.png';
      }
      this.markers.push(defaultObj);
      defaultObj = null;
    }
    this.equipListData = data;
    this.$apply();
  }

//  初始化页面数据
  initEquipData() {
    console.log('初始化之前页面的数据');


    let tempData = getCurrentPages();

    let data = this.$parent.globalData.curRepairData || tempData[tempData.length - 2].data.equipmentInfo || this.$parent.globalData.curPlantEquip;

    console.log(data);


    // 终端名称 终端类型 终端编号 是否已定位
    let defaultObj = {
      terminalName: '',
      terminalNum: '',
      typeName: '',
    };
    for (let key in defaultObj) {
      this.equipInfo[key] = data[key]
    }
    this.equipInfo.status = this.locationFlag;
    this.equipInfo.isCurEquip = true;
    this.$apply()
  }

//

}