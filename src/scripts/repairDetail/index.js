import wepy from 'wepy';
import api from '../api';
import uploadImg from '../components/uploadImg/uploadImg';
import * as Toolkit from '../utils/toolkit';


// http://img.967111.com/_1526623776505.jpg
// http://img.967111.com/_1526623788668.jpg
// 从后台获取前景照后景照图片时，如果照片长度大于两张，则修改添加图标的默认状态
export default class Index extends wepy.page {
  components = {
    "upload-img": uploadImg
  };
  config = {
    navigationBarTitleText: '维修'
  };
  events = {
    'take-photo': ret => {
      console.log('ret');
      console.log(ret);
    },
    'getImgUrl': ret => {
      this.repairInfo.farImgUrlList = this.repairInfo.farImgUrlList ? this.repairInfo.farImgUrlList : [];
      this.repairInfo.closeImgUrlList = this.repairInfo.closeImgUrlList ? this.repairInfo.closeImgUrlList : [];
      this.picType === 'far' ? this.repairInfo.farImgUrlList.push({url: ret.url}) : this.repairInfo.closeImgUrlList.push({url: ret.url});
      this.$apply();
    }
  };

  data = {
    showPhoto: false,
    picType: '',
    date: {
      submitData: {},// 提交信息
    },// 日期
    curPhoto: '',
    scrollLeft: '',// 滚动条的位置
    deleteIconInfo: {},
    curPhotoList: [],// 大图图片列表
    inputValue: {},// 用户input框中输入的内容
    typeList: ['faultType', 'repairPerson', 'hardware', 'faultView', 'faultReason', 'handleMeasures', 'remark'],//  故障类型，维修人员，硬件类型，故障现象，故障原因，处理措施，备注

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
    repairInfo: {
      farImgUrlList: [],
      closeImgUrlList: [],
      submitData: {
        imgId: '',
        imgNum: '',

      },
    },// 本页面维修数据
    largeImgFlag: false,
    repairData: [],// 设备数据
    recordId: '',// 维修记录
    mainBoardFlag:true,// 故障终端主板
    terminalStateFlag:true,// 终端使用状态
  };

  methods = {
    // 接单日期
    bindStartDateChange: function (e) {
      console.log(e);
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
      this.terminalStateFlag=false;
      this.alertData.endStatusData.endStatusIndex = e.detail.value;
      this.alertData.submitData.terminalState = e.detail.value;
    },

    // 故障终端主板
    bindEndBoard: function (e) {
      // 测试
      console.log('mainBoardFlag');
      this.mainBoardFlag=false;
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
          console.log('repairPerson')
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
      console.log('执行上传图片功能');
      let picType = e.currentTarget.dataset.picType;
      // this.$invoke('upload-img', 'toggle', true);
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          let tempFilePaths = res.tempFilePaths;
          this.uploadImg(tempFilePaths, picType);
        }
      });
      if (picType === 'far') {
        console.log('远景照');
        this.picType = 'far';

      } else {
        console.log('近景照');
        this.picType = 'close';
      }
      this.$apply();

    },

    //   点击查看大图
    clickOperatePhoto: function (e) {
      console.log(e);
      let curPhoto = e.currentTarget.dataset.src,
        curIndex = e.currentTarget.dataset.index,
        picType = e.currentTarget.dataset.picType;
      let width = wx.getSystemInfoSync().windowWidth;

      console.log('当前所有图片');
      console.log(curPhoto);
      if (picType === 'far') {
        console.log("远景照");
        console.log(curIndex);
        if (curIndex == '1') {

          this.scrollLeft = width;
          this.deleteIconInfo.deleteIndex = 1;
        } else {
          this.scrollLeft = 0;
          this.deleteIconInfo.deleteIndex = 0;
        }
        this.deleteIconInfo.picType = 'far';
        this.curPhotoList = this.repairInfo.farImgUrlList;
        console.log(this.curPhotoList)
      } else {
        console.log('近景照');
        console.log(curIndex);
        if (curIndex == '1') {
          this.scrollLeft = width;
          this.deleteIconInfo.deleteIndex = 1;

        } else {
          this.scrollLeft = 0;
          this.deleteIconInfo.deleteIndex = 0;
        }
        this.deleteIconInfo.picType = 'close';
        this.curPhotoList = this.repairInfo.closeImgUrlList;
      }
      this.wrapperFlag = true;
      this.largeImgFlag = true;
    },

    //  取消遮罩层效果
    cancelPhotoMask: function (e) {
      this.largeImgFlag = false;
    },

    // 点击删除当前图片
    deleteCurPhoto: function () {
      //   获取到当前图片的url ,当前照片的类型，id，然后删除
      this.largeImgFlag = false;
      let {picType, deleteIndex} = this.deleteIconInfo;

      // 判断是远景还是近景
      if (picType === 'far') {
        deleteIndex === 0 ? this.repairInfo.farImgUrlList.shift() : this.repairInfo.farImgUrlList.pop()

      } else {
        deleteIndex === 0 ? this.repairInfo.closeImgUrlList.shift() : this.repairInfo.closeImgUrlList.pop()
      }
      this.$apply();
    },

    //  左右滑动切换图片
    getSelectItem: function (e) {
      let width = wx.getSystemInfoSync().windowWidth;
      console.log('滑动距离');
      let curLeft = e.detail.scrollLeft;
      if (curLeft < width / 2) {
        console.log('第一张');
        this.deleteIconInfo.deleteIndex = 0;
      } else {
        console.log('第二张');
        this.deleteIconInfo.deleteIndex = 1;
      }
    },

    // 点击更新设备信息
    clickUpdateEquipInfo: function (e) {
      console.log("点击更新设备信息");

      let obj = this.inputValue;
      let reg = /^\d{11}$/g;
      if (!reg.test(obj.simNum)) {
        wx.showToast({
          title: '请输入11位sim卡号',
          icon: 'none',
        });
        return;
      }
      // 处理选择页面选中的数据
      this.handleSelectedData();

      // 点击的时候判断是更新还是编辑，如果是更新，首先获取到维修单id,如果是新增，直接操作，不需要传维修单ID
      this.updateEquipInfo();

    },

    //  获取到input框中的内容
    getInputValue(e) {
      let type = e.currentTarget.dataset.inputType;
      console.log(e);
      console.log(e.detail.value);
      switch (type) {
        case 'simNum':
          console.log('simNum');
          this.inputValue.simNum = e.detail.value;
          break;
        case 'installAddress':
          this.inputValue.installAddress = e.detail.value;
          console.log('安装地址');
          break;
        case 'faultProgram':
          console.log('故障终端程序');
          this.inputValue.faultProgram = e.detail.value;
          break;
        case 'terminalName':
          console.log('终端名称');
          this.inputValue.terminalName = e.detail.value;
          break;
      }

    },

    //  聚焦时获取到input中的内容
    getFocusValue(e) {
      let type = e.currentTarget.dataset.inputType;
      console.log(e);
      console.log(e.detail.value);
      switch (type) {
        case 'simNum':
          console.log('simNum');
          this.inputValue.simNum = e.detail.value;
          break;
        case 'installAddress':
          this.inputValue.installAddress = e.detail.value;
          console.log('安装地址');
          break;
        case 'faultProgram':
          console.log('故障终端程序');
          this.inputValue.faultProgram = e.detail.value;
          break;
        case 'terminalName':
          console.log('终端名称');
          this.inputValue.terminalName = e.detail.value;
          break;
      }

    },


  };

  onLoad(e) {
    // 初始化页面数据
    console.log('lallladasddadad');
    console.log(e);
    this.recordId = e.recordId || '';
    setTimeout(e => this.initData());
  }

  onReady() {
    console.log('ready..');
  }

  onShow() {
    console.log('show..');
    console.log(this.$parent.globalData);

    //   回显选择的globalDate中的数据
    this.echoGlobalData();
  }

  echoGlobalData() {

    //
    let data = this.$parent.globalData,
      repairInfo = this.repairInfo;

    for (let value of this.typeList) {
      repairInfo[`${value}Selected`] = data[`${value}selected`] ? data[`${value}selected`] : '';
    }
    this.$apply();
    console.log(this.$parent.globalData)

  }

  getImgUrl(ret, picType) {
    if (picType === 'far') {
      this.repairInfo.farImgUrlList = this.repairInfo.farImgUrlList || [];
      this.repairInfo.farImgUrlList.push({url: ret});
      this.repairInfo.farImgUrlList.forEach(function (item, index) {
        item.index = index;
        item.picType = 'far';
      });
      for (let i = 0; i < this.repairInfo.farImgUrlList.length; i++) {
        this.repairInfo.submitData[`imgUrl${i + 1}`] = ret;
      }
    } else {
      this.repairInfo.closeImgUrlList = this.repairInfo.closeImgUrlList || [];
      this.repairInfo.closeImgUrlList.push({url: ret});
      this.repairInfo.closeImgUrlList.forEach(function (item, index) {
        item.index = index;
        item.picType = 'close';
      });
      for (let i = 0; i < this.repairInfo.closeImgUrlList.length; i++) {
        this.repairInfo.submitData[`imgUrl${i + 3}`] = ret;
      }
    }
    this.$apply();
  }

  handleSelectedData() {
    let data = this.repairInfo;
    for (let key in data) {
      if (key.includes('Selected')) {
        switch (key) {
          case'faultTypeSelected':
            // 故障类型
            data.submitData.faultType = data[key];
            break;
          case'repairPersonSelected':
            // 维修人员
            data.submitData.serviceman = data[key];
            break;
          case'hardwareSelected':
            // 硬件类型
            data.submitData.hardwareType = data[key];
            break;
          case'faultViewSelected':
            // 故障现象
            data.submitData.faultPhenomenon = data[key];
            break;
          case'handleMeasuresSelected':
            // 处理措施
            data.submitData.treatmentMeasure = data[key];
            break;
          case'faultReasonSelected':
            // 故障原因
            data.submitData.faultCause = data[key];
            break;
          case'remarkSelected':
            // 备注
            data.submitData.remark = data[key];
            break;
        }
      }
    }
    this.$apply();
  }

  async uploadImg(paths, picType) {
    console.log('点击上传图片');
    let localSrc = typeof paths == 'object' ? paths[0] : paths;
    const uploadRes = await api.addStudentPhoto({
      filePath: localSrc,
      name: 'imgfile',
      formData: {},
    });
    const photoRes = JSON.parse(uploadRes.data);
    console.log('上传结果');
    console.log(photoRes);
    if (!photoRes.data || !photoRes.data[0]) {
      wx.showToast({
        title: '上传失败',
        icon: 'none',
      });
      return;
    }
    wx.showToast({
      title: '上传成功',
      icon: 'success',
    });
    this.getImgUrl(photoRes.data[0].imgUrl, picType);
    this.showPhoto = false;

  }

  async updateEquipInfo() {
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
      imgNum: '',
      imgUrl1: '',// 近景图1
      imgUrl2: '',// 近景图2
      imgUrl3: '',// 远景图1
      imgUrl4: '',// 远景图2
    };

    // 使用es6 对象合并的方式 判断是否是新建维修单  equipInfoData inputValue globalData

    // 1 设备信息 2 input框输入内容 3弹出框  4 日期 5 图片 6 另一个页面的内容

  console.log('查找图片信息');
    console.log(this.repairInfo.submitData);
    console.log(this.repairData);
    this.alertData.submitData.faultMainboard = this.alertData.submitData.faultMainboard || this.alertData.endBoard.array[0];
    this.alertData.submitData.terminalState = this.alertData.submitData.terminalState || this.alertData.endStatusData.endStatusIndex;
    this.repairInfo.submitData.imgNum = this.repairInfo.farImgUrlList.length + this.repairInfo.closeImgUrlList.length;

    Object.assign(equipInfoData, this.repairData, this.inputValue, this.alertData.submitData, this.date.submitData, this.repairInfo.submitData, {
      userName,
      userId
    });
    console.log(equipInfoData);

    let res = await api.updateEquipInfo({
      method: 'POST',
      data: equipInfoData
    });

    // 请求成功之后，清除之前全局变量之前保存的数据
    console.log(res);
    if (res.statusCode === 200) {
      console.log('保存成功');
      let data = this.$parent.globalData,
        repairInfo = this.repairInfo;
      console.log(this.$parent.globalData);
      this.$parent.globalData = {};
      this.repairInfo = {};
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


    }

  }

  async handleDefaultData() {
    let data = this.$parent.globalData;
    // 将之前选中的设备信息，存放至当前页面，
    this.repairData = {};


    // 判断recordId是否存在,存在的话，使用record 中的数据替代，否则使用原来的
    if (this.recordId) {
      console.log('存在');
      let recordId = this.recordId - 1;
      console.log(data.recordData);
      this.repairData = data.recordData[recordId];


    //   需要对图片和默认的数据进行处理
      for(let key in this.repairData){
        if(key.includes('imgUrl')){
         switch (key){
           case 'imgUrl1':

             !this.repairData.imgUrl1?
             this.repairInfo.closeImgUrlList.push({
               picType:'close',
               index:0,
               url:this.repairData.imgUrl1
             }):"";
             break;
           case 'imgUrl2':
             console.log('近景照啦啦啦啦');
             console.log(this.repairData.imgUrl2);
             console.log(Boolean(this.repairData.imgUrl2));
             !this.repairData.imgUrl2?
             this.repairInfo.closeImgUrlList.push({
               picType:'close',
               index:1,
               url:this.repairData.imgUrl2
             }):'';
             break;
           case 'imgUrl3':
             !this.repairData.imgUrl3?
             this.repairInfo.farImgUrlList.push({
               picType:'far',
               index:0,
               url:this.repairData.imgUrl3
             }):'';
             break;
           case 'imgUrl4':
             !this.repairData.imgUrl4?
             this.repairInfo.farImgUrlList.push({
               picType:'far',
               index:1,
               url:this.repairData.imgUrl4
             }):'';
             break;
         }
        }
      }








    } else {
      console.log('不存在，默认新增');
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


    this.$apply();
  }

  async initData(e) {
    // 如果有维修记录，先渲染维修的数据，而不是默认值
    console.log('record');
    console.log(this.recordId);
    // this.recordId?this.getRecordData():this.handleDefaultData();
    this.handleDefaultData();
  }


}