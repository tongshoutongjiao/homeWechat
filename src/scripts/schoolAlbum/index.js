import wepy from 'wepy';
import querystring from 'querystring';
import LetterIndex from '../components/letter-index/letter-index';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
export default class Index extends wepy.page {
  components = {
    'letter-index': LetterIndex
  }

  config = {
    navigationBarTitleText: '批量上传-选择学校'
  }

  data = {
    students: [],
    grades: [],
    gradeName: '',
    classes: [],
    className: '',
    classActiveIndex: 0,
    gradeActiveIndex: 0,
    studentsjson:'0',
  }
  
  methods = {
    async handleGradeChange(e){
      this.gradeActiveIndex = e.detail.value;
      const classes = await this.getClassByGradeId(this.grades[this.gradeActiveIndex].id);
      if(classes.length){
        this.methods.handleClassChange.call(this, {detail: {value: 0}});
      }
      this.setGradeAndClassName();
    },
    async handleClassChange(e){
      this.classActiveIndex = e.detail.value;
      this.getStudentsByClassId(this.classes[this.classActiveIndex].id);
      this.setGradeAndClassName();
    }
  }

  events = {
    'letter-index': (e, letter) => {
      console.log(letter)

      const query = wx.createSelectorQuery();
      wx.createSelectorQuery().selectViewport().scrollOffset(scroll => {
        wx.createSelectorQuery().select(`#letter_${letter}`).boundingClientRect(ret => {
          wx.pageScrollTo({
            scrollTop: scroll.scrollTop + ret.top
          });
        }).exec();
      }).exec();
    }
  }
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
    
    this.students =  Toolkit.groupByFirstLetter(studentsRes.data.data, 'studentNameQp');
    let studentsOrders = [];
    this.students.forEach(item => {
      studentsOrders = studentsOrders.concat(item.list);
    });
    this.studentsjson = JSON.stringify(studentsOrders);
    this.$invoke('letter-index', 'set-indexs', this.students.map(s => s.label));
    this.$apply();
  }
  setGradeAndClassName() {
    if(this.grades[this.gradeActiveIndex]){
      this.gradeName = this.grades[this.gradeActiveIndex].gradeName
    }else{
      this.gradeName = "";
    }

    if(this.classes[this.classActiveIndex]){
      this.className = this.classes[this.classActiveIndex].className;
    }else{
      this.className = "";
    }
    this.$apply();
      
  }
  async init(id) {
    const gradesRes = await this.getGradeBySchoolId(id);
    const classesRes = await this.getClassByGradeId(gradesRes[0].id);
    const studentsRes = await this.getStudentsByClassId(classesRes[0].id);
    this.setGradeAndClassName();
  }
  async onLoad(e) {
    console.log('load..', e);
    
    wx.setNavigationBarTitle({
      title: unescape(e.name)
    });
    this.init(e.id);
  }
  onReady() {
    console.log('ready..');

  }
  onShow() {
    console.log('show !');
    if(this.classes.length){
      this.getStudentsByClassId(this.classes[this.classActiveIndex].id);
    }
  }
}