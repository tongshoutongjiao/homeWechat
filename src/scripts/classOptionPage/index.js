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
    contentObj: {},
    dormInfo: {
      nodeType: 'school4Dorm',
    },
    dormData: {
      dormNumberList: [
        {
          floorName: '1号楼男生',
          floorId: '0'
        }


      ],// 楼号
      floorNameList: [
        {
          layerId: '0',
          layerName: '108层',
          index: 0
        }
      ],// 楼层
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
        data = this.dormData;
      switch (selectType) {
        case 'grade':
          console.log('点击对应的年级信息');
          let gradeId = dataObj.gradeId,
            gradeName = dataObj.gradeName;
          this.selectGrade = index;
          this.idObj.gradeId = gradeId;
          this.contentObj.gradeName = gradeName;
          this.classList = this.gradesList[index].list;
          break;
        case 'dormNumber':
          this.selectDormNumber = index;
          this.selectLayer = 0;
          this.idObj.floorId = dataObj.floorId;
          this.idObj.layerId = 'all';
          data.floorNameList = data.dormNumberList[index].list;
          this.dormData.dormNameList = [{dormId: 'all', dormName: '全部'}];
          break;
        case 'floor':
          this.idObj.layerId = dataObj.layerId;
          this.idObj.schoolId = this.schoolId;
          this.selectLayer = index;
          if (dataObj.layerId === 'all') {
            this.dormData.dormNameList = [{dormId: 'all', dormName: '全部'}];
            return;
          }
          // 根据楼层号获取动画宿舍号
          this.getDormNumList(this.idObj);
          break;
        case 'dormRoom':
          console.log('点击宿舍号');
          this.idObj.dormId = dataObj.dormId;
          console.log(this.idObj);
          if (dataObj.dormId === 'all') {
            console.log('4种情况可能按照学校查询，也可能按照宿舍楼查询，可能按照楼层查询,还可能按照宿舍号查询');

            //
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
            this.$parent.globalData.dormInfo = this.dormInfo;
            console.log(this.$parent.globalData.dormInfo);
          }


          break;
      }
      this.$apply();
    },

    // 点击对应的班级信息
    clickSelectInfo: function (e) {
      let dataset = e.currentTarget.dataset,
        classId = dataset.classId,
        idObj = this.idObj,
        contentObj = this.contentObj,
        selectedInfo = {};
      if (dataset.className === '全部') {
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
        selectedInfo.classId = dataset.classId;
        selectedInfo.content = dataset.className;
      }
      this.$parent.globalData.selectedInfo = selectedInfo;
      wepy.navigateBack({
        delta: 1
      });
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

    // 确认之前页面是出入校考勤还是宿舍考勤
    // 如果是出入校考勤，则按年级班级正常显示
    // 如果是宿舍考勤的话，则需要根据学校id获取到学校的宿舍楼信息


    setTimeout(e => this.initData());
  }

  initData() {
    // 进入页面首先清除之前存入全局变量中的数据
    delete this.$parent.globalData.selectedInfo;
    let typeId = this.typeId;

    // typeId 考勤类型
    switch (typeId) {
      case '1':
        console.log('班级考勤');
        break;
      case '3':
        console.log('宿舍考勤');
        this.getDormInfo();
        break;
    }
    this.getGradesInfo();
  }

  onShow() {
    console.log('show !');
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

    if (res.data.result === 200) {
      data.dormNumberList = res.data.data;
    }
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
    if (res.data.result === 200) {
      this.dormData.dormNameList = this.dormData.dormNameList.concat(res.data.data);
    }


    this.$apply();
  }

  // 判断按照宿舍考勤的查找条件
  judgeQueryType() {

    console.log(this.idObj);

    if (this.idObj.floorId === 'all') {
      console.log('按照学校查找的');
      this.idObj.gradeId = '';
      this.dormInfo.queryType = '4';
      this.dormInfo.content = '全校';
      for (let key in this.idObj) {
        this.dormInfo[key] = this.idObj[key]
      }
      this.$parent.globalData.dormInfo = this.dormInfo;
      console.log(this.$parent.globalData.dormInfo);
    } else {
      if (this.idObj.layerId === 'all') {
        console.log('按照宿舍楼查找');
        this.dormInfo.queryType = '3';
        this.dormInfo.content = '全校';
      } else {
        console.log('按照楼层查找');
        this.dormInfo.queryType = '2';
        this.dormInfo.content = '全校';
      }

    }
    this.$apply();


  }

}
