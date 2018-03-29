import wepy from 'wepy';
import Toast from 'wepy-com-toast';
import CameraCom from '../components/camera/camera';
import api from '../api'

export default class TakePhoto extends wepy.page {
  config = {
    navigationBarTitleText: '拍照上传'
  }
  data = {
    studentId: '',
    studentName: '',
    className: '',
    classId: '',
    boolDemoHidden: true,
    studentPhoto: '../asset/pe_icon.png',
    students: [],
    activeIndex: 0,
    prevIndex: 0,
    nextIndex: 0,
  }
  components = {
    "camera-com": CameraCom
  }
  events = {
    'take-photo' : async (ret) => {
      this.$invoke('camera-com', 'handleSwitch', {target: {dataset: {hidden: false}}});
      const studentId = this.studentId;
      const uploadRes = await api.uploadStudentPhoto({
        filePath: ret.src,
        name: 'imgfile',
        formData: {
          studentId,
          // imageUrl: this.studentPhoto,
        },
      });
      const photoRes = JSON.parse(uploadRes.data);
      this.studentPhoto = photoRes.data[0].imgUrl;
      this.$apply();
    }
  }
  methods = {
    handlePrev(e) {
      console.log(e);
      this.switchStudent(e.target.dataset.index);
    },
    handleNext(e) {
      console.log(e);
      this.switchStudent(e.target.dataset.index);
    },
    handleToggleViewDemo(e) {
      this.boolDemoHidden = !this.boolDemoHidden;
      this.$apply();
    }
  }
  switchStudent(index){
    index = Number(index);
    if(index < 0 || index > this.students.length - 1){
      return wepy.showModal({
        title: '提示',
        content: '没有学生数据了',
        showCancel: false
      });
    }
    
    const currStudent = this.students[index];
    this.activeIndex = index;
    this.prevIndex = index - 1;
    this.nextIndex = index + 1;
    this.studentId = currStudent.studentId;
    this.studentName = currStudent.studentName;
    this.studentPhoto = currStudent.studentImg;
    this.$apply();
  }
  onLoad(e) {
    console.log('load..', e);
    this.className = e.className;
    this.classId = e.classId;
    this.students = JSON.parse(e.students);
    console.log(this.students)
    debugger
    this.switchStudent(Number(e.index));
    if(Number(wx.getStorageSync('puppylove_takephoto')) !== 1){
      wx.setStorageSync('puppylove_takephoto', 1);
      this.boolDemoHidden = false;
    }
    this.$apply();
    
  }
  onReady() {
    console.log('ready..');
  }
  onShow() {
    console.log('show..');
  }
}