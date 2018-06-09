import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';


const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '刷卡明细',
    // "enablePullDownRefresh": true
  };

  data = {
    recordData: [],
    typeId: '3',
    bindData: {
      array: [
        {
          typeName: '走读',
          isDorm: '0'
        },
        {
          typeName: '住宿',
          isDorm: '1'
        }
      ],
      index: '0'
    }
  };
  methods = {
    bindChangeStyle: function (e) {
      console.log(e);
      this.bindData.index = e.detail.value;
      this.$apply();
    }
  };

  async onLoad(e) {
    console.log(e);
    this.schoolId = e.id;
    // 根据上个页面传递的数据,先根据typeId判断是通过出入考勤还是通过宿舍考勤进来的
    // 出入校考勤：请求接口，默认是走读
    // 宿舍考勤:
    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onShow() {
  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉加载数据');
  }

  initData() {

    let defaultData = {
      schoolId: '',
      gradeId: '',
      classId: '',
      isdorm: '',//是否住宿 0 否 1 是 2 待定
      kaoqinSpanId: '',// 考勤时段
      attendanceDate: '',// 考勤日期
      kaoqinTypeId: '',//考勤类型id
      director: '',//刷卡状态 1 入校 0 出校 -1 未刷卡
      page: '',//当前页码
      number: ''// 每页数据条数
    };

    this.recordData = [
      {
        cardTime: '07:52',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '周杰伦',// 姓名
        isDorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:52',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '周杰伦',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:52',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '周杰伦',// 姓名
        isDorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:52',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '周杰伦',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      },
      {
        cardTime: '07:50',// 刷卡时间
        className: '1.03班',// 班级
        studentName: '朴树',// 姓名
        isdorm: '1',// 0 走读 1 住宿
      }
    ];
  }

}
