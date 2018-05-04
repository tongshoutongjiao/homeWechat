import wepy from 'wepy';
import api from '../api';
import CameraCom from '../components/camera/camera';

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
  components = {
    "camera-com": CameraCom
  };
  config = {
    navigationBarTitleText: '编辑学生信息'
  };
  data = {
    defaultPhoto: defaultPhoto,
    multiArray: [
      [],
      [],
    ],
    multiIndex: [0, 0],
    studentInfo: {},
    pickerFlag: false,
    dialogStatus: false,
    schoolId: '',
    studentId:'',
    productList:[],

    // 修改状态
    selectAddressFlag:false,

    //  省市县三级联动
    show: show,
    provinces: provinces,
    citys: citys,
    countys: countys,
    value: [0, 0, 0],
    province: '',
    city: '',
    county: '',
    boolCameraHidden: false
  };
  events = {
    'take-photo': ret => {
      console.log(ret)
    }

  };
  methods = {

    // picker多项选择器
    bindMultiPickerChange: function (e) {
      this.pickerFlag = true;
      this.multiIndex = e.detail.value
    },

    // picker多项选择器
    bindMultiPickerColumnChange: function (e) {
      let gradeData=this.multiArray[0];
      let value = e.detail.value;
      this.pickerFlag = true;
      this.multiIndex[e.detail.column] = value;
      if (e.detail.column === 0) {
        for (let i = 0; i < gradeData.length;i++) {
          if(i===value){
            this.multiArray[1]=gradeData[i].list;
            this.multiIndex[1]=0;
          }
        }
      }
      else {
        //   获取到当前班级的classId
        console.log('第一列');
        this.studentInfo.classId=this.multiArray[1][value].classId;
      }
    },

    // 取消选中班级
    cancelSelectClass:function (e) {
      console.log(e);
    },

    // 点击选中样式
    clickSelectItem: function (e) {
      let data = e.currentTarget.dataset,
        selectClassic = data.classic;

      switch (selectClassic) {
        case 'sex':
          let studentSex = data.sex;
          this.studentInfo.sex = studentSex;
          break;
        case 'dorm':
          let isDorm = data.isDorm;
          this.studentInfo.isDorm = isDorm;
          break;
        case'drop':
          let isDrop = data.isDrop;
          this.studentInfo.isGuashi = isDrop;
          break;
        case'bus':
          let isBus = data.isBus;
          this.studentInfo.isBus = isBus;

          break;

      }
    },

    //  点击开通套餐
    clickOpenStatus: function (e) {
      console.log('点击弹框显示选择开通套餐');
      let tels=e.currentTarget.dataset.tels,
        phoneTypes=e.currentTarget.dataset.phoneTypes;
      this.studentInfo.tels=tels;
      this.studentInfo.phoneTypes=phoneTypes;
      this.dialogStatus = true;
    },

    // 点击确定或者取消按钮关闭弹窗，取消开通业务
    clickCloseDialog: function (e) {
      let type=e.currentTarget.dataset.type;
      switch(type){
        case'cancel':
          this.dialogStatus = false;
          break;
        case 'sure':
          this.openProduct();
          this.dialogStatus = false;
          break;
      }

    },

    //  点击选择相应的套餐类型
    selectOrderType: function (e) {
      let productId = e.currentTarget.dataset.productId;
      this.studentInfo.productId = productId;
    },

    //  获取输入框中的内容
    searchValueInput(e) {
      let inputType = e.currentTarget.dataset.inputType,
        value = e.detail.value;
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
        case 'studentCode':
          this.studentInfo.studentCode = value;
          break;
        case 'cardCode':
          this.studentInfo.cardCode = value;
          break;
        case 'address':
          this.studentInfo.address = value;
          break;
        case 'identity':
          this.studentInfo.identity = value;
          break;
      }


    },

    //  点击保存按钮，提交修改后的数据
    clickSaveStudentInfo: function () {
      console.log('提交后台数据');
      this.updateStudentsInfo();
      this.$apply();

    },
    //  移动按钮点击事件
    clickSelectPosition: function (e) {

      if (this.t == 0) {
        this.moveY = 200;
        this.show = false;
        this.t = 0;

      } else {
        this.moveY = 0;
        this.show = true;
        this.t = 1;

      }
      this.animationEvents(this, this.moveY, this.show);

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
      console.log('触发选择');

      let val = e.detail.value,
        provinceIndex=val[0],
        provinceId='';
      this.value=val;
      this.selectAddressFlag=true;
      provinceId= this.provinces[provinceIndex].regionId;
      this.province=this.provinces[provinceIndex].regionName;
      this.getCity(provinceId);
      this.$apply();
    },

    //  点击上传头像
    clickUploadImg:function (e) {
      console.log('takePhotos');
      let that=this;
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


    }

  };

  async getProvince() {
    let regionId='',defaultProvince,
      provinceIndex=this.value[0];
    let res = await api.getRegionProvince({
      method: 'POST',
    });
    if(res.data.result===200){
      defaultProvince=res.data.data[provinceIndex];
      this.province = defaultProvince.regionName;
      this.provinces = res.data.data;
      regionId=defaultProvince.regionId;
      this.getCity(regionId);
      this.$apply();
    }
  }

  async getCity(id) {
    let defaultCity='',regionId='',
      cityIndex=this.value[1];
    let res = await api.getRegionCity({
      method: 'POST',
      data: {
        superRegionId: id,
      },
    });
    if(res.data.result===200){
      this.citys = res.data.data;
      defaultCity=res.data.data[cityIndex];
      this.city= defaultCity.regionName;
      regionId=defaultCity.regionId;
      this.getCountry(regionId);
      this.$apply();
    }
  }

  async getCountry(id) {
    let defaultCounty='',regionId='',countryIndex=this.value[2];
    let res = await api.getRegionCounty({
      method: 'POST',
      data:{
        superRegionId:id ,
      }
    });
    if(res.data.result===200){
      this.countys = res.data.data;
      defaultCounty=res.data.data[countryIndex];
      regionId=defaultCounty.regionId;
      this.county = defaultCounty.regionName;
      this.studentInfo.regionId=regionId;
      this.$apply();
    }
  }

  async openProduct(){
    let userId=encodeURI(wepy.getStorageSync('userId')).replace(/\+/g, '%2B'),
      ids=this.studentInfo.id,
       codes=this.studentInfo.codes||'#';
    let {tels,schoolId,productId,phoneTypes}=this.studentInfo;
    let res=await api.openProduct({
     method:'POST',
      data:{
        userId,
        ids,
        tels,
        codes,
        productId,
        schoolId,
        phoneTypes
      }
    });
    if(res.data.result===200){
      wx.showToast({
        title: '开通成功',
        icon: 'success',
        duration: 2000
      });
    }
  }

  async getStudentsInfoById(id) {
    let res = await api.getStudentsInfoById({
      showLoading: true,
      method: 'POST',
      data: {
        studentId: id
      }
    });
    for (let key in res.data) {
      if (key === 'qinPhoneOpenState') {
        res.data[key].forEach(function (item, index) {
          res.data[`qin${index}`] = item.indexOf('已') === -1 ? false : true;
        });
        break;
      }

    }
    for (let key in res.data) {
      if(key==='qinPhone1'){
       this.studentInfo['qin1Flag']= res.data[key]!==''? true:false
      }
      if(key==='qinPhone2'){
        this.studentInfo['qin2Flag']= res.data[key]!==''? true:false
      }
      if(key==='qinPhone3'){
        this.studentInfo['qin3Flag']= res.data[key]!==''? true:false
      }
      this.studentInfo[key] = res.data[key];
    }
    this.$apply();
  }

  async updateStudentsInfo() {
    let ajaxData={
      studentImg:'',
      name:'',
      sex:'',
      classId:'',
      identity:'',
      address:'',
      regionId:'',
      studentCode:'',
      qinPhone1:'',
      qinPhone2:'',
      qinPhone3:'',
      cardCode:'',
      isGuashi:'',
      isBus:'',
      isDorm:'',
      uuid:'',
      studentId:'',
    };
    for(let key in ajaxData){
      ajaxData[key]=this.studentInfo[key]
    }
    ajaxData.userTelNum=userTelNum;
    ajaxData.userName=userName;
    let res = await api.updateStudentsInfo({
      showLoading: true,
      method: 'POST',
      data: ajaxData
    });
    if(res.data.result===200){
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      });
      wx.navigateBack({
        delta: 1
      })
    }
    console.log(res);
    this.$apply();
  }

  async getListProductSchoolInfo(){
    let res=await api.getlistProductSchool({
      method:'POST',
      data:{
        schoolId:this.schoolId
      }
    });
   if(res.data.result===200) {
     this.productList=res.data.productList;
   }
   this.$apply();
  }

  async uploadImg(paths) {
    console.log('上传图片');
    console.log(paths);
    let studentId=this.studentInfo.studentId;
    const uploadRes = await api.uploadStudentPhoto({
      filePath: paths[0],
      name: 'imgfile',
      formData: {
        studentId,
      },
    });
    const photoRes = JSON.parse(uploadRes.data);
    if(!photoRes.data || !photoRes.data[0]){
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
    this.studentInfo.studentImg=photoRes.data[0].imgUrl;
    this.$apply();
  }

  // 所有班级信息
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


  onReady() {
    console.log('ready..');
    this.animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 0,
        timingFunction: "ease",
        delay: 0
      });

    this.animation.translateY(200 + 'vh').step();
    this.animation = this.animation.export();

  }

  onShow() {
    console.log('show !');
    console.log(this.studentInfo)
  }

  async onLoad(option) {
    console.log('页面信息');
    console.log(option);
    this.schoolId=option.schoolId;
    this.gradeName = option.gradeName;
    this.studentInfo.studentId=option.id;
    for (let key in option) {
      this.studentInfo[key] = option[key];
    }
    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  async initData() {
    console.log('初始化数据');
    let studentId = this.studentInfo.id;

    // 班级信息
    this.getStudentsInfoById(studentId);

    // 获取套餐信息
    this.getListProductSchoolInfo();

    // 获取选择年级下的所有班级
    this.getClassByGradesList();

    //  获取省数据
     this.getProvince();

  }
}