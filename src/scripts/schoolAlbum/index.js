import wepy from 'wepy';
import querystring from 'querystring';
import LetterIndex from '../components/letter-index/letter-index';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';

const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  components = {
    'letter-index': LetterIndex
  }

  config = {
    navigationBarTitleText: '批量上传-选择学校'
  }

  data = {
    defaultPhoto,
    students: [],
    grades: [],
    gradeName: '',
    classes: [],
    className: '',
    classActiveIndex: 0,
    gradeActiveIndex: 0,
    studentsjson: '',
    scrollTop: 0,
    localPhotoNumber: '',
    confirmFlag: false
  }

  methods = {
    async handleGradeChange(e) {
      this.gradeActiveIndex = e.detail.value;
      const classes = await this.getClassByGradeId(this.grades[this.gradeActiveIndex].id);
      if (classes.length) {
        this.methods.handleClassChange.call(this, {detail: {value: 0}});
      }
      this.setGradeAndClassName();
    },
    async handleClassChange(e) {
      this.classActiveIndex = e.detail.value;
      this.getStudentsByClassId(this.classes[this.classActiveIndex].id);
      this.setGradeAndClassName();
    },
    handleNavigateTo(e) {
      let uploadFlag = e.currentTarget.dataset.uploadFlag,
        studentId = e.currentTarget.dataset.id,
        tempUrl = e.currentTarget.dataset.tempUrl,
        photoInfo = wx.getStorageSync('photoInfo');
      if (uploadFlag === 'upload') {
        //  删除本地存储的数据，然后重新请求接口就行了
        this.singleStudentPhoto(studentId, tempUrl, this, this.deleteLocalInfo);
      } else {
        if (Number(photoInfo.length) >= 500) {
          this.confirmFlag = true;
          return;
        }
        try {
          wx.setStorageSync('puppylove_students', this.studentsjson);
          wx.navigateTo({
            url: `/pages/takePhoto?${querystring.stringify(e.currentTarget.dataset)}`
          });
        } catch (e) {
          throw e;
        }

      }
      this.$apply()

    },

    // 点击上传图片
    clickUploadImg: function () {

      let photoInfo = wx.getStorageSync('photoInfo');
      if (Number(photoInfo.length) !== 0) {
        commonMethods.batchUploadPhoto(photoInfo, this, this.batchPhotoCallback)
      } else {
        wx.showToast({
          title: '本地还没有照片，请先拍照',
          icon: 'none',
          duration: 1000
        });
        return;
      }
    },

    //   点击弹窗的取消和全部上传按钮
    clickOperatePhoto: function (e) {
      this.confirmFlag = false;
    }
  };

  events = {
    'letter-index': (e, letter) => {
      if (letter === '#') {
        letter = '';
      }

      const query = wx.createSelectorQuery();
      query.select('.scroll-view').scrollOffset();
      query.select('.scroll-view').boundingClientRect();
      query.select(`#letter_${letter}`).boundingClientRect();
      query.exec(([scroll, rect, dom]) => {
        this.scrollTop = scroll.scrollTop - rect.top + dom.top;
        this.$apply();
      });
    }
  };

  async getGradeBySchoolId(id) {
    const gradesRes = await api.getGradeBySchoolId({data: {schoolId: id}});

    this.grades = gradesRes.data.data;
    this.$apply();
    return this.grades;
  }

  async getClassByGradeId(id) {
    const classesRes = await api.getClassByGradeId({data: {gradeId: id}});
    this.classes = classesRes.data.data;

    this.$apply();
    return this.classes;
  }

  async getStudentsByClassId(id) {
    const studentsRes = await api.getStudentsByClassId({data: {classId: id}});
    this.students = Toolkit.groupByFirstLetter(studentsRes.data.data, 'studentNameQp');
    let studentsOrders = [];
    this.students.forEach(item => {
      studentsOrders = studentsOrders.concat(item.list);
    });
    // 根据班级id筛选本地已经拍过照的学生图片数据
    this.filterLocalPhoto(studentsOrders);
    this.studentsjson = JSON.stringify(studentsOrders);
    this.$invoke('letter-index', 'set-indexs', this.students.map(s => s.label));

    // 本地存储的照片数量
    let photoInfo = wx.getStorageSync('photoInfo');
    this.localPhotoNumber = photoInfo.length;
    this.$apply();
  }

  //
  filterLocalPhoto(data) {
    let photoInfo = wx.getStorageSync('photoInfo');
    // 获取到所有已经存储在本地的照片数据,
    // 1 遍历所有请求到的学生数据，根据这些学生的id，来判断是否给当前对象增加字段，
    if (!!photoInfo) {
      data.forEach(item => {
        photoInfo.forEach(cur => {
          if (cur.studentId === item.studentId) {
            item.hasLocalPhoto = true;
            item.studentImg = cur.imgUrl;
          }
        })
      });
    }
    this.$apply();
  }

  setGradeAndClassName() {
    if (this.grades[this.gradeActiveIndex]) {
      this.gradeName = this.grades[this.gradeActiveIndex].gradeName
    } else {
      this.gradeName = "";
    }

    if (this.classes[this.classActiveIndex]) {
      this.className = this.classes[this.classActiveIndex].className;
    } else {
      this.className = "";
    }
    this.$apply();

  }


  // 删除本地存储的图片,重新请求接口
  deleteLocalInfo(id, self) {
    let photoInfo = wx.getStorageSync('photoInfo');
    photoInfo.forEach((cur, index) => {
      if (cur.studentId === id) {
        photoInfo.splice(index, 1);
      }
    });
    wx.setStorageSync('photoInfo', photoInfo);
    self.getStudentsByClassId(self.classes[self.classActiveIndex].id);
  }

  // 批处理照片函数
  batchPhotoCallback(array, self) {
    console.log('处理批上传之后的图片');
    wx.setStorageSync('photoInfo', array);
    self.getStudentsByClassId(self.classes[self.classActiveIndex].id);
    self.$apply()
  }

  async init(id) {
    const gradesRes = await this.getGradeBySchoolId(id);
    const classesRes = await this.getClassByGradeId(gradesRes[0].id);
    const studentsRes = await this.getStudentsByClassId(classesRes[0].id);
    // 本地存储的照片数量
    let photoInfo = wx.getStorageSync('photoInfo');
    this.localPhotoNumber = photoInfo.length;
    this.setGradeAndClassName();
    this.$apply()
  }

  async onLoad(e) {
    console.log('load..', e);
    wx.setNavigationBarTitle({
      title: decodeURI(e.name)
    });
    this.init(e.id);
  }

  onReady() {
    console.log('ready..');

  }

  onShow() {
    console.log('show !');
    if (this.classes.length) {
      this.getStudentsByClassId(this.classes[this.classActiveIndex].id);
    }
  }

  //  点击上传学生照片
  async singleStudentPhoto(id, url, self, callback) {
    wx.showLoading({
      title: '上传中',
      icon: 'loading',
      mask: true
    });
    const uploadRes = await api.uploadStudentPhoto({
      filePath: url,
      name: 'imgfile',
      formData: {
        studentId: id
      },
    });
    const photoRes = JSON.parse(uploadRes.data);
    if (!photoRes.data || !photoRes.data[0]) {
      wx.showToast({
        title: '上传失败',
        icon: 'none',
      });
      return;
    }
    setTimeout(function () {
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 1000
      });
    }, 1000);
    // 回调函数，修改当前上传照片的状态：改为已上传，同时，删除之前存储的照片，重新请求接口
    callback(id, self);
  }
}