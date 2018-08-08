import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';



export default class Index extends wepy.page {

  config = {
    navigationBarTitleText: '新校实施'
  };
  data = {
    confirmFlag:false,
    schoolInfo: [
      {
      schoolName:'安阳市第六初级中学',
        serviceManager:'黎萌萌',
        CustomerPerson:'夏娴娴',
        date:'2018/02/28',
        phase:'实施前1'
      }, {
        schoolName:'安阳市初级中学',
        serviceManager:'黎萌萌',
        CustomerPerson:'夏娴娴',
        date:'2018/02/28',
        phase:'实施中1'
      },
      {
        schoolName:'安阳市初级中学',
        serviceManager:'黎萌萌',
        CustomerPerson:'夏娴娴',
        date:'2018/02/28',
        phase:'实施中1'
      }
    ],

  };
  events = {};
  methods = {

    // 点击搜索框
    handleSearch: function (e) {
      console.log('返回之前的页面');
      wepy.navigateBack({
        delta: 1
      })
    },

    // 点击业务经理名字,实现打电话功能
    clickGetPhoneNumber:function (e) {
      console.log('获取业务经理的电话号码');
      let phoneNumber=e.currentTarget.dataset.phoneNumber;
      console.log(phoneNumber);
      wepy.makePhoneCall({
        phoneNumber:phoneNumber //仅为示例，并非真实的电话号码
      })
    },

    //   点击学校名字，跳转至任务进度页面
    clickNavigateToPhrase:function (e) {
      console.log('跳转到任务详情页面');
      let str = Toolkit.jsonToParam(e.currentTarget.dataset);
      wepy.navigateTo({
        url: `/pages/effectPhase?` + Toolkit.jsonToParam(e.currentTarget.dataset)
      });


    }
  };

  async onLoad(e) {
    this.schoolId = e.id;

    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onShow() {
    console.log('show !');
  }

  initData() {
    console.log('测试测试测试')
  }


}
