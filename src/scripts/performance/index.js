import wepy from 'wepy';
// import Toast from 'wepy-com-toast';
import ECharts from '../components/ec-canvas/ec-canvas';

export default class Index extends wepy.page {
  components = {
    echarts: ECharts
  }

  config = {
    navigationBarTitleText: '我的业绩'
  }
  data = {
    username: '',
    boolViewFilter: false,
    pageActive: 1,
    timeoutActive: 1,
    tabs: [],
    timeouts: [],
    charts: new Array(Math.random() * 10 | 1).fill({}).map((item, index) => ({...item, canvasId: `canvas_${index}`, index: String(index), title: '阿娇的弗拉阿呆沙发绿卡就哦了阿斯顿飞离开阿斯顿飞了'.substr(Math.random() * 10 | 1, 3)})),
    boolCanvasShow: true,
    boolImageShow: false,
  }
  methods = {
    handleSwitchTabs(e) {
      console.log('switch tabs ..', e);
      this.setData('pageActive', e.target.dataset.id);
    },
    async handleOpenFilter(e) {
      console.log('filter ..', e);
      if(e.target.dataset.boolViewFilter){
        return this.toggleFilterShow(e);
      }
      let tasks = this.generatorFn(this.charts), ret;
      while(ret = await tasks.next()){
        if(ret.done){
          break;
        }
      }
      console.log('promise', this.charts);
      this.toggleFilterShow(e);
    },
    handleSwitchTimeout(e) {
      console.log('switch time ..', e);
      console.log(this.data.timeoutActive)
      this.setData('timeoutActive', e.target.dataset.id);
    }, 
  }
  toggleFilterShow(e){
    console.log('filter toggle.');
    const boolCanvasShow = e.target.dataset.boolViewFilter;
    if(boolCanvasShow){
      setTimeout(e => {
        this.boolCanvasShow = boolCanvasShow;
        this.boolImageShow = !boolCanvasShow;
        this.$apply();
      }, 300);
    }else{
      this.boolCanvasShow = boolCanvasShow;
      this.boolImageShow = !boolCanvasShow;    
    }
    this.boolViewFilter = !boolCanvasShow;
    this.$apply();
  }
  generatorFn = async function* gfn(list){
    let item, index = 0;
    while(item = list[ index ]){
      yield await this.canvasToTempFile(index);
      index ++;
    }
  }
  
  canvasToTempFile(index) {
    console.log(this.charts[index].canvasId)
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 350,
        height: 150,
        destWidth: 300,
        destHeight: 150,
        canvasId: this.charts[index].canvasId,
        success: (res) => {
          resolve(res)
          console.log(res.tempFilePath)
          this.charts[index].src = res.tempFilePath;
          
        } 
      })
    });
    
  }
  onLoad() {
    console.log(this);
    this.setData('username', 'lawrence');
    this.setData('tabs', [
      {id: 1, name: '人员业绩'},
      {id: 2, name: '学校业绩'},
      {id: 3, name: 'APP业绩'},
      {id: 4, name: '设备业绩'}]);
    this.setData('timeouts', [
      {id: 1, name: '按日'},
      {id: 2, name: '按周'},
      {id: 3, name: '按月'}]);
  }
  onReady() {
    console.log('ready..');

  }
  onShow() {
    console.log('show !');
  }
}