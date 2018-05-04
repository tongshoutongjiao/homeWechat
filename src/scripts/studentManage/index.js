import wepy from 'wepy';
import api from '../api';
import ECharts from '../components/ec-canvas/ec-canvas';
import FilterSlider from '../components/slider-filter/slider-filter';
import * as Toolkit from '../utils/toolkit';


export default class Index extends wepy.page {
  components = {
    echarts: ECharts,
    'filter-slider': FilterSlider,
  }
  config = {
    navigationBarTitleText: '学生管理'
  };
  data = {
    studentName: '请输入学生姓名搜索', // 学生名称
    selected: '0',// 默认选中的年级样式,
    gradesInfo: [],
    trangleDown: true,
    classData: [],
    classInfo: [],// 班级列表信息
    schoolId: '',
    schoolName: '',
    studentList: [],
    gradeFlag: true,
    gradesList: [],
    gradeName:'all'

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

    // 选择年级
    selectGrade: function (e) {
      this.selectSpecGrade(e)
    },

    // 点击全部下边年级列表，显示对应信息
    switchGrade: function (e) {
      this.selectSpecGrade(e)
    },

    // 点击展开年级列表及学生信息
    toggleTrangle: function (e) {
      let index = e.currentTarget.dataset.index,
        classId = e.currentTarget.dataset.classId;
      console.log('this.classInfo');
      console.log(this.classInfo)
      this.classInfo[index].flag = !this.classInfo[index].flag;
      this.trangleDown = !this.trangleDown;
      this.getStudentsByClassId(classId);
    },

    // 跳转到新增学生页面
    navigateToaddStudent: function (e) {
      wepy.navigateTo({
        url: "/pages/addStudent?" + Toolkit.jsonToParam(e.currentTarget.dataset)
      })
    },

    // 跳转到修改编辑学生界面
    navigateToEditStuInfo: function (e) {
      wx.navigateTo({
        url: "/pages/editStuInfo?" + Toolkit.jsonToParam(e.currentTarget.dataset)
      })
    }
  };

  async selectSpecGrade(parm) {
    let index = parm.currentTarget.dataset.gradeId,
      gradName = parm.currentTarget.dataset.graName,
      self = this;
    this.gradeName=gradName;
    if (gradName === 'all') {
      this.gradeFlag = true;
      this.selected = index;
      return;
    } else {
      this.gradeFlag = false;
      let gradeData = this.gradesList;
      gradeData.forEach(function (item) {
        if (item.gradeName === gradName) {
          self.classInfo = item.list
        }
      });
      this.classInfo.forEach(function (item, index) {
        item.flag = false;
        item.index = index;
        item.gradeName=gradName;
      });
      console.log(this.classInfo)
    }
    this.selected = index;

  }

  async getStudentsByClassId(id) {
    const studentsRes = await api.getStudentsByClassId({data: {classId: id}});

    this.studentList = studentsRes.data.data;
    this.$apply();
  }

  async getGradeBySchoolId() {
    // 年级信息
    let garde = await api.queryGrade({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    if (garde.data.result === 200) {
      this.gradesInfo.push({
        gradeName: '全部',
        schoolId: this.schoolId,
        graName: 'all',
        id: 0
      })
      for (var b = 0; b < garde.data.gradeList.length; b++) {
        this.gradesInfo.push(garde.data.gradeList[b])
      }
      this.$apply();
    }
  }

  async getClassBySchoolId() {
    let classes = await api.queryClass({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    })
    if (classes.data.result === 200) {
      classes.data.classList.forEach(function (item, index) {
        item.flag = false;
        item.index = index;
      })
      this.classInfo = classes.data.classList;
      this.classData = classes.data.classList;
      this.$apply();
    }
  }

  async getBussinessList() {
    let list = await api.schoolBusinessList({
      showLoading: true,
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    list.data.result == '200' ? this.gradesList = list.data.schoolBusinessList : [];
    this.gradesList.reverse();
    this.$apply();
  }

  async initData() {
    this.studentName = '请输入学生姓名';
    this.classInfo = [
      {
        gradeName: '1.01班',
        percentage: '20/50',
        gradeId: '1',
        index: '0',
        id: '',
        studentList: [
          {
            studentName: '何小炅',
            isResidence: false,
            status: true,
            tel: '15329507348',
            id: '1',
            headImg: 'https://www.baidu.com/img/bd_logo1.png'
          }
        ]
      },
      {
        gradeName: '1.01班',
        percentage: '10/50',
        gradeId: '1',
        index: '1',
        studentList: [
          {
            studentName: '何小炅',
            isResidence: 'false',
            status: 'true',
            tel: '15329507348',
            id: '1',
            headImg: 'https://cdn2.jianshu.io/assets/default_avatar/avatar_default-78d4d1f68984cd6d4379508dd94b4210.png'
          }
        ]
      },
    ];

    // 列表信息
    this.getBussinessList();

    // 年级信息
    this.getGradeBySchoolId();

    // 班级信息
    this.getClassBySchoolId();

  }

  async onLoad(e) {
    this.schoolId = e.id;
    this.schoolName = e.name;

    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onReady() {
    console.log('ready..');
  }

  onShow() {
    console.log('show !');
  }
}