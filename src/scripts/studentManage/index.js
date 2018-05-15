import wepy from 'wepy';
import api from '../api';
import ECharts from '../components/ec-canvas/ec-canvas';
import FilterSlider from '../components/slider-filter/slider-filter';
import * as Toolkit from '../utils/toolkit';

const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  components = {
    echarts: ECharts,
    'filter-slider': FilterSlider,
  };
  config = {
    navigationBarTitleText: '学生管理'
  };
  data = {
    studentName: '请输入学生姓名搜索', // 学生名称
    selected: '0',// 默认选中的年级样式,
    gradesInfo: [],
    trangleDown: true,
    classInfo: [],// 班级列表信息
    schoolId: '',
    schoolName: '',
    studentList: [],
    gradeFlag: true,
    gradesList: [],
    gradeName: 'all',
    scrollLeft: 0,
    defaultPhoto: defaultPhoto,
    gradeId: '',
    slideIndex: null,
    storageFlag: false

  };
  events = {};
  methods = {
    // tab栏切换
    handleSearch(e) {
      let str = Toolkit.jsonToParam(e.currentTarget.dataset);
      wepy.navigateTo({
        url: `/pages/searchStudent?` + Toolkit.jsonToParam(e.currentTarget.dataset)
      });
    },

    // 横向选择年级
    selectGrade: function (e) {
      let index = e.currentTarget.dataset.gradeId,
        slideIndex = e.currentTarget.dataset.slideIndex,
        gradName = e.currentTarget.dataset.graName;
      this.selectSpecGrade(gradName, index, slideIndex);
    },

    // 点击全部下边年级列表，显示对应信息
    switchGrade: function (e) {
      let index = e.currentTarget.dataset.gradeId,
        slideIndex = e.currentTarget.dataset.slideIndex,
        gradName = e.currentTarget.dataset.graName;
      this.selectSpecGrade(gradName, index, slideIndex);
    },

    // 点击展开年级列表及学生信息
    toggleTrangle: function (e) {
      let index = e.currentTarget.dataset.index,
        classId = e.currentTarget.dataset.classId;
      this.classInfo[index].flag = !this.classInfo[index].flag;
      this.trangleDown = !this.trangleDown;
      this.getStudentsByClassId(classId);
    },

    // 跳转到新增学生页面
    navigateToaddStudent: function (e) {
      console.log('新增学生页面');
      wepy.setStorageSync('editFlag',false);
      wepy.navigateTo({
        url: "/pages/addStudent?" + Toolkit.jsonToParam(e.currentTarget.dataset)
      })
    },

    // 跳转到修改编辑学生界面
    navigateToEditStuInfo: function (e) {
      console.log('编辑学生页面');
      wepy.setStorageSync('editFlag',false);
      wx.navigateTo({
        url: "/pages/editStuInfo?" + Toolkit.jsonToParam(e.currentTarget.dataset)
      })
    }
  };

  async selectSpecGrade(gradName, index, slideIndex) {

    gradName = gradName  || '全部';
    index = index ||  0;
      slideIndex = slideIndex || null;
    this.gradeId=index;
    this.slideIndex=slideIndex;
    let n = slideIndex / 3;
    n ? this.scrollLeft = n * 200 : this.scrollLeft = 0;

    if (gradName === '全部') {
      this.gradeFlag = true;
      this.selected = index;
      return;
    } else {
      this.gradeFlag = false;
      let gradeData = this.gradesList;
      this.classInfo = [];
      gradeData.forEach((item) => {
        if (item.gradeName === gradName) {
          this.classInfo = item.list
        }
      });
      this.classInfo.forEach((item, index) => {
        item.flag = false;
        item.index = index;
        item.gradeName = gradName;
        item.allNum=item.openNum*1+item.unOpenNum*1;
      });
    }
    this.selected = index;
  }

  async getStudentsByClassId(id) {
    let classInfo = this.classInfo;
    const studentsRes = await api.getStudentsByClassId({data: {classId: id}});
    // 结果按照姓氏排序
    if (studentsRes.statusCode === 200) {
      let data = studentsRes.data.data.sort(function (a, b) {
        let s = a.studentNameQp;
        let e = b.studentNameQp;
        if (s > e) {
          return 1
        } else if (s < e) {
          return -1;
        } else {
          return 0;
        }
      });
      classInfo.forEach(function (item, index) {
        if (item.classId === id) {
          item.studentList = studentsRes.data.data;
        }
      });

    } else {
      wx.showToast({
        title: '学生信息请求失败',
        icon: 'none',
        duration: 1000
      });

    }
    this.$apply();

  }


  async getClassBySchoolId() {
    let classes = await api.queryClass({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    if (classes.data.result === 200) {
      classes.data.classList.forEach(function (item, index) {
        item.flag = false;
        item.index = index;
      });
      this.classInfo = classes.data.classList;
      this.$apply();
    }
  }

  //
  async getBussinessList() {
    let list = await api.schoolBusinessList({
      showLoading: true,
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    if (list.data.result === 200) {
      list.data.schoolBusinessList.forEach(function (item, index) {
        item.index = index;
        item.allNum=item.gradeOpen*1+item.gradeUnOpen*1
      });

      let tempData = list.data.schoolBusinessList.concat();
      this.gradesList = list.data.schoolBusinessList;
      this.handleGradesInfoData(tempData);
      this.$apply();
    }
  }


  // 处理横向显示的年级信息
  async handleGradesInfoData(data) {
    data.unshift({
      gradeName: '全部',
      gradeId: '0'
    });
    this.gradesInfo = data;
    this.$apply();

  }

  async initData() {
    this.studentName = '请输入学生姓名';
    this.classInfo = [];

    // 获取所有年级信息
    this.getBussinessList();

    // 班级信息
    // this.getClassBySchoolId();

    // 初始化信息
    this.selectSpecGrade();
  }

  async onLoad(e) {
    this.schoolId = e.id;
    this.schoolName = e.name;
    const app = getApp();

    //  设置标题
    let showFlag= wepy.setStorageSync('editFlag',false);
    wx.setNavigationBarTitle({
      title: decodeURI(this.schoolName)
    });
    setTimeout(e => this.initData());
  }

  onReady() {
    console.log('ready..');
  }

  onShow(e) {
    console.log('show !');
   let showFlag= wepy.getStorageSync('editFlag');
   console.log(showFlag);
   if(showFlag){
     // 可以增加默认值功能
     this.selectSpecGrade();
     wx.showToast({
       title: '加载中',
       icon: 'loading',
       duration: 1000
     });
   }
  }
}