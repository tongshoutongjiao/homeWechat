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
    defaultPhoto: defaultPhoto,
    cardFlag: false,
    cardNum: null,

  };
  events = {};
  methods = {

    // 搜索
    searchValueInput(e) {
      var value = e.detail.value;
      if (value !== '') {
        this.search(value);
      }
      this.$apply();
    },

    // 学生卡号或者手机号搜索
    searchValueCard(e) {
      console.log('学生卡号或者手机号');
      //   如果输入的是十位，则为卡号，否则为手机号
      this.cardNum = e.detail.value;
    },

    //  点击跳转到编辑学生信息页面
    navigatorToEditStudentInfo: function (e) {
      wx.navigateTo({
        url: "/pages/editStuInfo?" + Toolkit.jsonToParam(e.currentTarget.dataset)
      })
    },

    //   点击展开改班级下的学生列表
    toggleStudentList: function (e) {
      let index = e.currentTarget.dataset.index;
      this.studentsList[index].extendFlag = !this.studentsList[index].extendFlag;
    },

    // 点击执行搜索学生功能
    searchStudent: function () {
      this.searchCardOrPhone()
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
    if (result.data.result === 200) {
      if (result.data.classList.length > 0) {
        this.empty = false;
        result.data.classList.forEach(function (item, index) {
          item.index = index;
          index === 0 ? item.extendFlag = true : item.extendFlag = false;
        });

        this.studentsList = result.data.classList;
      } else {
        this.empty = true
      }
      this.$apply()
    }
  }


  async onLoad(e) {
    console.log('页面参数');
    this.schoolId = e.schoolId;
    this.schoolName = e.name;
    this.cardFlag = e.schoolId ? true : false;
    // 初始化页面数据
    setTimeout(e => this.initData());
    this.$apply();
  }

  onReady() {
    console.log('ready..');
  }

  onShow() {
    console.log('show !');
    console.log('执行搜索功能');


    let flag = true;
    if (getCurrentPages().length) {
      getCurrentPages().length === 2 ? this.searchCardOrPhone(flag) : '';
    }
  }

//
  async searchCardOrPhone(flag) {
    let cardNum = this.cardNum,
      reg = /^\d{11}|\d{10}$/g, resData;

    if (reg.test(cardNum)) {
      resData = await api.searchStudentByCardOrPhone({
        method: 'POST',
        data: {
          cardNum: cardNum
        }
      })
    } else {
      if (flag === undefined) {
        wepy.showToast({
          title: '请输入正确的卡号或者手机号',
          icon: 'none',
        });
      }
    }
    if (resData.data.result === 200) {
      if (resData.data.classList.length > 0) {
        this.empty = false;
        resData.data.classList.forEach(function (item, index) {
          item.index = index;
          index === 0 ? item.extendFlag = true : item.extendFlag = false;
        });
        this.studentsList = resData.data.classList;
        this.studentsList.forEach(function (item) {
          item.classInf = item.studentList[0].classInf;
        })
      } else {
        this.empty = true
      }
      this.$apply()
    }
  }

}
