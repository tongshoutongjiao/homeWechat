import wepy from 'wepy'
import api from '../api.js'
import querystring from 'querystring';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';

export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '终端详情'
  };
  data = {
    largeImgFlag: false,
    curPhotoList: [],
    equipID: null,
    terminalSN: null,
    schoolId: '',
    deleteIconInfo: {
      deleteIndex: '',// 删除图片的索引
    },
    wrapperFlag: false,// 是否允许滚动页面
    scrollLeft: '',
    simNum: '',
    inputFlag: true,// 如果卡号为11个数字1时，为可编辑状态，否则不可编辑
    equipmentInfo: {},
    imgUrlList: {
      farImgUrlList: [],
      closeImgUrlList: [],
      submitData: [],
    },
    inputValue: {},
    savingFlag: false,
    remarkFlag: false,
    locationFlag: false,// 地图定位标识
  };
  methods = {

    // 点击编辑sim卡号
    clickEditSimCard: function () {
      console.log('click edit simCard');
      this.inputFlag = true;
    },

    //   点击查看大图
    clickOperatePhoto: function (e) {
      commonMethods.clickCheckImg(e, this)
    },

    //  取消遮罩层效果
    cancelPhotoMask: function (e) {
      this.largeImgFlag = false;
      this.wrapperFlag = false;
    },

    //  左右滑动切换图片
    getSelectItem: function (e) {
      commonMethods.slideLargeImg(e, this);
    },

    //  获取到input框中的内容
    getInputValue(e) {
      let type = e.currentTarget.dataset.inputType;
      switch (type) {
        case 'simNum':
          this.inputValue.simNum = e.detail.value;
          break;
        case 'remark':
          this.remarkFlag = true;
          this.inputValue.remarkAdress = e.detail.value;
          break;
      }
      this.$apply();
    },

    //  聚焦时获取到input中的内容
    getFocusValue(e) {
      let type = e.currentTarget.dataset.inputType;
      let obj = this.inputValue;
      switch (type) {
        case 'simNum':
          this.inputValue.simNum = e.detail.value;
          let reg = /^\d{11}$/g;
          if (!reg.test(obj.simNum)) {
            wx.showToast({
              title: '请输入11位sim卡号',
              icon: 'none',
            });
            return;
          }
          break;
        case 'remark':
          this.inputValue.remarkAdress = e.detail.value;
          break;
      }

    },

    //  点击保存位置信息以及sim 信息
    clickSaveInfo(e) {
      this.saveInfo();
    },

    //   点击跳转至地图页面
    clickNavigateToMapPage(e) {
      console.log('终端详情页面');
      wepy.navigateTo({
        url: `/pages/mapPage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
      });
    }
  };


  async onLoad(e) {
    console.log('获取终端详情页面设备id');
    console.log(e);
    let id = e.equipId;
    this.terminalSN = e.equipSn;
    this.equipID = e.equipId;
    this.schoolId = e.schoolId;
    this.getEquipById(this.equipID);
  }

  async getEquipById(id) {
    let resData = await commonMethods.getEquipById(id);
    this.getUsageData(resData);
    this.$apply();
  }

  getUsageData(data) {
    let farArray = this.imgUrlList.farImgUrlList,
      closeArray = this.imgUrlList.closeImgUrlList;
    let defaultData = {
      schoolName: '',// 学校名
      terminalNum: '',// 终端编号
      terminalName: '',//终端名称
      typeName: '',// 终端类型
      simNum: '',//sim 卡号
      installAddress: '',// 安装位置
      softVersion: '',// 软件
      imei: '',// IMEI
      lastIp: '',//网关
      isLogin: '',// 状态
      lastTime: '',// 最后在线
      pname: '',// 安装人员
      installTime: '',//安装时间
      whiteNumTime: '',// 通告时间
      baoStrong: '',// 信号强度
      remark: '',// 备注,
      remarkAdress: '',// 备注地址
      latitude: '',
      longitude: '',
      terminalStatus:'',// 终端使用状态
    };

    for (let key in defaultData) {
      defaultData[key] = data[key];
    }
    for (let key in data) {
      switch (key) {
        case 'imgurl1':
          if (data[key] != null && data[key] !== 'null') {
            closeArray = closeArray || [];
            closeArray.push({
              url: data[key],
              picType: 'close',
            })
          }
          break;
        case 'imgurl2':
          if (data[key] != null && data[key] !== 'null') {
            closeArray = closeArray || [];
            closeArray.push({
              url: data[key],
              picType: 'close',
            });
          }
          break;
        case 'imgurl3':
          if (data[key] != null && data[key] !== 'null') {
            farArray = farArray || [];
            farArray.push({
              url: data[key],
              picType: 'far',
            });
          }
          break;
        case 'imgurl4':
          if (data[key] != null && data[key] !== 'null') {
            farArray = farArray || [];
            farArray.push({
              url: data[key],
              picType: 'far',
            });
          }
          break;
      }
    }
    [farArray, closeArray].forEach(function (item) {
      item.forEach(function (curPic, index) {
        curPic.index = index;
      })
    });


    // 添加定位标识
    if (String(defaultData.latitude) !== 'null' && String(defaultData.longitude) !== 'null') {
      //
      wx.setStorageSync('lat', defaultData.latitude);
      wx.setStorageSync('long', defaultData.longitude);
      this.locationFlag = true;
    } else {
      wx.removeStorageSync('lat');
      wx.removeStorageSync('long');
      this.locationFlag = false;
    }
    this.equipmentInfo = defaultData;
    this.$apply();
  }

  async saveInfo() {
    if (this.savingFlag) {
      return;
    }
    this.savingFlag = true;
    let obj = this.inputValue;
    let res = await api.saveEquipAddressInfo({
      method: 'POST',
      data: {
        id: this.equipID,
        remarkAdress: this.remarkFlag ? obj.remarkAdress : this.equipmentInfo.remarkAdress,
        simNum: obj.simNum || this.equipmentInfo.simNum
      }
    });
    console.log('保存信息查看结果');
    console.log(res);




    if (res.data.result === 200) {
      wepy.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1000
      });
      setTimeout(() => {
        this.savingFlag = false;
        wepy.navigateBack({
          delta: 1
        })
      }, 1000);
    } else {
      this.savingFlag = false;
      // let title=res.data.message
      // wepy.showToast({
      //   title: '失败',
      //   icon: 'none',
      //   duration: 1000
      // });
      wepy.showToast({
        title: '失败',
        icon: 'loading',
        duration: 1000
      });
    }
  }

  async onShow() {
    // 获取设备信息
    // 思路: 当前页面需要回显的数据只有一个，即设备定位的回显状态，所以将接口获取到的数据存储到localStorage中，然后如果在onShow 执行初始化函数。当另一个状态时，修改当前页面的定位状态
    // this.getEquipById(this.equipID);
    let lat = wx.getStorageSync('lat'), long = wx.getStorageSync('long');
    lat && long ? this.locationFlag = true : this.locationFlag = false;
    this.$apply();
  }

}
