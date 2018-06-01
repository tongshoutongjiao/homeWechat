import wepy from 'wepy'
import api from '../api.js'
import querystring from 'querystring';
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
    remarkFlag:false
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
          this.remarkFlag=true;
          this.inputValue.remarkAdress = e.detail.value;
          break;
      }
      this.$apply();
    },

    //  聚焦时获取到input中的内容
    getFocusValue(e) {
      let type = e.currentTarget.dataset.inputType;
      let obj = this.inputValue;
      console.log(e);
      console.log(e.detail.value);
      switch (type) {
        case 'simNum':
          console.log('simNum');
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
    }
  };


  async onLoad(e) {
    console.log('获取终端详情页面设备id');
    let id = e.equipId;
    console.log(e);
    console.log(id);
    this.terminalSN = e.equipSn;
    this.equipID = e.equipId;
    this.getEquipById(id);
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
      serialNum: '',//网关
      isLogin: '',// 状态
      lastTime: '',// 最后在线
      pname: '',// 安装人员
      installTime: '',//安装时间
      whiteNumTime: '',// 通告时间
      baoStrong: '',// 信号强度
      remark: '',// 备注,
      remarkAdress: '',// 备注地址
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

    this.equipmentInfo = defaultData;
    this.$apply();
  }

  async saveInfo() {
    if (this.savingFlag) {
      return;
    }
    this.savingFlag = true;
    let obj = this.inputValue;
    console.log(obj);
    let res = await api.saveEquipAddressInfo({
      method: 'POST',
      data: {
        id: this.equipID,
        remarkAdress: this.remarkFlag?obj.remarkAdress :this.equipmentInfo.remarkAdress,
        simNum: obj.simNum || this.equipmentInfo.simNum
      }
    });
    console.log('updateInfo');
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
      wepy.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 1000
      });
    }
  }


}
