import wepy from 'wepy';
import Toast from 'wepy-com-toast';
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '我的业绩'
  }
  data = {
    boolViewFilter: false,
    pageActive: 0,
    tabs: [],
  }
  methods = {
    handleSwitchTabs(e) {
      console.log(e);
      this.setData('pageActive', e.target.dataset.id);
    },
    handleOpenFilter(e) {
      console.log(e);
      this.setData('boolViewFilter', !e.target.dataset.boolViewFilter);
    },
  }
  onLoad() {
    console.log('load..');
    this.setData('tabs', [
      {id: 1, name: '人员业绩'},
      {id: 2, name: '学校业绩'},
      {id: 3, name: 'APP业绩'},
      {id: 4, name: '设备业绩'}]);
  }
  onReady() {
    console.log('ready..');
  }
  onShow() {
    console.log('show !');
  }
}