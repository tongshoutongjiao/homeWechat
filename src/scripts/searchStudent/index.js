import wepy from 'wepy';
import api from '../api';
import ECharts from '../components/ec-canvas/ec-canvas';
import FilterSlider from '../components/slider-filter/slider-filter';
import * as Toolkit from '../utils/toolkit';


export default class Index extends wepy.page {
  components = {
    echarts: ECharts,
    'filter-slider': FilterSlider,
  };
  config = {
    navigationBarTitleText: '搜索学生'
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
    studentsList: [],
    empty: '',


  };
  events = {};
  methods = {

    // 搜索
    searchValueInput(e) {
      var value = e.detail.value;
      if (value !== '') {
        this.search(value)
      }
    },

    //  点击跳转到编辑学生信息页面
    navigatorToEditStudentInfo: function (e) {
      wx.navigateTo({
        url: "/pages/editStuInfo?" + Toolkit.jsonToParam(e.currentTarget.dataset)
      })
    }

  };

  async search(e) {

    let result = await api.searchStudentsInfoBySchoolId({
      method: 'POST',
      data: {
        schoolId: this.schoolId,
        studentName: e,
      }
    });
    console.log('返回结果');
    console.log(result);
    if (result.data.result === 200) {
      console.log('返回结果');
      console.log(result.data.classList);
      if (result.data.classList.length > 0) {
        this.empty = false;
        this.studentsList = result.data.classList;
      } else {
        this.empty = true
      }
      this.$apply()
    }
  }


  async initData() {

  }

  async onLoad(e) {
    console.log('页面参数');
    console.log(e);
    this.schoolId = e.schoolId;
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
