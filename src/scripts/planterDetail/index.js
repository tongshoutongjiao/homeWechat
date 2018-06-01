import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';

export default class Index extends wepy.page {

  config = {
    navigationBarTitleText: '安装'
  };
  data = {
    showPhoto: false,
    endStatus: '0',
    picType: '',
    date: {},// 日期
    imgId: '',
    plantTypeFlag: true,
    plantDateFlag: false,
    scrollLeft: '',
    largeImgFlag: false,// 点击查看大图
    deleteIconInfo: {},
    curPhotoList: [],// 大图图片列表
    savingFlag: false,

    typeList: ['planter', 'remark'],//  备注

    alertData: {

      // 终端使用状态数据
      endStatusData: {
        array: ['未使用', '在使用', '已丢失'],
        endStatusIndex: 0,
      },

      // 终端类型
      endType: {
        array: ['宿舍终端', '新电话终端', '考勤终端'],
        endTypeIndex: 0
      },

      //  安装类型
      plantType: {
        array: ['加装', '新装', '移机', '改造'],
        plantTypeIndex: 0
      }
    },
    equipInfo: {},
    plantEquip: {},// 本页面设备安装数据
    inputValue: {},
    selectType: {},
    selectOptions: {},
    imgUrlList: {
      farImgUrlList: [],
      closeImgUrlList: [],
      submitData: [],
    },
    defaultInstallType: '',// 安装类型默认值
    typeNameFlag: false,//
    typeName: '',//终端类型
  };

  methods = {

    // 安装日期
    bindStartDateChange: function (e) {
      this.date.startDate = e.detail.value;
      this.selectType.installTime = e.detail.value;
      this.plantDateFlag = true;
      this.$apply();
    },

    // 改变终端使用状态
    bindEndStatusChange: function (e) {
      this.alertData.endStatusData.endStatusIndex = e.detail.value;
      this.selectType.terminalStatus = e.detail.value;
      this.$apply();
    },

    // 故障终端主板
    bindEndType: function (e) {
      this.typeNameFlag = false;
      let data = this.alertData.endType.array[e.detail.value];
      this.alertData.endType.endTypeIndex = e.detail.value;

      for (let key in data) {
        this.selectType[key] = data[key];
      }
    },

    // 点击选择终端类型
    bindPlantType: function (e) {
      this.alertData.plantType.plantTypeIndex = e.detail.value;

      // 提交的时候判断该字段
      this.plantTypeFlag = false;
      this.selectType.installType = this.alertData.plantType.array[this.alertData.plantType.plantTypeIndex];
    },

    //  跳转页面并选择对应的数据
    clickChooseOptions: function (e) {
      let type = e.currentTarget.dataset.type;
      switch (type) {
        case 'repairPerson':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'remark':
          // 调转之前修改静态数据， 安装跟维修时，选项不同
          // this.$parent.globalData.remark.pop();
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

    //  点击选择初始启用状态
    clickSelectStatus: function (e) {
      let endStatus = e.currentTarget.dataset.endStatus;
      this.endStatus = endStatus;
      this.selectType.isActive = +endStatus;
      this.$apply();
    },

    //   点击保存安装设备的信息
    clickSaveEquipInfo: function (e) {
      let self = this;
      if (this.savingFlag) {
        return;
      }
      this.savingFlag = true;
      let userName = wepy.getStorageSync('userName'),
        userId = wepy.getStorageSync('userId');


      let defaultInfo = {
        terminalId: '',//设备id
        userName: '',//用户名
        userId: '',//用户名Id
        terminalName: '',// 终端名字
        simNum: '',//sim卡号
        typeId: '',// 终端类型ID
        typeName: '',// 终端类型
        typeNameDb: '',//终端类型数据库名称
        installAddress: '',// 安装地址
        terminalStatus: '',// 终端使用状态
        isActive: '',// 终端启用状态
        installTime: '',// 终端安装时间
        installType: '',// 终端安装类型
        pname: '',// 安装人员
        installationP: '',//安装人员ID
        remark: '',// 备注
        imgId: '',//照片表Id
        imgNum: '',// 图片数量
        imgUrl1: '',// 近景图1
        imgUrl2: '',// 近景图2
        imgUrl3: '',// 远景图1
        imgUrl4: '',// 远景图2
      };
      let obj = this.inputValue;
      let reg = /^\d{11}$/g;

      obj.simNum = obj.simNum || this.plantEquip.simNum;
      if (!reg.test(obj.simNum)) {
        wx.showToast({
          title: '请输入11位sim卡号',
          icon: 'none',
        });
        return;
      }

      if (!this.plantDateFlag) {
        wx.showToast({
          title: '请先选择安装时间',
          icon: 'none',
        });
        this.savingFlag = false;
        return;
      }

      if (this.plantTypeFlag) {
        wx.showToast({
          title: '请选择安装类型',
          icon: 'none',
        });
        this.savingFlag = false;
        return;
      }

      // 判读图片
      commonMethods.handleImgUrlInfo(self);

      // 判断用户是否点击启用状态，
      this.selectType.isActive = this.selectType.isActive || this.plantEquip.isLogin;
      this.selectType.terminalStatus = this.selectType.terminalStatus || this.plantEquip.terminalState;
      // 1 终端名称 sim卡号 安装位置
      // 2 是否启用 安装类型  终端类型  终端使用状态  终端安装时间
      // 3 安装人员 备注
      // 4 远景照 近景照
      // 其他的参数  this.plantEquip
      this.plantEquip.terminalId = this.plantEquip.id;
      Object.assign(defaultInfo, this.plantEquip, this.inputValue, this.selectType, this.selectOptions, this.imgUrlList.submitData, {
        userId,
        userName
      });
      this.submitEquipInfo(defaultInfo);
      this.$apply();
    },

    //  获取input框中的值
    getInputValue(e) {
      let type = e.currentTarget.dataset.inputType;
      switch (type) {
        case 'simNum':
          this.inputValue.simNum = e.detail.value;
          break;
        case 'installAddress':
          this.inputValue.installAddress = e.detail.value;
          break;
        case 'terminalName':
          this.inputValue.terminalName = e.detail.value;
          break;
      }

    },

    //  聚焦时获取到input中的内容
    getFocusValue(e) {
      let type = e.currentTarget.dataset.inputType;
      switch (type) {
        case 'simNum':
          this.inputValue.simNum = e.detail.value;
          break;
        case 'installAddress':
          this.inputValue.installAddress = e.detail.value;

          break;
        case 'terminalName':

          this.inputValue.terminalName = e.detail.value;
          break;
      }

    },

    //   点击查看大图
    clickOperatePhoto: function (e) {

      this.$apply();
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
      commonMethods.slideLargeImg(e, this);
    },
  };

  onLoad() {
    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onShow() {
    console.log('show..');
    //   回显选择的globalDate中的数据
    this.echoSelectedData()
  }

  async initData(e) {
    let data = this.$parent.globalData;
    this.plantEquip = data.curPlantEquip;
    this.alertData.endType.array = data.terminalTypeData;
    this.alertData.endStatusData.endStatusIndex = data.curPlantEquip.terminalState;
    this.endStatus = this.plantEquip.isLogin;
    this._getEquipInfoById();
  }

  echoSelectedData() {
    let newData = [],
      idData = [];
    let data = this.$parent.globalData;
    for (let key in data) {
      switch (key) {
        case 'repairPerson':
          newData = [];
          data.repairPerson.filter(function (item) {
            if (item.selected === true) {
              newData.push(item.name);
              idData.push(item.id)
            }
          });
          this.selectOptions.installationP = idData.join(',');
          this.selectOptions.pname = newData.join(',');
          this.equipInfo.plantPersonSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
        case 'remark':
          newData = [];
          data.remark.filter(function (item) {
            item.selected === true ? newData.push(item.customName || item.name) : '';
          });
          this.selectOptions.remark = newData.join(',');
          this.equipInfo.remarkSelected = newData.join(',').length > 14 ? newData.join(',').substring(0, 14) + '...' : newData.join(',');
          break;
      }
    }
    this.$apply();
  }

  async submitEquipInfo(defaultInfo) {
    let res = await api.installCurEquip({
      method: 'POST',
      data: defaultInfo
    });
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
      }, 1000)
    } else {
      this.savingFlag = false;
      wepy.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 1000
      });
    }
  }

  // 根据id回显默认的数据
  async _getEquipInfoById() {
    let id = this.plantEquip.id;
    let resData = await commonMethods.getEquipById(id);
    let defaultObj = {
      installTime: '',
      installType: '',
      installationP: '',
      pname: '',
      remark: '',
      typeName: '',
      typeId: '',
      typeNameDb: '',
      isActive: '',
      imgId: '',
      imgNum: '',
      imgurl1: '',
      imgurl2: '',
      imgurl3: '',
      imgurl4: '',

    };
    for (let key in defaultObj) {
      defaultObj[key] = resData[key]
    }
    if (!!defaultObj.installTime) {
      this.plantDateFlag = true;
      this.date.startDate = defaultObj.installTime.substr(0, 10);
      this.selectType.installTime = defaultObj.installTime.substr(0, 10);
    }
    if (!!defaultObj.installType) {
      this.selectType.installType = defaultObj.installType;
      this.defaultInstallType = defaultObj.installType;
      this.plantTypeFlag = false;
    }
    if (!!defaultObj.pname) {
      let plantPerson = this.$parent.globalData.repairPerson;
      this.equipInfo.plantPersonSelected = defaultObj.pname;
      let tempArray = defaultObj.pname.split(',');
      tempArray.forEach(function (item) {
        plantPerson.forEach(function (plantP, index) {
          if (plantP.name === item) {
            plantP.selected = true;
          }
        })
      });
      this.selectOptions.pname = defaultObj.pname;
      this.selectOptions.installationP = defaultObj.installationP;
    }
    if (!!defaultObj.remark) {
      let remark = this.$parent.globalData.remark;
      this.equipInfo.remarkSelected = defaultObj.remark;
      let tempArray = defaultObj.remark.split(',');
      console.log(remark);
      tempArray.forEach(function (item) {
        let flag = false;
        for (let i = 0; i < remark.length; i++) {
          let curRemark = remark[i];
          if (curRemark.name === item) {
            curRemark.selected = true;
            flag = true;
          }
        }
        if (flag === false) {
          remark[0].selected = true;
          remark[0].customName = item;
        }
      });
      this.selectOptions.remark = defaultObj.remark;
    }
    if (!!defaultObj.typeName) {
      this.typeNameFlag = true;
      this.typeName = defaultObj.typeName;
      this.selectType.typeNameDb = defaultObj.typeNameDb;
      this.selectType.typeId = defaultObj.typeId;
      this.selectType.typeName = defaultObj.typeName;
    }
    if (!!defaultObj.isActive) {
      this.endStatus = defaultObj.isActive;
    }
    if (!!defaultObj.imgId) {
      this.imgId = defaultObj.imgId;
    }
    if (!!defaultObj.imgNum) {
      this.imgUrlList.submitData.imgNum = defaultObj.imgNum;
    }
    if (!!defaultObj.imgurl1) {
      let closeImgUrl = this.imgUrlList.closeImgUrlList;
      closeImgUrl.push({
        url: defaultObj.imgurl1,
        picType: 'close'
      })
    }
    if (!!defaultObj.imgurl2) {
      let closeImgUrl = this.imgUrlList.closeImgUrlList;
      closeImgUrl.push({
        url: defaultObj.imgurl2,
        picType: 'close'
      })
    }
    if (!!defaultObj.imgurl3) {
      let farImgUrl = this.imgUrlList.farImgUrlList;
      farImgUrl.push({
        url: defaultObj.imgurl3,
        picType: 'far'
      })

    }
    if (!!defaultObj.imgurl4) {
      let farImgUrl = this.imgUrlList.farImgUrlList;
      farImgUrl.push({
        url: defaultObj.imgurl4,
        picType: 'far'
      })
    }

    this.addImgIndex();

    this.$apply()
  }

//  回显图片添加索引

  addImgIndex() {
    let farImgArray = this.imgUrlList.farImgUrlList,
      closeImgArray = this.imgUrlList.closeImgUrlList;
    [farImgArray, closeImgArray].forEach(function (item) {
      item.forEach(function (imgObj, index) {
        imgObj.index = index;
      })

    });
    this.$apply();
  }
}