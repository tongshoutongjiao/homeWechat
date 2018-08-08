import wepy from 'wepy';
import Toast from 'wepy-com-toast';
import CameraCom from '../components/camera/camera';
import api from '../api'

const defaultPhoto = '../asset/pe_icon.png';

export default class TakePhoto extends wepy.page {
  config = {
    navigationBarTitleText: '拍照上传'
  };
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
    confirmFlag:false
  }
  components = {
    "camera-com": CameraCom
  }
  events = {
    'take-photo': async (ret) => {
      this.$invoke('camera-com', 'toggle', false);
      const studentId = this.studentId;
      // 修改上传图片功能 改为保存图片到本地功能，此时是不需要调接口的
      this.saveLocalPhoto(studentId, ret.src);
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
      let photoInfo = wx.getStorageSync('photoInfo');
      //
      console.log(photoInfo);
      if(photoInfo&&Number(photoInfo.length)>=500){
        this.confirmFlag=true;
        return;
      }
      this.$invoke('camera-com', 'toggle', true);
      this.$apply();
    },
    clickOperatePhoto(e){
      let type=e.currentTarget.dataset.type;
      this.confirmFlag = false;
      if(type==='sure'){
        wx.navigateBack({
          delta: 1
        })
      }
    }

  }

  switchStudent(index) {
    index = Number(index);
    if (index < 0 || index > this.students.length - 1) {
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

  saveLocalPhoto(id, url) {
    let tempObj = {},
      curIndex = this.activeIndex;
    //   json格式: 1 当前学生的id 2 当前照片的临时路径
    //   先取出来本地存储的学生信息数据，然后查看是否为空，如果为空
    let localPhotoData = wx.getStorageSync('photoInfo') ? wx.getStorageSync('photoInfo') : [];
    tempObj.studentId = id;
    tempObj.imgUrl = url;
    if (localPhotoData.length) {
      let saveFlag = true;
      localPhotoData.forEach(item => {
        if (item.studentId === id) {
          item.imgUrl = url;
          saveFlag = false;
        }
      });
      saveFlag === true ? localPhotoData.push(tempObj) : '';
    } else {
      localPhotoData.push(tempObj);
    }

    wx.setStorageSync('photoInfo', localPhotoData);


    // 将拍照的图片显示在对应的照片框内,改变切换学生
    this.studentPhoto = url;

    console.log('所有学生的信息');
    console.log(this.students[curIndex]);
    this.students[curIndex].studentImg = url;

    console.log('本地信息');
    console.log(localPhotoData);
    this.$apply();
  }

  onLoad(e) {
    console.log('load..', e);
    this.className = decodeURI(e.className);
    this.classId = e.classId;
    this.students = JSON.parse(wx.getStorageSync('puppylove_students'));
    let student;
    while (student = this.students[this.activeIndex]) {
      console.log('当前学生');
      console.log(student);
      if (String(student.studentId) === String(e.id)) {
        break;
      }
      this.activeIndex++;
    }
    if (Number(wx.getStorageSync('puppylove_takephoto')) !== 1) {
      wx.setStorageSync('puppylove_takephoto', 1);
      this.boolDemoHidden = false;
    }
    setTimeout(e => this.switchStudent(Number(this.activeIndex)), 500);

    this.$apply();

  }

  onReady() {
    console.log('ready..');
  }

  onShow() {
    console.log('show..');
  }
}