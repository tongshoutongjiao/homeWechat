import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';

export default class Index extends wepy.page {

  config = {
    navigationBarTitleText: '维修'
  };
  data = {
    showPhoto: false,
    picType: '',
    imgId: '',
    date: {
      submitData: {},// 提交信息
    },// 日期
    curPhoto: '',
    scrollLeft: '',// 滚动条的位置
    deleteIconInfo: {},
    curPhotoList: [],// 大图图片列表
    inputValue: {},// 用户input框中输入的内容
    alertData: {
      // 终端使用状态数据
      endStatusData: {
        array: ['未使用', '在使用', '已丢失'],
        endStatusIndex: 0,
      },
      //
      endBoard: {
        array: ['V2主板', 'V3主板', 'V5主板'],
        endBoardIndex: 0

      },
      submitData: {}
    },
    imgUrlList: {
      farImgUrlList: [],
      closeImgUrlList: [],
      submitData: [],
    },
    selectOptions: {},
    largeImgFlag: false,
    repairData: [],// 设备数据
    recordId: '',// 维修记录
    mainBoardFlag: true,// 故障终端主板
    terminalStateFlag: true,// 终端使用状态
    savingFlag: false,// 保存标志
    latFlag: false,
    longFlag: false,

  };

  methods = {
    // 接单日期
    bindStartDateChange: function (e) {
      this.date.startDate = e.detail.value;
      this.date.submitData.orderTime = this.date.startDate;
    },

    // 维修日期
    bindRepairDateChange: function (e) {
      this.date.repairDate = e.detail.value;
      this.date.submitData.serviceTime = this.date.repairDate;
    },

    // 改变终端使用状态
    bindEndStatusChange: function (e) {
      this.terminalStateFlag = false;
      this.alertData.endStatusData.endStatusIndex = e.detail.value;
      this.alertData.submitData.terminalState = e.detail.value;
    },

    // 故障终端主板
    bindEndBoard: function (e) {
      this.mainBoardFlag = false;
      this.alertData.endBoard.endBoardIndex = e.detail.value;
      this.alertData.submitData.faultMainboard = this.alertData.endBoard.array[e.detail.value];
    },

    //  跳转页面并选择对应的数据
    clickChooseOptions: function (e) {
      let type = e.currentTarget.dataset.type;
      switch (type) {
        case'faultType':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'repairPerson':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'hardware':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'faultView':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'faultReason':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'handleMeasures':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'remark':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
      }
    },

    //  点击上传图片
    clickUploadImage: function (e) {
      commonMethods.uploadEquipImage(e, this);
    },

    //   点击查看大图
    clickOperatePhoto: function (e) {
      commonMethods.clickCheckImg(e, this);
    },

    //  取消遮罩层效果
    cancelPhotoMask: function (e) {
      this.largeImgFlag = false;
    },

    // 点击删除当前图片
    deleteCurPhoto: function () {
      commonMethods.deleteCurPhoto(this);
    },

    //  左右滑动切换图片
    getSelectItem: function (e) {
      commonMethods.slideLargeImg(e, this)
    },

    // 点击更新设备信息
    clickUpdateEquipInfo: function (e) {
      if (this.savingFlag) {
        return;
      }
      this.savingFlag = true;
      this.inputValue.simNum = this.inputValue.simNum || this.repairData.simNum;
      let obj = this.inputValue;
      let reg = /^\d{11}$/g;
      if (!reg.test(obj.simNum)) {
        wx.showToast({
          title: '请输入11位sim卡号',
          icon: 'none',
        });
        this.savingFlag = false;
        return;
      }
      // 点击的时候判断是更新还是编辑，如果是更新，首先获取到维修单id,如果是新增，直接操作，不需要传维修单ID
      this.updateEquipInfo();
      this.$apply()
    },

    //  获取到input框中的内容
    getInputValue(e) {
      let type = e.currentTarget.dataset.inputType;
      let value = e.detail.value;
      value = value.replace(/(^\s*)|(\s*$)/g, '');
      console.log('取出字符串前后端空格');
      console.log(value);

      switch (type) {
        case 'simNum':
          this.inputValue.simNum = value;
          break;
        case 'installAddress':
          this.inputValue.installAddress = value;
          break;
        case 'faultProgram':
          this.inputValue.faultProgram = value;
          break;
        case 'terminalName':
          this.inputValue.terminalName = value;
          break;
      }
    },

    //  聚焦时获取到input中的内容
    getFocusValue(e) {
      let type = e.currentTarget.dataset.inputType;
      let value = e.detail.value;
      value = value.replace(/(^\s*)|(\s*$)/g, '');
      switch (type) {
        case 'simNum':
          this.inputValue.simNum = value;
          break;
        case 'installAddress':
          this.inputValue.installAddress = value;
          break;
        case 'faultProgram':
          this.inputValue.faultProgram = value;
          break;
        case 'terminalName':
          this.inputValue.terminalName = value;
          break;
      }

    },

    // 点击跳转地图定位页面
    clickNavigateToMapPage: function (e) {
      wepy.navigateTo({
        url: `/pages/mapPage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
      });
    }

  };

  onLoad(e) {
    // 初始化页面数据
    this.recordId = e.recordId || '';

    setTimeout(e => this.initData());
  }

  onShow() {
    //   回显选择的globalDate中的数据 地图 条件选择
    this.echoSelectedData();
     console.log(this.$parent.globalData);
  }

  onUnload() {
    // 清除之前的定位信息
    wx.removeStorageSync('lat');
    wx.removeStorageSync('long');
  }
  echoSelectedData() {
    let newData = [];
    let data = this.$parent.globalData;
    let selectOptions = this.selectOptions;

    for (let key in data) {
      switch (key) {
        case 'repairPerson':
          newData = [];
          data.repairPerson.filter(function (item) {
            if (item.selected === true) {
              newData.push(item.name);
            }
          });
          selectOptions.serviceman = newData.join(',');
          selectOptions.repairPersonSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'remark':
          newData = [];
          data.remark.filter(function (item) {
            item.selected === true ? newData.push(item.customName || item.name) : '';
          });
          selectOptions.remark = newData.join(',');
          selectOptions.remarkSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'hardware':
          newData = [];
          data.hardware.filter(function (item) {
            item.selected === true ? newData.push(item.customName || item.name) : '';
          });
          selectOptions.hardwareType = newData.join(',');
          selectOptions.hardwareSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'faultType':
          newData = [];
          data.faultType.filter(function (item) {
            item.selected === true ? newData.push(item.name) : '';
          });
          selectOptions.faultType = newData.join(',');
          selectOptions.faultTypeSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'handleMeasures':
          newData = [];
          data.handleMeasures.filter(function (item) {
            item.selected === true ? newData.push(item.customName || item.name) : '';
          });
          selectOptions.treatmentMeasure = newData.join(',');
          selectOptions.handleMeasuresSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'faultView':
          newData = [];
          data.faultView.filter(function (item) {
            item.selected === true ? newData.push(item.customName || item.name) : '';
          });
          selectOptions.faultPhenomenon = newData.join(',');
          selectOptions.faultViewSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'faultReason':
          newData = [];
          data.faultReason.filter(function (item) {
            item.selected === true ? newData.push(item.customName || item.name) : '';
          });
          selectOptions.faultCause = newData.join(',');
          selectOptions.faultReasonSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break
      }
    }
    this.handleCustom();

    //
    //
    // this.latFlag = wx.getStorageSync('lat');
    // this.longFlag = wx.getStorageSync('long');
    this.$apply()
  }

  async updateEquipInfo() {
    let submitDate = this.date.submitData;

    if (!this.repairData.orderTime && !submitDate.orderTime) {
      wx.showToast({
        title: '请选择接单日期',
        icon: 'none',
      });
      this.savingFlag = false;
      return;
    }
    if (!this.repairData.serviceTime && !submitDate.serviceTime) {
      wx.showToast({
        title: '请选择维修日期',
        icon: 'none',
      });
      this.savingFlag = false;
      return;
    }
    let userName = wepy.getStorageSync('userName'),
      userId = wepy.getStorageSync('userId');
    let equipInfoData = {
      id: '',//维修单id
      terminalId: '',//终端id
      orderTime: '',//接单日期
      serviceTime: '',//维修日期
      terminalNum: '',// 终端编号
      schoolName: '',// 学校名字
      schoolId: '',//学校ID
      simNum: '',//sim卡号
      terminalName: '',// 终端名字
      installAddress: '',// 安装地址
      typeName: '',// 终端类型
      terminalState: '',// 终端使用状态
      faultProgram: '',//故障终端程序
      faultMainboard: '',//故障终端主板
      faultType: '',// 故障类型
      hardwareType: '',// 硬件类型
      faultCause: '',// 故障原因
      faultPhenomenon: '',// 故障现象
      treatmentMeasure: '',//处理措施
      remark: '',// 备注
      serviceman: '',// 维修人员
      imgId: '',//照片表Id
      imgnum: '',
      imgUrl1: '',// 近景图1
      imgUrl2: '',// 近景图2
      imgUrl3: '',// 远景图1
      imgUrl4: '',// 远景图2
    };

    // 使用对象合并的方式 判断是否是新建维修单  equipInfoData inputValue globalData
    // 1 设备信息 2 input框输入内容 3弹出框  4 日期 5 图片 6 另一个页面的内容
    this.alertData.submitData.faultMainboard = this.alertData.submitData.faultMainboard || this.alertData.endBoard.array[0];
    this.alertData.submitData.terminalState = this.alertData.submitData.terminalState || this.alertData.endStatusData.endStatusIndex;

    // 处理图片信息
    commonMethods.handleImgUrlInfo(this);

    for (let key in this.repairData) {
      if (key.includes('imgUrl')) {
        delete this.repairData[key]
      }
    }


    Object.assign(equipInfoData, this.repairData, this.inputValue, this.alertData.submitData, this.date.submitData, this.selectOptions, this.imgUrlList.submitData, {
      userName,
      userId
    });
    let res = await api.updateEquipInfo({
      method: 'POST',
      data: equipInfoData
    });
    if (res.data.result === 200) {
      this.savingFlag = false;
      wepy.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1000
      });
      setTimeout(() => {
        wepy.navigateBack({
          delta: 1
        })
      }, 1000);
      this.savingFlag = false;
    } else {
      this.savingFlag = false;
      wepy.showToast({
        title: `${ res.data.message}`,
        icon: 'none',
        duration: 1000
      });
    }
    this.$apply();
  }

  async handleDefaultData() {
    let data = this.$parent.globalData;
    // 将之前选中的设备信息，存放至当前页面，
    this.repairData = {};

    // 判断recordId是否存在,存在的话，使用record 中的数据替代，否则使用原来的
    if (this.recordId) {
      let recordId = this.recordId - 1;
      this.repairData = data.recordData[recordId];
      this.imgId = data.recordData[recordId].imgId;
      //   需要对图片和默认的数据进行处理
      for (let key in this.repairData) {
        if (key.includes('imgUrl')) {
          switch (key) {
            case 'imgUrl1':
              this.repairData.imgUrl1 && this.repairData.imgUrl1 !== 'null' ?
                this.imgUrlList.closeImgUrlList.push({
                  picType: 'close',
                  index: 0,
                  url: this.repairData.imgUrl1
                }) : "";
              break;
            case 'imgUrl2':
              this.repairData.imgUrl2 && this.repairData.imgUrl2 !== 'null' ?
                this.imgUrlList.closeImgUrlList.push({
                  picType: 'close',
                  index: 1,
                  url: this.repairData.imgUrl2
                }) : '';
              break;
            case 'imgUrl3':
              this.repairData.imgUrl3 && this.repairData.imgUrl3 !== 'null' ?
                this.imgUrlList.farImgUrlList.push({
                  picType: 'far',
                  index: 0,
                  url: this.repairData.imgUrl3
                }) : '';
              break;
            case 'imgUrl4':
              this.repairData.imgUrl4 && this.repairData.imgUrl4 !== 'null' ?
                this.imgUrlList.farImgUrlList.push({
                  picType: 'far',
                  index: 1,
                  url: this.repairData.imgUrl4
                }) : '';
              break;
          }
        }
        switch (key) {
          case 'serviceman':
            if (this.repairData.serviceman && this.repairData.serviceman !== 'null') {
              this.handleDefaultSelect('serviceman');
            }
            break;
          case 'faultType':
            if (this.repairData.faultType && this.repairData.faultType !== 'null') {
              this.handleDefaultSelect('faultType');
            }
            break;
          case 'hardwareType':
            if (this.repairData.hardwareType && this.repairData.hardwareType !== 'null') {
              this.handleDefaultSelect('hardwareType');
            }
            break;
          case 'faultPhenomenon':
            if (this.repairData.faultPhenomenon && this.repairData.faultPhenomenon !== 'null') {
              this.handleDefaultSelect('faultPhenomenon');
            }
            break;
          case 'faultCause':
            if (this.repairData.faultCause && this.repairData.faultCause !== 'null') {
              this.handleDefaultSelect('faultCause');
            }
            break;
          case 'treatmentMeasure':
            if (this.repairData.treatmentMeasure && this.repairData.treatmentMeasure !== 'null') {
              this.handleDefaultSelect('treatmentMeasure');
            }
            break;
          case 'remark':
            if (this.repairData.remark && this.repairData.remark !== 'null') {
              this.handleDefaultSelect('remark');
            }
            break;
        }
      }
    }
    else {
      for (let key in data.curRepairData) {
        if (key === 'id') {
          this.repairData.terminalId = data.curRepairData[key];
        } else {
          this.repairData[key] = data.curRepairData[key];
        }
      }
      ['index', 'active'].forEach((item) => {
        delete this.repairData[item]
      });
      this.repairData.terminalId = data.curRepairData.id;
    }

    //   处理定位数据
    String(this.repairData.latitude) !== 'null' ? wx.setStorageSync('lat', this.repairData.latitude) : wx.removeStorageSync('lat');

    String(this.repairData.longitude) !== 'null' ? wx.setStorageSync('long', this.repairData.longitude) : wx.removeStorageSync('long');
    this.latFlag = wx.getStorageSync('lat');
    this.longFlag = wx.getStorageSync('long');

    this.$apply();
  }

  async initData(e) {
    // 如果有维修记录，先渲染维修的数据，而不是默认值
    this.handleDefaultData();
    this.handleCustom();


  }

  handleDefaultSelect(type) {
    let nameString = null;
    switch (type) {
      case 'serviceman':
        nameString = this.repairData.serviceman;
        this._handleSelectData(nameString, 'repairPerson');
        break;
      case 'faultType':
        nameString = this.repairData.faultType;
        this._handleSelectData(nameString, 'faultType');
        break;
      case 'hardwareType':
        // 硬件类型
        nameString = this.repairData.hardwareType;
        this._handleSelectData(nameString, 'hardware');
        break;
      case 'faultPhenomenon':
        // 故障现象
        nameString = this.repairData.faultPhenomenon;
        this._handleSelectData(nameString, 'faultView');
        break;
      case 'faultCause':
        // 故障原因
        nameString = this.repairData.faultCause;
        this._handleSelectData(nameString, 'faultReason');
        break;
      case 'treatmentMeasure':
        // 处理措施
        nameString = this.repairData.treatmentMeasure;
        this._handleSelectData(nameString, 'handleMeasures');
        break;
      case 'remark':
        // 备注
        nameString = this.repairData.remark;
        this._handleSelectData(nameString, 'remark');
        break;
    }
  }

//   二次处理选中数据
  _handleSelectData(nameString, selectName) {
    let data = this.$parent.globalData;
    let name = nameString.indexOf(',') !== -1 ? nameString.split(',') : nameString;
    if (data[`${selectName}`][0].name === '自定义') {
      if (typeof name === 'object') {
        name.forEach(function (item) {
          let flag = false;
          for (let i = 0; i < data[`${selectName}`].length; i++) {
            let curPerson = data[`${selectName}`][i];
            if (curPerson.name === item) {
              curPerson.selected = true;
              flag = true;
            }
          }
          if (flag === false) {
            data[`${selectName}`][0].selected = true;
            data[`${selectName}`][0].customName = item;
          }
        })
      } else {
        let flag = false;
        for (let i = 0; i < data[`${selectName}`].length; i++) {
          let curPerson = data[`${selectName}`][i];
          if (curPerson.name === name) {
            curPerson.selected = true;
            flag = true;
          }
        }
        if (flag === false) {
          data[`${selectName}`][0].selected = true;
          data[`${selectName}`][0].customName = name;
        }
      }

    }
    else {
      // 没有自定义
      if (typeof name === 'object') {
        name.forEach(function (item) {

          for (let i = 0; i < data[`${selectName}`].length; i++) {
            let curPerson = data[`${selectName}`][i];
            if (curPerson.name === item) {
              curPerson.selected = true;
            }
          }
        })
      } else {
        for (let i = 0; i < data[`${selectName}`].length; i++) {
          let curPerson = data[`${selectName}`][i];
          if (curPerson.name === name) {
            curPerson.selected = true;
          }
        }
      }
    }
    this.echoSelectedData();

    this.$apply();
  }

// 处理自定义的数据
  handleCustom() {

    //   思路:包括自定义的五种情况：1 故障现象 2 故障原因 3硬件类型 4 处理措施 5备注
    let data = this.$parent.globalData;
    ['remark', 'hardware', 'handleMeasures', 'faultView', 'faultReason'].forEach((item) => {
      if (this.$parent.globalData[`${item}`][0].selected === true && this.$parent.globalData[`${item}`][0].customName == undefined) {
        this.selectOptions[`${item}Selected`] = this.selectOptions[`${item}Selected`].length > 4 && this.selectOptions[`${item}Selected`].slice(0, 3) == '自定义' ? this.selectOptions[`${item}Selected`].slice(4) : ''
      }
    });
    this.$apply();
  }
}