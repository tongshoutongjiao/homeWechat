import wepy from 'wepy';
// import Toast from 'wepy-com-toast';
import * as toolkit from '../utils/toolkit';
import api from '../api';
import ECharts from '../components/ec-canvas/ec-canvas';
import FilterSlider from '../components/slider-filter/slider-filter';

export default class Index extends wepy.page {
  components = {
    echarts: ECharts,
    'filter-slider': FilterSlider,
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
    charts: [],
    boolCanvasShow: true,
    boolImageShow: false,
    userId: wepy.getStorageSync('userId'),
    userType: wepy.getStorageSync('userType'),
    reportType: 1,
    operaType: 6,
    logdate: '',
    regionId: '',
    regionLevel: '',
    startdate: null,
    enddate: null,
    quarters: [],
  }
  events = {
    'filter-confirm': (e, ret) => {
      console.log(e);
      this.toggleFilterShow(e);
      this.regionId = ret.selectedItems.map(item => item.regionId).join(',');
      this.regionLevel = ret.selectedItems.map(item => item.regionLevel).join(',');
      this.operaType = ret.selectedItems.length ? ret.type : 6;
      this.userId = ret.userId || wepy.getStorageSync('userId'); 
      this.username = ret.userName ||  wepy.getStorageSync('userName'); 
      this.getPageData();
      
    },
    'filter-cancel': e => {
      console.log(e);
      this.toggleFilterShow(e);
    }
  }
  methods = {
    handleSwitchTabs(e) {
      console.log('switch tabs ..', e);
      this.pageActive = e.currentTarget.dataset.id;
      this.getPageData();
      this.$apply();
    },
    async handleOpenFilter(e) {
      console.log('filter ..', e);
      if(e.currentTarget.dataset.boolViewFilter){
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
      this.switchTimeout(e.currentTarget.dataset.id);
      this.getPageData();
    }, 
    handleDateChange(e) {
      console.log('picker changed..',e);
      if(this.timeoutActive === 4){
        this.logdate = this.quarters[Number(e.detail.value)];
      } else {
        this.logdate = e.detail.value;
      }
      this.getPageData();
    }
  }

  toggleFilterShow(e){
    console.log('filter toggle.');
    const boolCanvasShow = e.currentTarget.dataset.boolViewFilter;
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
    if(!boolCanvasShow){
      this.$invoke('filter-slider', 'open', true);
    }
    this.$apply();
  }
  generatorFn = async function* gfn(list){
    let item, index = 0;
    while(item = list[ index ]){
      yield await this.canvasToTempFile(index);
      index ++;
    }
  }
  chartsFactory(id = '', title = '', type = 'line', series = [], categories = []) {
    let ret = {
      title,
      type,
      categories,
      series,
      canvasId: `canvas_${id}`, 
      yAxis: {
        title: '个',
        format: function (val) {
          return ''
        },
        min: 0
      },
      width: 350,
      height: 150,
      animation: false,
      dataLabel: true,
      dataPointShape: true,
      enableScroll: true,
      extra: {
        // lineStyle: 'curve'
      }
    };
    return ret;
  }
  getQuarters(len) {
    const quarters = [];
    const currDate = new Date();
    let currYear = currDate.getFullYear();
    let currQuarter = Math.floor((currDate.getMonth() + 1) / 3);

    while(len){
      if(currQuarter <= 0){
        currYear --;
        currQuarter = 4;
      }
      quarters.push(`${currYear}年第${currQuarter}季度`);
      currQuarter --;
      len--;
    }

    return quarters;
  }
  switchTimeout(id) {
    this.reportType = this.timeoutActive = id;
    const currDate = new Date();
    const upDate = new Date(currDate.getTime() - 1000 * 3600 * 24);
    this.startdate = toolkit.dateFormat(new Date(currDate.getFullYear() - 1, currDate.getMonth(), 0), 'YYYY-MM-DD');
    switch(this.timeoutActive){
      case 1:
        this.logdate = toolkit.dateFormat(upDate, 'YYYY-MM-DD');
        this.enddate = this.logdate;
      break;
      case 2:
      break;
      case 3:
        this.logdate = toolkit.dateFormat(new Date(currDate.getFullYear(), currDate.getMonth(), 0), 'YYYY-MM');
        this.startdate = toolkit.dateFormat(this.startdate, 'YYYY-MM');
        this.enddate = this.logdate;
      break;
      case 4:
        this.logdate = this.quarters[0];
      break;
    }
    this.$apply();
  }
  async getPageData() {
    let {userId, userType, reportType, operaType, logdate, regionId, regionLevel} = this;
    let params = {userId, userType, reportType, operaType, logdate, regionId, regionLevel};
    if(reportType === 3){
      logdate = logdate.split('-').map(d => Number(d));
      params.logdate = toolkit.dateFormat(new Date(logdate[0], logdate[1], 0), 'YYYY-MM-DD');
    }
    switch(this.pageActive){
      case 1:
        this.getPersonPerformance(params);
      break;
      case 2:
        this.getSchoolPerformance(params);
      break;
      case 3:
        this.getAppPerformance(params);
      break;
      case 4:
        this.getEquipmentPerformance(params);
      break;
    }


    this.$apply();
  }
  async getAppPerformance(params) {
    this.charts = [];
    await this.getPerformanceForApp(params);
    this.$apply();
    this.$invoke('echarts', 'redraw', this.charts);

  }
  async getPersonPerformance(params) {
    this.charts = [];
    await this.getPerformanceForCardHoding(params);
    await this.getPerformanceForOrders(params);
    await this.getPerformanceForOrderPeoples(params);
    await this.getPerformanceForTrend(params);
    this.$apply();
    this.$invoke('echarts', 'redraw', this.charts);
  }
  async getSchoolPerformance(params){
    this.charts = [];
    await this.getPerformanceForSchool(params);
    this.$apply();
    this.$invoke('echarts', 'redraw', this.charts);
  }
  async getEquipmentPerformance(params){
    this.charts = [];
    await this.getPerformanceForEquipment(params);
    this.$apply();
    this.$invoke('echarts', 'redraw', this.charts);
  }
  async getPerformanceForEquipment(params) {
    const ret = await api.getPerformanceForEquipment({data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;
    }
    const retData = ret.data.data[0];
    const categories = ['无SIM卡', '在线数量', '掉线数量'];
    const columnCategories = ['有线身份识别', '免刷卡', '普通刷卡器'];
    const seriesLabel =  ['设备数量', '在线数量'];
    const swiperAndTelNumberSeries = [
      {
        name: '在线数量',
        data: retData.useOnline || 0
      },
      {
        name: '掉线数量',
        data: retData.useDropped || 0
      }
    ];
    const swiperNumberSeries = [
      {
        name: '在线数量',
        data: retData.swipeOnline || 0
      },
      {
        name: '掉线数量',
        data: retData.swipeDropped || 0
      }
    ];
    const telNumberSeries = [
      {
        name: '在线数量',
        data: retData.phoneOnline || 0
      },
      {
        name: '掉线数量',
        data: retData.phoneDropped || 0
      }
    ];
    console.log(swiperAndTelNumberSeries,swiperNumberSeries,telNumberSeries )
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '刷卡器+电话机数量/个', 'pie', swiperAndTelNumberSeries ));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '刷卡器数量/个', 'pie', swiperNumberSeries));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '电话机数量/个', 'pie', telNumberSeries ));
    
  }
  async getPerformanceForSchool(params) {
    const ret = await api.getPerformanceForSchool({data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;``
    }
    const schools = ret.data.data[0];
    const categories = ['幼儿园', '小学', '初中', '高中', '复合', '其他'];
    const series = [
      {
        name: '幼儿园',
        data: schools.kindergartenSchool
      },
      {
        name: '小学',
        data: schools.primarySchool
      },
      {
        name: '初中',
        data: schools.middleSchool
      },
      {
        name: '高中',
        data: schools.highSchool
      },
      {
        name: '复合',
        data: schools.mixtureSchool
      },
      {
        name: '其他',
        data: schools.ortherSchool
      }
    ];
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '截止今日凌晨已签约学校/所', 'pie', series));

  }
  // 持卡
  async getPerformanceForCardHoding(params) {
    const ret = await api.getPerformanceForCardHoding({data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;
    }
    const {bussnesCount, bussnesCountPercent, bussnessSum, bussnessSumPercent, handleCardNum, handleCardNumPercent, studentSum} = ret.data.data[0];
    const categories = ['学生总数', '持卡总数', '订购人数', '订购数量'];
    const series = [{
      data: [studentSum, handleCardNum, bussnesCount, bussnessSum]
    }];
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '持卡情况', 'column', series, categories));
  }
  async getPerformanceForOrders(params) {
    const ret = await api.getPerformanceForOrders({data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;
    }
    const {resNumber, resPerson} = ret.data;
    let currIndex = this.charts.length;
    const categories = ['三元套餐', '五元套餐', '七元套餐', '十元套餐'];
    const peopleSeries = [{
      data: [resPerson[0].sanSum, resPerson[0].wuSum, resPerson[0].qiSum, resPerson[0].shiSum ]
    }];
    const countSeries = [{
      data: [resNumber[0].sanSum, resNumber[0].wuSum, resNumber[0].qiSum, resNumber[0].shiSum ]
    }];
    currIndex = this.charts.push(this.chartsFactory(currIndex, '套餐订购人数', 'column', peopleSeries, categories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '套餐订购数量', 'column', countSeries, categories));
  }
  async getPerformanceForOrderPeoples(params) {
    const ret = await api.getPerformanceForOrderPeoples({data: params});
    if(ret.data.result !== 200){
      return;
    }
    console.log(ret);
    const { resPerson } = ret.data;
    const categories = resPerson.map(item => item.statusTime);
    const series = [{
      data: resPerson.map(item => item.managerSum)
    }];
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '订购人数走势图', 'line', series, categories));


  }
  async getPerformanceForTrend(params) {
    const ret = await api.getPerformanceForTrend({data: params});
    if(ret.data.result !== 200){
      return;
    }
    console.log(ret);
    let currIndex = this.charts.length;
    const { resAdd, resCut, resUp } = ret.data;
    const addCategories = resAdd.map(item => item.statusTime);
    const addSeries = [{
      data: resAdd.map(item => item.managerSum)
    }];
    const cutCategories = resCut.map(item => item.statusTime);
    const cutSeries = [{
      data: resCut.map(item => item.managerSum)
    }];
    const upCategories = resUp.map(item => item.statusTime);
    const upSeries = [{
      data: resUp.map(item => item.managerSum)
    }];
    currIndex = this.charts.push(this.chartsFactory(currIndex, '净增数量走势图', 'line', upSeries, upCategories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '新增数量走势图', 'line', addSeries, addCategories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '流失数量走势图', 'line', cutSeries, cutCategories));

  }
  async getPerformanceForApp(params) {
    const ret = await api.getPerformanceForApp({data: params});
    if(ret.data.result !== 200){
      return;
    } 
    console.log(ret);
    const data = ret.data.resApp;
    const categories = data.map(item => item.statusTime);
    const teacherAppSeries = [{
      data: data.map(item => item.activedtnum)
    }];
    const teacherAppPieSeries = [
      {
        name: '激活用户数',
        data: data.reduce((a, b) => a + Number(b.activedtnum), 0)
      },
      {
        name: '未激活用户数',
        data: data.reduce((a, b) => a + Number(b.nonActivedtnum), 0)
      }
    ];
    const parentAppSeries = [{
      data: data.map(item => item.activedpnum)
    }];
    const parentAppPieSeries = [
      {
        name: '激活用户数',
        data: data.reduce((a, b) => a + Number(b.activedpnum), 0)
      },
      {
        name: '未激活用户数',
        data: data.reduce((a, b) => a + Number(b.nonActivedpnum), 0)
      }
    ];
    
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, 'APP教师端', 'pie', teacherAppPieSeries));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '教师端激活用户走势图', 'line', teacherAppSeries, categories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, 'APP家长端', 'pie', parentAppPieSeries));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '家长端激活用户走势图', 'line', parentAppSeries, categories));

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
    this.setData('username', wepy.getStorageSync('userName')  || '');
    this.setData('tabs', [
      {id: 1, name: '人员业绩'},
      {id: 2, name: '学校业绩'},
      {id: 3, name: 'APP业绩'},
      {id: 4, name: '设备业绩'}]);
    this.setData('timeouts', [
      {id: 1, name: '按日'},
      {id: 3, name: '按月'},
      {id: 4, name: '按季'}]);
    this.quarters = this.getQuarters(4);
    this.switchTimeout(1);
    this.getPageData();
      
  }
  onReady() {
    console.log('ready..');

  }
  onShow() {
    console.log('show !');
  }
}