import wepy from 'wepy';
 import uploadImg from '../components/uploadImg/uploadImg';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {
    "upload-img":uploadImg
  };
  config = {
    navigationBarTitleText: '安装'
  };
  events = {
    'take-photo': ret => {
      console.log('ret');
      console.log('planterDetail');
      console.log(ret);
      this.$invoke('camera-com', 'toggle', false);
      this.uploadImg(ret.src);

    },
  };

  data = {
    showPhoto: false,
    endStatus: '0',
    picType: '',
    date: {},// 日期

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
        array: ['加装', '新装', '移机'],
        plantTypeIndex: 0

      }
    },
    repairInfo: {},// 本页面维修数据
  };

  methods = {

    // 安装日期
    bindStartDateChange: function (e) {
      console.log(e);
      this.date.startDate = e.detail.value;
    },

    // 改变终端使用状态
    bindEndStatusChange: function (e) {
      console.log(e.detail.value);
      this.$broadcast('getBroadcast','12545665');
      this.alertData.endStatusData.endStatusIndex = e.detail.value;
    },

    // 故障终端主板
    bindEndType: function (e) {
      this.alertData.endType.endTypeIndex = e.detail.value;
    },

    // 点击选择终端类型
    bindPlantType: function (e) {
      this.alertData.plantType.plantTypeIndex = e.detail.value;
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
      console.log('执行上传图片功能');
      let picType = e.currentTarget.dataset.picType;
      this.$invoke('upload-img', 'toggle', true);
      if (picType === 'far') {
        console.log('远景照');
        this.picType = 'far';

      } else {
        console.log('近景照');
        this.picType = 'close';
      }
      this.$apply();

    },

    //  点击选择初始启用状态
    clickSelectStatus: function (e) {
      let endStatus = e.currentTarget.dataset.endStatus;
      console.log(e);
      console.log(endStatus);
      this.endStatus = endStatus;
    }

  };


  onLoad(params, data) {

    // 初始化页面数据
    setTimeout(e => this.initData());

  }

  onReady() {
    console.log('ready..');

  }

  onPrefetch() {
    return this.testFn();
  }

  onShow() {
    console.log('show..');

    //   回显选择的globalDate中的数据
    this.echoGlobalData();
  }

  echoGlobalData() {
    let data = this.$parent.globalData,
      repairInfo = this.repairInfo;

    for (let value of this.typeList) {
      repairInfo[`${value}Selected`] = data[`${value}selected`] ? data[`${value}selected`] : '';
    }
  }

  uploadImg(path) {
    console.log(path);
  }

  async initData(e) {


  }

}