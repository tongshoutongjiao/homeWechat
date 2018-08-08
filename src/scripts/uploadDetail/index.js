import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';

export default class Index extends wepy.page {

  config = {
    navigationBarTitleText: '学生管理'
  };
  data = {
    schoolData:[],
    studentCount:'',

  };

  methods = {
    navigateToStudentManage:function (e) {
      console.log('跳转到学生管理页面');

      wepy.navigateTo({
        url: `/pages/studentManage?`+Toolkit.jsonToParam(e.currentTarget.dataset)
      });
    }

  };

  onLoad(e) {
    console.log('来啦来啦来啦');
    console.log(e);

  let schoolData=this.$parent.globalData.schoolListData;
    this.studentCount=e.studentCount;


  this.schoolData=schoolData;
  this.$apply();
  }

  onShow() {
    console.log('show..');
  }

}