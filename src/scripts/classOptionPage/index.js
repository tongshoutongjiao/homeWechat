import wepy from 'wepy';
import api from '../api';
import * as Toolkit from '../utils/toolkit';
import * as commonMethods from '../utils/commonMethods';


const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '选择班级'
  };
  data = {
    gradesList: [],// 年级信息
    classList: [],// 班级列表
    allClassList: [],// 全校班级列表
    allFloorList: [],// 全校楼层列表
    selectGrade: 0,// 选中年级
    selectDormNumber: 0,// 选中楼号
    selectLayer: 0,// 选中楼层号
    schoolId: '',
    typeId: '', // 考勤类型  1 出入校考勤 3 宿舍考勤
    selectedOptions: 'dorm',// 考勤方式：默认按照宿舍楼考勤
    idObj: {
      schoolId: '',
      floorId: 'all',
      layerId: '',
      gradeId: 'all',
    },// 学校  宿舍楼 宿舍id
    contentObj: {},// 所有用户选择过的内容，
    dormInfo: {
      nodeType: 'school4Dorm',
    },
    dormData: {
      dormNumberList: [],// 楼号
      floorNameList: [],// 楼层
      dormNameList: [
        {
          dormId: 'all',
          dormName: '全部'
        }
      ],// 宿舍名
    }
  };
  events = {};
  methods = {

    // 点击年级显示对应的班级信息
    clickGetListInfo: function (e) {
      let dataObj = e.currentTarget.dataset,
        selectType = dataObj.selectType,
        index = dataObj.index,
        data = this.dormData,
        contentObj = this.contentObj,
        idObj = this.idObj;
      switch (selectType) {
        case 'grade':
          console.log('点击对应的年级信息');
          let gradeId = dataObj.gradeId,
            gradeName = dataObj.gradeName;
          this.selectGrade = index;
          this.classList = this.gradesList[index].list;
          idObj.gradeId = gradeId;
          contentObj.gradeName = gradeName;
          break;
        case 'dormNumber':
          this.selectDormNumber = index;
          this.selectLayer = 0;
          data.floorNameList = data.dormNumberList[index].list;
          this.dormData.dormNameList = [{dormId: 'all', dormName: '全部'}];
          idObj.floorId = dataObj.floorId;
          idObj.layerId = 'all';
          contentObj.floorName = dataObj.floorName;
          break;
        case 'floor':
          this.selectLayer = index;
          if (dataObj.layerId === 'all') {
            this.dormData.dormNameList = [{dormId: 'all', dormName: '全部'}];
          }
          idObj.layerId = dataObj.layerId;
          idObj.schoolId = this.schoolId;
          contentObj.layerName = dataObj.layerName;
          console.log('查看楼层号');
          console.log(dataObj.layerId);
          console.log(idObj);
          // 根据当前楼层号获取宿舍号
          this.getDormNumList(idObj);
          break;
        case 'dormRoom':
          console.log('点击宿舍号');
          this.idObj.dormId = dataObj.dormId;
          this.dormInfo.nodeType = 'school4Dorm';
          console.log('按照宿舍查询');
          console.log(this.dormInfo);
          if (dataObj.dormId === 'all') {
            console.log('4种情况可能按照学校查询，3也可能按照宿舍楼查询，2可能按照楼层查询');
            this.judgeQueryType();
          }
          else {
            console.log('只能是按照宿舍号查询');
            this.idObj.gradeId = '';
            this.dormInfo.queryType = '1';
            this.dormInfo.content = dataObj.dormName;
            for (let key in this.idObj) {
              this.dormInfo[key] = this.idObj[key]
            }
          }
          this.$parent.globalData.dormInfo = this.dormInfo;
          wepy.navigateBack({
            delta: 1
          });
          this.$apply();
          break;
      }
      this.$apply();
    },

    // 点击对应的班级信息
    clickSelectInfo: function (e) {
      let dataset = e.currentTarget.dataset,
        dormInfo = this.dormInfo,
        selectedInfo = {};

      switch (this.typeId) {
        case '1':
          console.log('处理选中的数据');
          this.operateClassData(dataset, selectedInfo, 'selectedInfo');
          break;
        case '3':
          console.log('宿舍考勤');
          this.operateClassData(dataset, dormInfo, 'dormInfo');
          break;

      }
      this.$apply();
    },

    // 点击切换选择条件
    clickSelectCondition: function (e) {
      let type = e.currentTarget.dataset.selectType;
      this.selectedOptions = type;
      switch (type) {
        case'dorm':
          this.dormInfo.nodeType = 'school4Dorm';
          break;
        case 'className':
          this.dormInfo.nodeType = 'school';
          break;
      }
      this.$apply();
    }

  };

  async onLoad(e) {
    console.log('页面参数');
    console.log(e);
    this.schoolId = e.schoolId;
    this.typeId = e.typeId;
    this.idObj.schoolId = e.schoolId;
    this.selectedOptions = e.selectType;
    setTimeout(e => this.initData());
    this.$apply();
  }

  initData() {

    // 进入页面首先清除之前存入全局变量中的数据，防止影响其他操作
    delete this.$parent.globalData.selectedInfo;
    delete this.$parent.globalData.dormInfo;
    let typeId = this.typeId;

    // typeId 考勤类型

    if (typeId === '3') {
      // 根据 selectedOptions来判断显示的是按照宿舍楼还是按照班级
      this.getDormInfo();
    }
    this.getGradesInfo();
    this.$apply();
  }

  // 获取年级信息
  async getGradesInfo() {
    let allClassList = this.allClassList,
      gradesList = await commonMethods.getBussinessList(this),
      resType = 'grade';
    let targetObj = this.handleResponseData(gradesList, allClassList, resType);
    this.classList = targetObj.classifyData;
    this.gradesList = targetObj.resData;
    this.$apply();
  }

  // 二次处理返回数据
  handleResponseData(resData, classifyData, resType) {
    switch (resType) {
      case 'grade':
        resData.unshift({
          gradeId: 'all',
          gradeName: '全部',
        });
        resData.forEach((item, index) => {
          ['gradeOpen', 'gradeUnOpen'].forEach((prop) => {
            delete item[prop]
          });
          item.index = index;
          if (item.list) {
            item.list.unshift({
              className: '全部',
              classId: item.gradeId,
              gradeName: item.gradeName,
            });
          }
        });
        classifyData.unshift({
          className: '全部',
        });
        resData[0].list = classifyData;
        break;
      case 'dorm':
        resData.unshift({
          floorId: 'all',
          floorName: '全部',
        });
        resData.forEach((item, index) => {
          item.index = index;
          if (item.list) {
            item.list.unshift({
              layerId: 'all',
              layerName: '全部',
            });
            item.list.forEach(function (item, index) {
              item.index = index;
            })
          }
        });
        classifyData.unshift({
          layerName: '全部',
          layerId: 'all',
          index: 0
        });
        resData[0].list = classifyData;
        break;
    }
    this.$apply();
    return {
      classifyData,
      resData
    }
  }

  // 获取宿舍信息
  async getDormInfo() {
    let data = this.dormData,
      resType = 'dorm';
    data.dormNumberList = [];

    let res = await api.getDormInfo({
      method: 'POST',
      data: {
        schoolId: '166'
      }
    });
    res.data.result === 200 && (data.dormNumberList = res.data.data);
    let targetObj = this.handleResponseData(data.dormNumberList, this.allFloorList, resType);
    data.floorNameList = targetObj.classifyData;
    data.dormNumberList = targetObj.resData;
    this.$apply();
  }

  // 获取宿舍班级号
  async getDormNumList(idObj) {
    let res = await api.getDormListByFloorId({
      method: 'POST',
      data: idObj
    });
    console.log('当前楼层的宿舍号');
    console.log(res);
    console.log(res.data.data);

    res.data.result === 200 && (this.dormData.dormNameList = res.data.data);
    this.dormData.dormNameList.unshift( {
      dormId: 'all',
      dormName: '全部'
    });
    this.$apply();
  }

  // 判断按照宿舍考勤的查找条件
  judgeQueryType() {
    let contentObj = this.contentObj;
    console.log(this.idObj);
    if (this.idObj.floorId === 'all') {
      console.log('按照学校查找的');
      this.idObj.gradeId = '';
      this.dormInfo.queryType = '4';
      this.dormInfo.content = '全校';
      for (let key in this.idObj) {
        this.dormInfo[key] = this.idObj[key]
      }
    } else {
      if (this.idObj.layerId === 'all') {
        console.log('按照宿舍楼查找');
        this.dormInfo.queryType = '3';
        // 宿舍楼
        this.dormInfo.content = contentObj.floorName;
        for (let key in this.idObj) {
          this.dormInfo[key] = this.idObj[key]
        }
      }
      else {
        console.log('按照楼层查找');
        this.dormInfo.queryType = '2';
        this.dormInfo.content = contentObj.layerName;
        for (let key in this.idObj) {
          this.dormInfo[key] = this.idObj[key]
        }
      }
    }
    this.$apply();
  }

//   选择班级时，判断是出入校还是宿舍
  operateClassData(data, selectedInfo, name) {
    let idObj = this.idObj,
      contentObj = this.contentObj,
      queryType;
    if (data.className === '全部') {
      //  只需要传递schoolId 和gradeId gradeName
      if (idObj.gradeId !== 'all') {
        selectedInfo.schoolId = idObj.schoolId;
        selectedInfo.gradeId = idObj.gradeId;
        selectedInfo.content = contentObj.gradeName;
      }
      else {
        selectedInfo.schoolId = idObj.schoolId;
        selectedInfo.gradeId = '';
        selectedInfo.content = '全校';
        selectedInfo.classId = '';
      }
    }
    else {
      // 需要传递三个参数  schoolId gradeId  classId className
      selectedInfo.schoolId = idObj.schoolId;
      selectedInfo.gradeId = idObj.gradeId;
      selectedInfo.classId = data.classId;
      selectedInfo.content = data.className;
    }
    // 按班级查寝（3：全校 2：年级 1：班级）
    if (name === 'dormInfo') {
      console.log(selectedInfo);
      queryType = data.className !== '全部' ? '1' : idObj.gradeId !== 'all' ? '2' : '3';
      console.log(queryType);
      selectedInfo.queryType = queryType;
      selectedInfo.nodeType='school';
    }
    this.$parent.globalData[`${name}`] = selectedInfo;
    wepy.navigateBack({
      delta: 1
    });
    this.$apply();
  }
}
