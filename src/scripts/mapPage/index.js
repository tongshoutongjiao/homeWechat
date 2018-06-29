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
    equipID: '',
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
    equipInfo: {
      equipNum: '10',
      cardNum: '8',
      phoneNum: '12',
      terminalName: '黄壳彩屏',
      terminalNum: '15245655525',
      machineType: '新电话终端',
      status: 1,
      isCurEquip: true
    },
    equipListData: [],// 所有的设备信息
    markers: [
      // 当前的（蓝色标志） 其他的（三种不同类型的）
      {
        iconPath: "/images/center_icon.png",
        id: 0,
        latitude: 23.099994,
        longitude: 113.324520,
        width: 60,
        height: 60
      },
    ],
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
      this.getCurLocation();
    },

    clickCollapseBox: function () {
      console.log('点击合起设备盒子');
      this.displayStatus = !this.displayStatus;
      this.mapHeight = this.displayStatus ? '738rpx' : (this.deviceInfo.deviceHeight - 38) + 'px';
      this.$apply();
    },

    //  点击转换
    markertap: function (e) {
      let id = e.markerId;
      this.switchEquipInfo(id);
    },
  };

  onLoad(e) {
    // 当前页面需要知道的信息 schoolId 设备id
    this.schoolId = e.schoolId;
    this.equipID = e.equipId;
    this.locationFlag = e.locationFlag;
    console.log('首先加载页面的信息信息信息');
    console.log(e);
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
  }

  // 获取设备的高度和宽度
  getDeviceInfo() {
    console.log('获取设备的高度和宽度');
    wx.getSystemInfo({
      success: (res) => {
        console.log(res);
        this.deviceInfo.deviceHeight = res.windowHeight;
        this.$apply();
      }
    })
  }

  // 定位当前设备
  getCurLocation() {

    // 当前设备的信息
    console.log(this.$parent.globalData);


    // 判断设备是否已定位，如果未定位，则定位当前位置，否则直接定位到设备之前的位置
    if (this.locationFlag === 'true') {
      console.log('已经定位过啦啦啦');
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
    this.setMarkers();
    this.getEquipListInfoBySchoolId();
    this.$apply();
  }

  // 设置当前设备的经纬度
  setMarkers() {
    let curMarkerObj = this.markers[0];
    curMarkerObj.latitude = this.latitude;
    curMarkerObj.longitude = this.longitude;
    curMarkerObj.iconPath = "/images/dq_icon.png";
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
    console.log(res);
    if (res.data.result === 200) {
      console.log(res);
      let data = res.data.data;
      this.handleResData(data);
      this.handleMarkerIcon(data);
    }
    if (res.data.result === 300) {
      console.log('该学校第一次定位设备');
      let data = [];
      this.handleResData(data);
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
      })

    }

    console.log(res);
  }

//  点击marker时候显示相对应设备的信息
  switchEquipInfo(id) {
    console.log('点击设备时，根据 marker的id值来切换相对应的设备信息');
    // 根据id值来获取到相应的设备信息
    this.markers.forEach((item) => {
      if (item.id === id) {
        item.width = 80;
        item.height = 80;
      } else {
        item.width = 60;
        item.height = 60;
      }
    });
    if (id === 0) {
      this.equipInfo = {
        equipNum: '10',
        cardNum: '8',
        phoneNum: '12',
        terminalName: '黄壳彩屏',
        terminalNum: '15245655525',
        machineType: '新电话终端',
        status: 1,
        isCurEquip: true
      }
    } else {
      this.equipListData.forEach((item) => {
        if (item.id === id) {
          console.log('item.id' + item.id);
          console.log(id);
          this.equipInfo = item;
          this.$apply();
        }
      });
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
    console.log('测试数据');
    console.log(data);
    console.log('处理icon图标,并将设备信息经纬度同时同步到marker中');

    // 当前的 其他设备的 1 刷卡机 2 电话机 3刷卡@电话机
    for (let i = 0; i < data.length; i++) {
      let defaultObj = {},
        curData = data[i];
      defaultObj.width = 60;
      defaultObj.height = 60;
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
      this.markers.push(defaultObj);
      defaultObj = null;
    }
    console.log('所有的标记点');
    console.log(this.markers);
    this.equipListData = data;
    this.$apply();
  }
}