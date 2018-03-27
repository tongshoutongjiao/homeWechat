import wepy from 'wepy';
import Toast from 'wepy-com-toast';
import CameraCom from '../components/camera/camera';

export default class TakePhoto extends wepy.page {
  config = {
    navigationBarTitleText: '拍照上传'
  }
  data = {
    studentName: 'lawrence',
    className: '二年级2班',
    boolDemoHidden: true,
    studentPhoto: '../asset/pe_icon.png',
  }
  components = {
    "camera-com": CameraCom
  }
  events = {
    'take-photo' : (ret) => {
      this.studentPhoto = ret.src;
      this.boolCameraHidden = true;
      this.$invoke('camera-com', 'handleSwitch', {target: {dataset: {hidden: false}}});
      this.$apply();
    }
  }
  motheds = {
    handlePrev(e) {
      console.log(e);
    },
    handleNext() {
      console.log(e);
    },
    handleToggleViewDemo(e) {
      this.setData({
        boolViewDemo: this.$data.boolViewDemo
      });
    }
  }
  onLoad() {
    console.log('load..');
    if(Number(wx.getStorageSync('puppylove_takephoto')) !== 1){
      this.setData({
        boolDemoHidden: false
      });
      this.boolDemoHidden = false;
      this.$apply();
    }
  }
  onReady() {
    console.log('ready..');
  }
  onShow() {
    console.log('show..');
  }
}