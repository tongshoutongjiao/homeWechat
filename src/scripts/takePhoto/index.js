import wepy from 'wepy';
import Toast from 'wepy-com-toast';
import CameraCom from '../components/camera/camera';
import api from '../api'

const defaultPhoto = '../asset/pe_icon.png';

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
    studentPhoto: defaultPhoto,
    students: [],
    activeIndex: 0,
    prevIndex: -1,
    nextIndex: 1,
  }
  components = {
    "camera-com": CameraCom
  }
  events = {
    'take-photo' : async (ret) => {
      this.$invoke('camera-com', 'toggle', false);
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
      if(!photoRes.data || !photoRes.data[0]){
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
      this.studentPhoto = photoRes.data[0].imgUrl;
      this.students[this.activeIndex].studentImg = this.studentPhoto;
      this.$apply();
    }
  }
  methods = {
    handlePrev(e) {
      console.log(e);
      this.switchStudent(e.currentTarget.dataset.index);
    },
    handleNext(e) {
      console.log(e);
      this.switchStudent(e.currentTarget.dataset.index);
    },
    handleToggleViewDemo(e) {
      this.boolDemoHidden = !this.boolDemoHidden;
      this.$apply();
    },
    handleCameraToggle(e) {
      this.$invoke('camera-com', 'toggle', true);
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
    this.studentPhoto = currStudent.studentImg || defaultPhoto;
    this.$apply();
  }
  onLoad(e) {
    console.log('load..', e);
    this.className = decodeURI(e.className);
    this.classId = e.classId;
    this.students = JSON.parse(wx.getStorageSync('puppylove_students'));
    let student;
    while(student = this.students[this.activeIndex]){
      if(String(student.studentId) === String(e.id)){
        break;
      }
      this.activeIndex ++;
    }
    if(Number(wx.getStorageSync('puppylove_takephoto')) !== 1){
      wx.setStorageSync('puppylove_takephoto', 1);
      this.boolDemoHidden = false;
    }
    setTimeout(e => this.switchStudent(Number(this.activeIndex)),500);
    
    this.$apply();
    
  }
  onReady() {
    console.log('ready..');
  }
  onShow() {
    console.log('show..');
  }
}