import wepy from 'wepy';
import api from '../../api';
import CameraCom from '../camera/camera';
export default class uploadImg extends wepy.component {
  $isComponent = true;
  data = {
    showPhoto:false
  };
  components={
    "camera-com": CameraCom,
  };
  props = {

  };
  events={
    'take-photo':ret=>{
      console.log('ret');
      console.log(ret);

       this.$invoke('camera-com', 'toggle', false);
       this.uploadImg(ret.src);

    }

  };
  methods = {
    toggle(show) {
      this.showPhoto =show;
      this.$apply();
    },
    //  点击选择拍照的类型
    chooseUploadStyle: function (e) {
      let photoType = e.currentTarget.dataset.photoType;
      switch (photoType) {
        case 'camera':
          // 调用摄像头拍摄
          console.log('camera');
          this.$invoke('camera-com', 'toggle', true);
          this.showPhoto = false;
          this.$apply();
          break;
        case 'album':
          //  调用手机相册
          console.log('album');
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success:(res)=>{
              console.log(res);
              let tempPaths = res.tempFilePaths;
              if (res.tempFilePaths.length) {
                this.uploadImg(res.tempFilePaths)
              } else {
                console.log('未选择图片');
              }

            }
          });
          break;
        case 'cancel':
          // 取消操作
          console.log('隐藏弹出框');
          this.showPhoto = false;
          break;
      }
    },

  };
  onLoad() {
    console.log(this)

  }
  async uploadImg(paths) {
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
    this.$emit('getImgUrl',{
      url:photoRes.data[0].imgUrl,
    });
    this.showPhoto = false;
    this.$apply();
  }
}