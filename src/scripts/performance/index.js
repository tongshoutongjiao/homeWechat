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
    userId: '',
    userType: '',
    reportType: 1,
    operaType: 6,
    logdate: '',
    regionId: '',
    regionLevel: '',
    startdate: null,
    enddate: null,
    quarters: [],
    viewportRect: {}
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
      this.$apply();
      this.getPageData();
      
    },
    'filter-cancel': e => {
      console.log(e);
      this.toggleFilterShow(e);
    },
    'chart-complete': charts => {
      charts.forEach(chart => {
        console.log(chart.opts.type)
        if(chart.opts.type === 'line'){
          setTimeout(e => chart.scrollStart({touches: [{x: 9999}]}));
          setTimeout(e => chart.scroll({touches: [{x: 0}]}));
          setTimeout(e => chart.scrollEnd());
        }
      });
    }
  }
  methods = {
    handleSwitchTabs(e) {
      console.log('switch tabs ..', e);
      if(this.userType === '5'){
        return;
      }
      this.pageActive = e.currentTarget.dataset.id;
      this.$apply();
      this.getPageData();
    },
    async handleOpenFilter(e) {
      console.log('filter ..', e);
      if(this.userType === '5' || this.userType === '4'){
        return;
      }
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
      if(this.userType === '5'){
        return;
      }
      this.switchTimeout(e.currentTarget.dataset.id);
      this.$apply();
      this.getPageData();
    }, 
    handleDateChange(e) {
      console.log('picker changed..',e);
      if(this.timeoutActive === 4){
        this.logdate = this.quarters[Number(e.detail.value)];
      } else {
        this.logdate = e.detail.value;
      }
      this.$apply();
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
  chartsFactory(id = '', title = '', type = 'line', series = [], categories = [], legend = false) {
    const viewportRect = this.viewportRect;
    const width = this.viewportRect.width / 750 * 700;
    const height = width / 700 * (type === "pie" ? 400 : 300);
    let ret = {
      title,
      type,
      categories,
      series,
      canvasId: `canvas_${id}`, 
      yAxis: {
        title: '个',
        format: e => '',
        min: 0
      },
      width,
      height,
      animation: false,
      dataLabel: true,
      dataPointShape: true,
      enableScroll: true,
      legend: legend || type === 'pie',
      dataLabe: true,
      disablePieStroke: true,
      extra: {
        // lineStyle: 'curve'
      }
    };
    if(type === 'line'){
      ret.yAxis.min = series[0].data.slice(0).sort((a, b) => a - b)[0];
    }
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
    let {userId = we, userType, reportType, operaType, logdate, regionId, regionLevel} = this;
    let params = {userId, userType, reportType, operaType, logdate, regionId, regionLevel};
    if(userType === '5'){
      return;
    }
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
    const ret = await api.getPerformanceForEquipment({mask: true, data: params});
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
        data: retData.useOnline || 0,
        format: num => `${(num * 100).toFixed(0)}% ${retData.useOnline}`
      },
      {
        name: '掉线数量',
        data: retData.useDropped || 0,
        format: num => `${(num * 100).toFixed(0)}% ${retData.useDropped}`
      }
    ];
    const swiperNumberSeries = [
      {
        name: '在线数量',
        data: retData.swipeOnline || 0,
        format: num => `${(num * 100).toFixed(0)}% ${retData.swipeOnline}`
      },
      {
        name: '掉线数量',
        data: retData.swipeDropped || 0,
        format: num => `${(num * 100).toFixed(0)}% ${retData.swipeDropped}`
      }
    ];
    const telNumberSeries = [
      {
        name: '在线数量',
        data: retData.phoneOnline || 0,
        format: num => `${(num * 100).toFixed(0)}% ${retData.phoneOnline}`
      },
      {
        name: '掉线数量',
        data: retData.phoneDropped || 0,
        format: num => `${(num * 100).toFixed(0)}% ${retData.phoneDropped}`
      }
    ];
    console.log(swiperAndTelNumberSeries,swiperNumberSeries,telNumberSeries )
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '刷卡器+电话机数量/部', 'pie', swiperAndTelNumberSeries ));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '刷卡器数量/部', 'pie', swiperNumberSeries));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '电话机数量/部', 'pie', telNumberSeries ));
    
  }
  async getPerformanceForSchool(params) {
    const ret = await api.getPerformanceForSchool({mask: true, data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;``
    }
    const schools = ret.data.data[0];
    const categories = ['幼儿园', '小学', '初中', '高中', '复合', '其他'];
    const total = Object.keys(schools).reduce((a, b) => a + Number(schools[b]), 0);
    const series = [
      {
        name: '幼儿园',
        data: schools.kindergartenSchool,
        format: num => `${(num * 100).toFixed(0)}% ${schools.kindergartenSchool}`
      },
      {
        name: '小学',
        data: schools.primarySchool,
        format: num => `${(num * 100).toFixed(0)}% ${schools.primarySchool}`
      },
      {
        name: '初中',
        data: schools.middleSchool,
        format: num => `${(num * 100).toFixed(0)}% ${schools.middleSchool}`
      },
      {
        name: '高中',
        data: schools.highSchool,
        format: num => `${(num * 100).toFixed(0)}% ${schools.highSchool}`
      },
      {
        name: '复合',
        data: schools.mixtureSchool,
        format: num => `${(num * 100).toFixed(0)}% ${schools.mixtureSchool}`
      },
      {
        name: '其他',
        data: schools.ortherSchool,
        format: num => `${(num * 100).toFixed(0)}% ${schools.ortherSchool}`
      }
    ];
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '截止今日凌晨已签约学校/所', 'pie', series));

  }
  // 持卡
  async getPerformanceForCardHoding(params) {
    const ret = await api.getPerformanceForCardHoding({mask: true, data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;
    }
    const {bussnesCount, bussnesCountPercent, bussnessSum, bussnessSumPercent, handleCardNum, handleCardNumPercent, studentSum} = ret.data.data[0];
    const categories = ['学生总数', '持卡总数', '订购人数', '订购数量'];
    const dataList = [studentSum, handleCardNum, bussnesCount, bussnessSum];
    const series = [{
      data: dataList,
      format: ((list) => {
        let index = 0;
        return num => {
          num = Number(num);
          if(num > 10000) {
            num = Number(num / 10000).toFixed(1) + '万';
          }
          let ret = String(num);
          if(index){
            ret = `${list[index]} ${num}`
          }
          index ++;
          if(index === 4){
            index = 0;
          }
          return ret;
        };
      })(['', handleCardNumPercent, bussnesCountPercent, bussnessSumPercent])
    }];
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '持卡情况', 'column', series, categories));
  }
  async getPerformanceForOrders(params) {
    const ret = await api.getPerformanceForOrders({mask: true, data: params});
    console.log(ret);
    if(ret.data.result !== 200){
      return;
    }
    const {resNumber, resPerson} = ret.data;
    let currIndex = this.charts.length;
    const categories = ['三元套餐', '五元套餐', '七元套餐', '十元套餐'];
    const dataList = [resPerson[0].sanSum, resPerson[0].wuSum, resPerson[0].qiSum, resPerson[0].shiSum ];
    const peopleDataList = [resNumber[0].sanSum, resNumber[0].wuSum, resNumber[0].qiSum, resNumber[0].shiSum ];
    const peopleSeries = [
      {
        name: '套餐订购人数',
        data: dataList,
        format: (num) => {
          num = Number(num);
          if(num > 10000) {
            num = Number(num / 10000).toFixed(1) + '万';
          }
          return String(num);
        }
      },
      {
        name: '套餐订购数量',
        data: peopleDataList,
        format: (num) => {
          num = Number(num);
          if(num > 10000) {
            num = Number(num / 10000).toFixed(1) + '万';
          }
          return String(num);
        }
      },
    ];
    currIndex = this.charts.push(this.chartsFactory(currIndex, '套餐订购', 'column', peopleSeries, categories, true));
  }
  async getPerformanceForOrderPeoples(params) {
    const ret = await api.getPerformanceForOrderPeoples({mask: true, data: params});
    if(ret.data.result !== 200){
      return;
    }
    console.log(ret);
    const { resPerson } = ret.data;
    const categories = resPerson.map(item => item.statusTime);
    const series = [{
      data: resPerson.map(item => item.managerSum),
    }];
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, '订购数量走势图', 'line', series, categories));


  }
  async getPerformanceForTrend(params) {
    const ret = await api.getPerformanceForTrend({mask: true, data: params});
    if(ret.data.result !== 200){
      return;
    }
    console.log(ret);
    let currIndex = this.charts.length;
    const { resAdd, resCut, resUp } = ret.data;
    const addCategories = resAdd.map(item => item.statusTime);
    const addSeries = [{
      data: resAdd.map(item => item.managerSum),
    }];
    const cutCategories = resCut.map(item => item.statusTime);
    const cutSeries = [{
      data: resCut.map(item => item.managerSum),
    }];
    const upCategories = resUp.map(item => item.statusTime);
    const upSeries = [{
      data: resUp.map(item => item.managerSum),
    }];
    currIndex = this.charts.push(this.chartsFactory(currIndex, '净增数量走势图', 'line', upSeries, upCategories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '新增数量走势图', 'line', addSeries, addCategories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '流失数量走势图', 'line', cutSeries, cutCategories));

  }
  async getPerformanceForApp(params) {
    const ret = await api.getPerformanceForApp({mask: true, data: params});
    if(ret.data.result !== 200){
      return;
    } 
    console.log(ret);
    const data = ret.data.resApp;
    const categories = data.map(item => item.statusTime);
    const teacherAppSeries = [{
      data: data.map(item => item.activedtnum),
    }];

    const teacherActiveCount = data[data.length - 1].activedtnum;
    const teacherNonActiveCount = data[data.length - 1].nonActivedtnum;
    const teacherAppPieSeries = [
      {
        name: '激活用户数',
        data: teacherActiveCount,
        format: num => `${(num * 100).toFixed(0)}% ${teacherActiveCount}`
      },
      {
        name: '未激活用户数',
        data: teacherNonActiveCount,
        format: num => `${(num * 100).toFixed(0)}% ${teacherNonActiveCount}`
      }
    ];
    const parentAppSeries = [{
      data: data.map(item => item.activedpnum),
    }];

    
    const parentActiveCount = data[data.length - 1].activedpnum;
    const parentNonActiveCount = data[data.length - 1].nonActivedpnum;
    const parentAppPieSeries = [
      {
        name: '激活用户数',
        data: parentActiveCount,
        format: num => `${(num * 100).toFixed(0)}% ${parentActiveCount}`
      },
      {
        name: '未激活用户数',
        data: parentNonActiveCount,
        format: num => `${(num * 100).toFixed(0)}% ${parentNonActiveCount}`
      }
    ];

    const tendencySeries = [
      {
        name: '家长',
        data: data.map(item => item.actpnum),
      },
      {
        name: '教师',
        data: data.map(item => item.acttnum),
      },
    ];
    
    let currIndex = this.charts.length;
    currIndex = this.charts.push(this.chartsFactory(currIndex, 'APP教师端', 'pie', teacherAppPieSeries));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '教师端激活用户走势图', 'line', teacherAppSeries, categories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, 'APP家长端', 'pie', parentAppPieSeries));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '家长端激活用户走势图', 'line', parentAppSeries, categories));
    currIndex = this.charts.push(this.chartsFactory(currIndex, '活跃用户走势图', 'line', tendencySeries, categories, true));

  }
  canvasToTempFile(index) {
    const chart = this.charts[index];
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: chart.width,
        height: chart.height,
        destWidth: chart.width,
        destHeight: chart.height,
        canvasId: chart.canvasId,
        success: (res) => {
          resolve(res)
          console.log(res.tempFilePath)
          this.charts[index].src = res.tempFilePath;
          
        } 
      })
    });
    
  }
  getViewportRect (cb) {
    wx.createSelectorQuery().selectViewport().boundingClientRect(ret => {
      cb(this.viewportRect = ret);
    }).exec();
  }
  initData() {
    this.tabs = [
      {id: 1, name: '人员业绩'},
      {id: 2, name: '学校业绩'},
      {id: 3, name: 'APP业绩'},
      {id: 4, name: '设备业绩'}];
    this.timeouts = [
      {id: 1, name: '按日'},
      {id: 3, name: '按月'},
      {id: 4, name: '按季'}];
    this.username = wepy.getStorageSync('userName')  || '';
    this.userId = wepy.getStorageSync('userId')  || '';
    this.userType = String(wepy.getStorageSync('userType'))  || '';
    this.quarters = this.getQuarters(4);
    this.switchTimeout(1);
    this.getPageData();
  }
  onLoad() {
    console.log('load..');
    wx.createSelectorQuery().selectViewport().boundingClientRect(ret => {
      this.viewportRect = ret;
      this.$apply();
      setTimeout(e => this.initData());
    }).exec();
  }
  onReady() {
    console.log('ready..');
  }
  onShow() {
    console.log('show !');
  }
}