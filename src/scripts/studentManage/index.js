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
    gradeName:'all',
		defaultPhoto:defaultPhoto

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
				gradName = e.currentTarget.dataset.graName;
			console.log(gradName);
      this.selectSpecGrade(gradName,index);
    },

    // 点击全部下边年级列表，显示对应信息
    switchGrade: function (e) {
			let index = e.currentTarget.dataset.gradeId,
				gradName = e.currentTarget.dataset.graName;
      this.selectSpecGrade(gradName,index);
    },

    // 点击展开年级列表及学生信息
    toggleTrangle: function (e) {
      let index = e.currentTarget.dataset.index,
        classId = e.currentTarget.dataset.classId;
      console.log('this.classInfo');
      console.log(this.classInfo);
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

  async selectSpecGrade(gradName,index) {
    this.gradeName = gradName;
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
        item.gradeName=gradName;
      });
      console.log(this.classInfo)
    }
    this.selected = index;

  }

  async getStudentsByClassId(id) {
		let classInfo= this.classInfo;
    const studentsRes = await api.getStudentsByClassId({data: {classId: id}});
		classInfo.forEach(function (item,index) {
		  if(item.classId===id){
				item.studentList=studentsRes.data.data;
      }
		});
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
			 });
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
    });
    if (classes.data.result === 200) {
      classes.data.classList.forEach(function (item, index) {
        item.flag = false;
        item.index = index;
      });
      this.classInfo = classes.data.classList;
      this.classData = classes.data.classList;
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
    console.log(this.gradesList);
    list.data.result ===200 ? this.gradesList = list.data.schoolBusinessList : [];
    this.$apply();
  }

  async initData() {
    this.studentName = '请输入学生姓名';
    this.classInfo = [];

    // 获取所有年级信息
    this.getBussinessList();

    // 年级信息
    this.getGradeBySchoolId();

    // 班级信息
    this.getClassBySchoolId();

  }

  async onLoad(e) {
    this.schoolId = e.id;
    this.schoolName = e.name;
	wepy.setStorageSync('schoolId',this.schoolId);


  }

  onReady() {
    console.log('ready..');
  }

  onShow(e) {
    console.log('show !');
		setTimeout(e => this.initData());
  }
}