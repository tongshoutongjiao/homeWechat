import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import CameraCom from '../components/camera/camera';


const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  components = {
    "camera-com": CameraCom
  };
  events = {
    'take-photo': ret => {
      // this.$invoke('camera-com', 'toggle', false);
      // this.uploadImg(ret.src);
      console.log('ret');
      console.log(ret);
    }
  };
  config = {
    navigationBarTitleText: '刷卡明细',
  };

  data = {
    timeLength: '',
    hidden: true,
    devicePosition: 'back',
    tempImgUrl: '',
    photoList: [],
    photoLength: null,
    albumList: [],
    albumTime: '',
    cameraTime: '',
  };
  methods = {

    // 点击上传照片（只支持相册）
    clickLoadImg: function (e) {
      console.log('loadImg');
      wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          console.log('上传图片测试');
          console.log(res);
          let date = new Date() * 1;
          let tempFilePaths = res.tempFiles;

          // 保存的时候，需要看之前是否已存入过
          this.confirmData(tempFilePaths, 'album');

        }
      });
    },

    // 点击拍照
    clickTakePhoto: function (e) {
      console.log('clickTakePhoto');
      this.hidden = false;
    },

    // 清除图片缓存
    clearLocalStorage: function (e) {
      wx.showToast({
        title: '缓存清除成功',
        icon: 'none',
      });
      wx.clearStorage();
      this.albumList = [];
      this.photoList = [];
      this.photoLength = '';
      this.albumTime = 0;
      this.cameraTime = 0;


    },

    // 显示
    showPhoto(e) {
      let photoType = e.currentTarget.dataset.photoType;
      console.log('点击显示之前的拍照图片');
      let curTime = new Date() * 1;
      let photoData = wx.getStorageSync('camera');
      let albumData = wx.getStorageSync('album');
      let albumTime = wx.getStorageSync('albumTime');
      let cameraTime = wx.getStorageSync('cameraTime');

      this.albumList = [];

      switch (photoType) {
        case 'album':
          if (!!albumData) {
            this.albumList = albumData;
            this.photoLength = albumData.length;
            this.albumTime = (curTime - cameraTime) / 1000;
          } else {
            wx.showToast({
              title: '本地还没有图片',
              icon: 'none',
            });
            this.albumList = [];
          }
          break;
        case 'photo':
          if (!!photoData) {
            this.photoList = photoData;
            this.photoLength = photoData.length;
            this.cameraTime = (curTime - albumTime) / 1000;
          } else {
            this.photoList = [];
            wx.showToast({
              title: '本地还没有图片',
              icon: 'none',
            });
          }
          break;
      }

      this.$apply();
    },

    // 关闭拍照页面
    toggle(show) {
      this.hidden = !show;
      this.$apply();
    },

    // 改变手机摄像头
    handleSwitchCamera(e) {
      console.log(e);
      this.devicePosition = this.devicePosition === "back" ? "front" : "back";
      this.$apply();
    },

    // 关闭拍照功能
    handleCancel(e) {
      console.log(e);
      this.methods.toggle.call(this, false);
    },

    // 拍照
    handleTakePhoto(ret) {
      wx.createCameraContext().takePhoto({
        quality: 'low',
        success: (res) => {
          console.log('拍照拍照拍照');
          console.log(res);
          this.hidden = true;
          // 保存图片的临时路径
          this.confirmData(res.tempImagePath, 'photo');
        }
      });
    },
  };

  async onLoad(e) {
    console.log('拉阿拉拉了');
    console.log(e);
  }

  onShow() {

  }

  confirmData(tempData, type) {

    if (type === 'album') {
      let tempArray = wx.getStorageSync('album');
      if (!!tempArray) {
        console.log('tempData');

        console.log(tempData);
        tempData.forEach((item) => {
          tempArray.push(item);
        });

        wx.setStorageSync('album', tempArray);
      } else {
        console.log('创建空数组');
        let date = new Date() * 1;
        wx.setStorageSync('album', tempData);
        wx.setStorageSync('albumTime', date);
      }
    } else {
      let tempCamera = wx.getStorageSync('camera');
      if (!!tempCamera) {
        tempCamera.push({
          url: tempData
        });
        wx.setStorageSync('camera', tempCamera);
      }
      else {
        let tempCamera = [];
        let date = new Date() * 1;
        tempCamera.push({
          url: tempData
        });
        wx.setStorageSync('camera', tempCamera);
        wx.setStorageSync('cameraTime', date);
      }
      this.$apply();
    }

  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  }
}