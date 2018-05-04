import wepy from 'wepy';
import api from '../api';
import toolkit from '../utils/toolkit.js'

const defaultPhoto = '../asset/hp_icon.png';
const userTelNum = encodeURI(wepy.getStorageSync('userTelNum')).replace(/\+/g, '%2B');
const userName = wepy.getStorageSync('userName');

var areaInfo = [];//所有省市区县数据

var provinces = [];//省

var citys = [];//城市

var countys = [];//区县

var index = [0, 0, 0];

var cellId;

var t = 0;
var show = false;
var moveY = 200;


export default class Index extends wepy.page {
  components = {};
  config = {
    navigationBarTitleText: '添加学生'
  };
  data = {
    defaultPhoto: defaultPhoto,
    multiArray: [
      [],
      [],
    ],
    multiIndex: [0, 0],
    curGradeList: [],
    selectClassId: '',
    studentInfo: {
      sex: '', // 1 男 0 女
      studentImg: '',
      name: '',
      classId: '',
      identity: '',
      address: '',
      regionId: '',
      // studentCode: '',// 学号
      qinPhone1: '',
      qinPhone2: '',
      qinPhone3: '',
      cardCode: '',// 卡号
      isGuashi: '',// 1挂失 0否
      isBus: '',// 1 乘车 0否
      isDorm: '',// 1 住宿 0 走读
      uuid: ''

    },
    pickerFlag: false,
    gradeName: '',

    //  省市县三级联动
    show: show,
    provinces: provinces,
    citys: citys,
    countys: countys,
    value: [0, 0, 0],
    province: '',
    city: '',
    county: '',
    selectAddressFlag: false,
  };
  events = {};
  methods = {

    // picker多项选择器
    bindMultiPickerChange: function (e) {
      this.pickerFlag = true;
      this.multiIndex = e.detail.value;
    },
    bindMultiPickerColumnChange: function (e) {
      // 滑动左边时，判断班级数是否为1，如果为1，则将改班级id设为默认值
      let gradeData=this.multiArray[0];
      let value = e.detail.value;
      this.pickerFlag = true;
      this.multiIndex[e.detail.column] = value;
      if (e.detail.column === 0) {
        for (let i = 0; i < gradeData.length;i++) {
          if(i===value){
            this.multiArray[1]=gradeData[i].list;
            if(gradeData[i].list.length=='1'){
              this.selectClassId=gradeData[i].list[0].classId;
            }
            this.multiIndex[1]=0;
          }
        }
      } else {
        //   获取到当前班级的classId
        console.log('第一列');
        this.selectClassId=this.multiArray[1][value].classId;
        console.log(this.multiArray[1][value].classId);
      }
    },

    // 点击选中样式
    clickSelectItem: function (e) {
      let data = e.currentTarget.dataset;
      let selectClassic = data.classic;
      switch (selectClassic) {
        case 'sex':
          let studentSex = data.sex;
          this.studentInfo.sex = studentSex;
          break;
        case 'dorm':
          let isDorm = data.isDorm;
          this.studentInfo.isDorm = isDorm;
          break;
        case'guashi':
          let isGuashi = data.isGuashi;
          this.studentInfo.isGuashi = isGuashi;
          break;
        case 'bus':
          let isBus = data.isBus;
          this.studentInfo.isBus = isBus;
          break;

      }
    },
    // 点击上传图片
    clickUploadImg: function () {
      let that = this;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          console.log(res);
          let tempPaths = res.tempFilePaths;
          if (res.tempFilePaths.length) {
            that.uploadImg(res.tempFilePaths)
          } else {
            console.log('未选择图片');
          }

        }
      })
    },

    // 点击保存新增学生信息
    clickSaveStudentInfo: function (e) {
      console.log('保存用户输入的信息');
      console.log(this.studentInfo);
      this.addNewStudent();
    },

    //  获取输入框中的内容
    searchValueInput(e) {
      console.log(e);
      let inputType = e.currentTarget.dataset.inputType,
        value = e.detail.value;
      console.log(inputType);
      switch (inputType) {
        case 'name':
          this.studentInfo.name = value;
          break;
        case 'qinPhone1':
          this.studentInfo.qinPhone1 = value;
          break;
        case 'qinPhone2':
          this.studentInfo.qinPhone2 = value;
          break;
        case 'qinPhone3':
          this.studentInfo.qinPhone3 = value;
          break;
        case 'cardCode':
          this.studentInfo.cardCode = value;
          break;
        case 'identify':
          this.studentInfo.identity = value;
          break;
        case 'address':
          this.studentInfo.address = value;
          break;
      }

    },

    //  隐藏弹窗浮层
    hiddenFloatView(e) {
      this.moveY = 200;
      this.show = false;
      this.t = 0;
      this.animationEvents(this, this.moveY, this.show);
    },

    //  滑动事件
    bindChange: function (e) {
      let val = e.detail.value,
        provinceIndex = val[0],
        provinceId = '';
      this.value = val;
      this.selectAddressFlag = true;
      provinceId = this.provinces[provinceIndex].regionId;
      this.province = this.provinces[provinceIndex].regionName;
      this.getCity(provinceId);
      this.$apply();
    },

    //  移动按钮点击事件
    clickSelectPosition: function (e) {
      if (this.t == 0) {
        this.moveY = 0;
        this.show = true;
        this.t = 1;
      } else {
        this.moveY = 200;
        this.show = false;
        this.t = 0;
      }
      this.animationEvents(this, this.moveY, this.show);
    },
  };

  // 动画事件
  animationEvents(that, moveY, show) {
    console.log("moveY:" + moveY + "\nshow:" + show);
    that.animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 400,
        timingFunction: "ease",
        delay: 0
      }
    );
    that.animation.translateY(moveY + 'vh').step();
    that.animation = that.animation.export();
    that.show = show;
  }

  //
  async getClassByGradesList() {
    let tempData;
    let list = await api.schoolBusinessList({
      showLoading: true,
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    // 保存所有年级数据
    tempData =list.data.result === 200 ?  list.data.schoolBusinessList : [];

    tempData.forEach(function (item) {
      item.className=item.gradeName;
      });

    this.multiArray[0]=tempData;

    // 设置班级默认值为第一个年级下的数据
    this.multiArray[1]=tempData[0].list;
    this.$apply();
  }


  async uploadImg(paths, callback, imgs) {

    const uploadRes = await api.addStudentPhoto({
      filePath: paths[0],
      name: 'imgfile',
      formData: {},
    });
    console.log('uploadRes');
    console.log(uploadRes);
    const photoRes = JSON.parse(uploadRes.data);
    if (!photoRes.data || !photoRes.data[0]) {
      wx.showToast({
        title: '上传失败',
        icon: 'none',
      });
      return;
    }
    wx.showToast({
      title: '上传成功',
      icon: 'success',
    });
    console.log(uploadRes);
    this.studentInfo.studentImg = photoRes.data[0].imgUrl;
    this.$apply();

  }

  onReady() {
    console.log('ready..');
    this.animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 0,
      timingFunction: "ease",
      delay: 0
    });
  }

  onShow() {
    console.log('show !');
  }

  async onLoad(option) {
    console.log('页面信息');
    console.log(option);
    this.schoolId = option.schoolId;
    this.gradeName = option.gradeName;

    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  async initData() {

    console.log('初始化数据');

    //  获取省数据
    this.getProvince();

    //  获取选择年级下的所有班级
    this.getClassByGradesList();

  }

  async getProvince() {
    let regionId = '', defaultProvince,
      provinceIndex = this.value[0];
    let res = await api.getRegionProvince({
      method: 'POST',
    });
    if (res.data.result === 200) {
      defaultProvince = res.data.data[provinceIndex];
      this.province = defaultProvince.regionName;
      this.provinces = res.data.data;
      regionId = defaultProvince.regionId;
      this.getCity(regionId);
      this.$apply();
    }
  }

  async getCity(id) {
    let defaultCity = '', regionId = '',
      cityIndex = this.value[1];
    let res = await api.getRegionCity({
      method: 'POST',
      data: {
        superRegionId: id,
      },
    });
    if (res.data.result === 200) {
      this.citys = res.data.data;
      defaultCity = res.data.data[cityIndex];
      this.city = defaultCity.regionName;
      regionId = defaultCity.regionId;
      this.getCountry(regionId);
      this.$apply();
    }
  }

  async getCountry(id) {
    let defaultCounty = '', regionId = '', countryIndex = this.value[2];
    let res = await api.getRegionCounty({
      method: 'POST',
      data: {
        superRegionId: id,
      }
    });
    if (res.data.result === 200) {
      this.countys = res.data.data;
      defaultCounty = res.data.data[countryIndex];
      regionId = defaultCounty.regionId;
      this.county = defaultCounty.regionName;
      this.studentInfo.regionId = regionId;
      this.$apply();
    }
  }

  async addNewStudent() {
    let data = this.studentInfo;
    data.userTelNum = userTelNum;
    data.userName = userName;
    data.classId=this.selectClassId;
    let res = await api.addNewStudent({
      showLoading: true,
      method: 'POST',
      data: data
    });
    if (res.data.result === 200) {
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      });
      wx.navigateBack({
        delta: 1
      })
    }
  }
}