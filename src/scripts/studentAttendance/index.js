import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';


const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '考勤记录'
  };
  data = {
    selectFlag: false,
    curAttendName: '出入校考勤',
    attendStyle: [
      {
        attendName: '出入校考勤',
        index: '0'
      },
      {
        attendName: '宿舍考勤',
        index: '1'
      }
    ],
    selectIndex: '0',
    date:"2018-06-09"
  };
  events = {};
  methods = {
    clickSelectOption: function (e) {
      console.log(e);
      let clickType = e.currentTarget.dataset.clickType;
      console.log(clickType);
      switch (clickType) {
        case 'attend':
          this.selectFlag = !this.selectFlag;
          break;
        case'data':
          break;
        case 'range':
          break;
      }
      this.$apply();
    },
    selectAttendStyle: function (e) {
      let attendIndex = e.currentTarget.dataset.attendIndex;
      console.log(attendIndex);
      this.curAttendName = this.attendStyle[attendIndex].attendName;
      this.selectIndex = attendIndex;
      this.selectFlag = false;
      this.$apply();

    },
    bindDateChange:function (e) {
      let date=new Date();
      console.log(date);
      console.log(e.detail.value);
 this.date=e.detail.value.substring(5)
    }


  };

  async onLoad(e) {
    console.log('页面参数');
    console.log(e);

  }

  onReady() {
    console.log('ready..');
  }

  onShow() {
    console.log('show !');
  }
}
