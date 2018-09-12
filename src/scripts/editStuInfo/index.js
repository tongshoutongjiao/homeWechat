import wepy from 'wepy';
import api from '../api';
import CameraCom from '../components/camera/camera';

const defaultPhoto = '../asset/hp_icon.png';

const userTelNum = encodeURI(wepy.getStorageSync('userTelNum')).replace(/\+/g, '%2B');
const userName = wepy.getStorageSync('userName');


export default class Index extends wepy.page {
  components = {
    "camera-com": CameraCom
  };
  config = {
    navigationBarTitleText: '编辑学生信息'
  };
  data = {
    defaultPhoto: '',
    multiArray: [
      [],
      [],
    ],
    multiIndex: [0, 0],
    studentInfo: {
      isGuashi: '0',
      isBus: '0',
      openClickStatus1: false,
      openClickStatus2: false,
      openClickStatus3: false
    },
    pickerFlag: false,
    dialogStatus: false,
    schoolId: '',
    studentId: '',
    productList: [],
    selectClassName: '',
    showPhoto: false,
    savingFlag: false,
    cameraFlag: false,


    //  省市县三级联动
    animation: [],
    show: false,
    provinces: [],
    citys: [],
    countys: [],
    value: [0, 0, 0],
    province: '',
    city: '',
    county: '',
    pro: '',
    cit: '',
    cou: '',
    boolCameraHidden: false,
    selectAddressFlag: false,  // 判断用户是否点击修改地址
    moveY: 200,
    t: 0
  };
  events = {
    'take-photo': ret => {
      this.$invoke('camera-com', 'toggle', false);
      this.uploadImg(ret.src);
      console.log('ret');
      console.log(ret);
    }

  };
  methods = {

    // picker多项选择器
    bindMultiPickerChange: function (e) {
      this.pickerFlag = true;
      this.multiIndex = e.detail.value;
      this.selectClassName = this.multiArray[1][this.multiIndex[1]].className;
      this.studentInfo.classId = this.multiArray[1][this.multiIndex[1]].classId;
      this.studentInfo.className = '';
    },

    // picker多项选择器
    bindMultiPickerColumnChange: function (e) {
      let gradeData = this.multiArray[0];
      let value = e.detail.value;
      this.pickerFlag = true;
      this.multiIndex[e.detail.column] = value;
      if (e.detail.column === 0) {
        for (let i = 0; i < gradeData.length; i++) {
          if (i === value) {
            this.multiArray[1] = gradeData[i].list;
            this.studentInfo.classId = gradeData[i].list[0].classId;
            this.multiIndex[1] = 0;
          }
        }
      }
      else {
        //   获取到当前班级的classId
        console.log('第一列');
        this.studentInfo.classId = this.multiArray[1][value].classId;
      }
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
      let tels = e.currentTarget.dataset.tels,
        phoneTypes = e.currentTarget.dataset.phoneTypes;
      let regValue = /^[0-9]{6}$/g, flag;
      if (this.studentInfo.codes) {
        flag = regValue.test(this.studentInfo.codes);
        if (!flag) {
          wx.showToast({
            title: '请输入6位数字验证码',
            icon: 'none',
          });
          return;
        } else {
          this.studentInfo.tels = tels;
          this.studentInfo.phoneTypes = phoneTypes;
          this.studentInfo.productId = this.productList[0].productId;
          this.dialogStatus = true;
        }
      } else {
        this.studentInfo.tels = tels;
        this.studentInfo.phoneTypes = phoneTypes;
        this.studentInfo.productId = this.productList[0].productId;
        this.dialogStatus = true;
        return;
      }


    },

    // 点击确定或者取消按钮关闭弹窗，取消开通业务
    clickCloseDialog: function (e) {
      let type = e.currentTarget.dataset.type;
      switch (type) {
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
        case 'codes':
          this.studentInfo.codes = value;

          break;
      }


    },

    // 失去焦点姓名 code 是否正确
    judgeValueInput: function (e) {
      let inputType = e.currentTarget.dataset.inputType,
        value = e.detail.value;
      switch (inputType) {
        case 'name':
          let regName = /^(\w|[\u4e00-\u9fa5]){1,6}$/g;
          if (value === '') {
            break;
          }
          if (regName.test(value)) {
            this.studentInfo.name = value;
          } else {
            wx.showToast({
              title: '请输入1到6位汉字',
              icon: 'none',
            });
            value = '';
            this.studentInfo.name = '';
          }

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

    //  隐藏弹窗浮层
    hiddenFloatView(e) {
      let clickType = e.currentTarget.dataset.clickType;
      console.log(e);
      console.log(clickType);
      switch (clickType) {
        case 'cancel':
          console.log('cancel');
          this.moveY = 200;
          this.show = false;
          this.t = 0;
          this.animationEvents(this, this.moveY, this.show);
          break;
        case'sure':
          console.log('sure');
          this.pro = this.province;
          this.cit = this.city;
          this.cou = this.county;
          this.selectAddressFlag = true;
          this.moveY = 200;
          this.show = false;
          this.t = 0;
          this.animationEvents(this, this.moveY, this.show);
          break;
      }
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

    //  点击上传头像
    clickUploadImg: function (e) {
      console.log('takePhotos');
      this.cameraFlag = true;
      this.showPhoto = true;

    },

    // 点击选择上传图片的方式
    chooseUploadStyle: function (e) {

      let photoType = e.currentTarget.dataset.photoType,
        that = this;
      console.log(e);
      switch (photoType) {
        case 'camera':
          console.log('camera');
          this.$invoke('camera-com', 'toggle', true);
          this.showPhoto = false;
          this.$apply();
          break;
        case 'album':
          console.log('album');
          this.showPhoto = false;
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success: function (res) {
              console.log(res);
              let tempPaths = res.tempFilePaths;
              if (res.tempFilePaths.length) {
                that.uploadImg(res.tempFilePaths)
              } else {
                console.log('未选择图片');
              }

            }
          });
          break;
        case 'cancel':
          this.showPhoto = false;
          break;
      }
    },

    //  图片加载错误时
    handErrorImg:function () {
      console.log('图片加载失败时，执行当前函数');
      this.studentInfo.studentImg=null;
      this.$apply();
    }
  };

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
      regionId = defaultCounty.otherid;
      this.county = defaultCounty.regionName;
      this.studentInfo.regionId = regionId;
      this.$apply();
    }
  }

  async openProduct() {
    let userId = encodeURI(wepy.getStorageSync('userId')).replace(/\+/g, '%2B'),
      ids = this.studentInfo.id,
      codes = this.studentInfo.codes || '#';
    let {tels, schoolId, productId, phoneTypes} = this.studentInfo;

    let res = await api.openProduct({
      method: 'POST',
      data: {
        userId,
        ids,
        tels,
        codes,
        productId,
        schoolId,
        phoneTypes
      }
    });

    if (res.data.result === 200) {
      wx.showToast({
        title: '办理中',
        icon: 'success',
        duration: 1000
      });
      switch (phoneTypes) {
        case '1':
          console.log('1');
          this.studentInfo.openClickStatus1 = true;
          this.studentInfo.qin0 = '办理中';
          console.log(this.studentInfo.qin0);
          break;
        case '2':
          console.log('2');
          this.studentInfo.openClickStatus2 = true;
          this.studentInfo.qin1 = '办理中';
          console.log(this.studentInfo.qin1);
          break;
        case '3':
          console.log('3');
          this.studentInfo.openClickStatus3 = true;
          this.studentInfo.qin2 = '办理中';
          console.log(this.studentInfo.qin2);
          break;
      }


    } else {
      wx.showToast({
        title: '开通失败',
        icon: 'fail',
        duration: 2000
      });
    }
    this.$apply();

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
          switch (item) {
            case '已开通':
              res.data[`qin${index}`] = '已开通';
              break;
            case '未开通':
              res.data[`qin${index}`] = '未开通';
              break;
            case '办理中':
              res.data[`qin${index}`] = '办理中';
              break;
            case '试用开通':
              res.data[`qin${index}`] = '试用开通';
              break;
          }
        });
        break;
      }

    }
    for (let key in res.data) {
      if (key === 'qinPhone1') {
        this.studentInfo['qin1Flag'] = res.data[key] !== '' ? true : false
      }
      if (key === 'qinPhone2') {
        this.studentInfo['qin2Flag'] = res.data[key] !== '' ? true : false
      }
      if (key === 'qinPhone3') {
        this.studentInfo['qin3Flag'] = res.data[key] !== '' ? true : false
      }
      if (key === 'studentImg') {
        this.studentImg = res.data[key];
        this.defaultPhoto = defaultPhoto;
      }
      this.studentInfo[key] = res.data[key];
    }
    this.$apply();
  }

  async updateStudentsInfo() {
    if (this.savingFlag) {
      return;
    }
    this.savingFlag = true;
    let ajaxData = {
      studentImg: '',
      name: '',
      sex: '',
      classId: '',
      identity: '',
      address: '',
      regionId: '',
      studentCode: '',
      qinPhone1: '',
      qinPhone2: '',
      qinPhone3: '',
      cardCode: '',
      isGuashi: '',
      isBus: '',
      isDorm: '',
      uuid: '',
      studentId: '',
    };
    for (let key in ajaxData) {
      if (this.studentInfo[key] !== null && this.studentInfo[key] !== undefined) {
        ajaxData[key] = this.studentInfo[key]
      }
    }
    if (!this.selectAddressFlag) {
      ajaxData.regionId = '';
    }

    ajaxData.userTelNum = userTelNum;
    ajaxData.userName = userName;

    if (ajaxData.name === '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
      });
      return;
    }
    if (ajaxData.sex === '') {
      wx.showToast({
        title: '请选择性别',
        icon: 'none',
      });
      return;
    }
    if (this.selectClassName === '' && this.studentInfo.className === '') {
      wx.showToast({
        title: '请选择班级',
        icon: 'none',
      });
      return;
    }
    if (ajaxData.isDorm === '') {
      wx.showToast({
        title: '请选择学生类型',
        icon: 'none',
      });
      return;
    }
    if (ajaxData.qinPhone1 !== '' && ajaxData.qinPhone2 !== '' && ajaxData.qinPhone3 !== '') {
      if (ajaxData.qinPhone1 === ajaxData.qinPhone2 || ajaxData.qinPhone1 === ajaxData.qinPhone3 || ajaxData.qinPhone2 === ajaxData.qinPhone3) {
        wx.showToast({
          title: '手机号不能重复',
          icon: 'none',
        });
        return;
      }
    }


    let res = await api.updateStudentsInfo({
      showLoading: true,
      method: 'POST',
      data: ajaxData
    });
    if (res.data.result === 200) {
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        this.savingFlag = false;
        wepy.setStorageSync('editFlag', true);
        wx.navigateBack({
          delta: 1
        })
      }, 1000)


    } else {
      this.savingFlag = false;
      wx.showToast({
        title: res.data.message,
        icon: 'none',
        duration: 2000
      });
    }
    this.$apply();
  }

  async getListProductSchoolInfo() {
    let res = await api.businessList({
      method: 'POST',
      data: {
        schoolId: this.schoolId
      }
    });
    if (res.data.result === 200) {
      console.log(res.data.businessList);
      res.data.businessList.sort(this.compareProduct);
      // this.compareProduct();
      res.data.businessList.forEach(function (item, index) {
        console.log('所有的套餐信息');
        console.log(item);
        console.log(item.productFee);
        console.log(item.productFee.substr(0, 1));
        console.log(index);
      });
      this.productList = res.data.businessList;
      console.log(this.productList)
    }
    this.$apply();
  }

  async uploadImg(paths) {
    let localSrc = typeof paths == 'object' ? paths[0] : paths;
    let studentId = this.studentInfo.studentId;
    const uploadRes = await api.uploadStudentPhoto({
      filePath: localSrc,
      name: 'imgfile',
      formData: {
        studentId,
      },
    });
    const photoRes = JSON.parse(uploadRes.data);
    console.log('上传结果');
    console.log(photoRes);
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
    this.studentInfo.studentImg = photoRes.data[0].imgUrl;
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

    //
    console.log('根据学校id获取所有的年级信息');
    console.log(list);


    // 保存所有年级数据
    tempData = list.data.result === 200 ? list.data.schoolBusinessList : [];

    tempData.forEach(function (item) {
      item.className = item.gradeName;
    });

    this.multiArray[0] = tempData;

    // 设置班级默认值为第一个年级下的数据
    this.multiArray[1] = tempData[0].list;
    this.$apply();
  }

  // 动画事件
  animationEvents(that, moveY, show) {
    that.animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 500,
        timingFunction: "ease",
        delay: 0
      }
    );
    that.animation.translateY(moveY + 'vh').step();
    that.animation = that.animation.export();
  }

  // 对比套餐类型
  compareProduct(obj1, obj2) {
    console.log('对比套餐类型');
    var val1 = obj1.productFee.substr(0, 1);
    var val2 = obj2.productFee.substr(0, 1);
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
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
    console.log('编辑学生信息');
    this.$invoke('camera-com', 'toggle', false);
    this.schoolId = option.schoolId;
    this.gradeName = option.gradeName;
    this.studentInfo.studentId = option.id;

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
