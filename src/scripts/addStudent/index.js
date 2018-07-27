import wepy from 'wepy';
import api from '../api';
import toolkit from '../utils/toolkit.js'
import CameraCom from '../components/camera/camera';

const defaultPhoto = '../asset/hp_icon.png';
const userTelNum = encodeURI(wepy.getStorageSync('userTelNum')).replace(/\+/g, '%2B');
const userName = wepy.getStorageSync('userName');

export default class Index extends wepy.page {
	components = {
		"camera-com": CameraCom
	}
	config = {
		navigationBarTitleText: '添加学生'
	};
	data = {
		defaultPhoto: defaultPhoto,
		multiArray: [
			[],
			[],
		],
		selectClassName:'',
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
			isGuashi: '0',// 1挂失 0否
			isBus: '0',// 1 乘车 0否
			isDorm: '',// 1 住宿 0 走读
			uuid: ''

		},
		gradeName: '',
		cameraFlag:false,

		// 相册弹出框
		showPhoto:false,
		savingFlag:false,

		//  省市县三级联动
		animation:[],
		show: false,

		provinces: [],
		citys: [],
		countys: [],
		value: [0, 0, 0],
		province:'',
		city: '',
		county: '',
		pro:'',
		cit:'',
		cou:'',
		boolCameraHidden: false,
		selectAddressFlag: false,  // 判断用户是否点击修改地址
		moveY:200,
		t:0
	};
	events = {
		'take-photo' : async (ret) => {
			this.$invoke('camera-com', 'toggle', false);
			this.uploadImg(ret.src);
		}
	};
	methods = {

		// picker多项选择器
		bindMultiPickerChange: function (e) {
			this.multiIndex = e.detail.value;
			this.selectClassName=this.multiArray[1][this.multiIndex[1]].className;
			console.log('点击确定时执行该方法');
			console.log(this.multiArray[1][this.multiIndex[1]]);
			this.selectClassId=this.multiArray[1][this.multiIndex[1]].classId;
			console.log(this.selectClassId);
			this.$apply()

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
							this.selectClassId=gradeData[i].list[0].classId;
							console.log('lalla');
							console.log(this.selectClassId);
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

		// 点击选择上传图片的方式
		chooseUploadStyle:function(e){

			let photoType=e.currentTarget.dataset.photoType,
				that=this;
			console.log(e);
			switch (photoType){
				case 'camera':
					console.log('camera');
					this.$invoke('camera-com', 'toggle', true);
					this.showPhoto=false;
					this.$apply();
					break;
				case 'album':
					console.log('album');
					this.showPhoto=false;
					wx.chooseImage({
						count: 1, // 默认9
						sizeType: ['original', 'compressed'],
						sourceType: ['album'],
						success: function (res) {
							console.log(res);
							let tempPaths = res.tempFilePaths;
							if (res.tempFilePaths.length) {
								that.uploadImg(res.tempFilePaths);
							} else {
								console.log('未选择图片');
							}

						}
					});
					break;
				case 'cancel':
						this.showPhoto=false;
					break;
			}
		},

		// 点击上传图片
		clickUploadImg: function () {
			this.showPhoto=true;
			this.cameraFlag=true;
		},

		// 点击保存新增学生信息
		clickSaveStudentInfo: function (e) {
			console.log('保存用户输入的信息');
			//


      if(this.selectClassName===''){
        wx.showToast({
          title: '请选择班级',
          icon: 'none',
        });
        return;
      }

			if(this.studentInfo.name===''){
				wx.showToast({
					title: '请输入姓名',
					icon: 'none',
				});
				return;
			}
			if(this.studentInfo.sex===''){
				wx.showToast({
					title: '请选择性别',
					icon: 'none',
				});
				return;
			}

			if(this.studentInfo.isDorm===''){
				wx.showToast({
					title: '请选择学生类型',
					icon: 'none',
				});
				return;
			}
			if(this.studentInfo.qinPhone1&&this.studentInfo.qinPhone2&&this.studentInfo.qinPhone3){
				if(this.studentInfo.qinPhone1===this.studentInfo.qinPhone2||this.studentInfo.qinPhone1===this.studentInfo.qinPhone3||this.studentInfo.qinPhone2===this.studentInfo.qinPhone3){
					wx.showToast({
						title: '手机号不能重复',
						icon: 'none',
					});
					return;
				}
			}

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

		// 失去焦点姓名 code 是否正确
		judgeValueInput:function(e){
      let inputType = e.currentTarget.dataset.inputType,
        value = e.detail.value;
      switch (inputType){
        case 'name':
          let regName=/^(\w|[\u4e00-\u9fa5]){1,6}$/g;
          if(value===''){
          	break;
          }
          if(regName.test(value)){
            this.studentInfo.name = value;
          }else {
            wx.showToast({
              title: '请输入1到6位汉字',
              icon: 'none',
            });
            value='';
            this.studentInfo.name='';
          }
          break;
      }

		},

		//  隐藏弹窗浮层
		hiddenFloatView(e) {
			let clickType=e.currentTarget.dataset.clickType;
			console.log(e);
			console.log(clickType);
			switch (clickType){
				case 'cancel':
					console.log('cancel');
					this.moveY = 200;
					this.show = false;
					this.t = 0;
					this.animationEvents(this, this.moveY, this.show);
					break;
				case'sure':
					console.log('sure');
					this.selectAddressFlag=true;
					this.pro=this.province;
					this.cit=this.city;
					this.cou=this.county;
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

    //  图片加载错误时
    handErrorImg:function () {
      console.log('图片加载失败时，执行当前函数');
      this.studentInfo.studentImg=null;
      this.$apply();
    }
	};

	// 动画事件
	animationEvents(that, moveY, show) {
		console.log("moveY:" + moveY + "\nshow:" + show);
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
		let localSrc=typeof paths=='object'?paths[0]:paths;



		// 上传图片
		console.log('临时图片路径');
		console.log(localSrc);
		this.saveLocalImg(localSrc);

		// const uploadRes = await api.addStudentPhoto({
		// 	filePath: localSrc,
		// 	name: 'imgfile',
		// 	formData: {},
		// });
		// console.log('uploadRes');
		// console.log(uploadRes);
		// const photoRes = JSON.parse(uploadRes.data);
		// if (!photoRes.data || !photoRes.data[0]) {
		// 	wx.showToast({
		// 		title: '上传失败',
		// 		icon: 'none',
		// 	});
		// 	return;
		// }
		// wx.showToast({
		// 	title: '上传成功',
		// 	icon: 'success',
		// });
		// console.log(uploadRes);
		// this.studentInfo.studentImg = photoRes.data[0].imgUrl;
		this.$apply();

	}

	onReady() {
		console.log('ready..');
		this.animation =  wx.createAnimation({
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
		if(this.savingFlag){
			return;
		}
		this.savingFlag=true;
		let data = this.studentInfo;

		data.userTelNum = userTelNum;
		data.userName = userName;
		data.classId=this.selectClassId;
		if(!this.selectAddressFlag){
			data.regionId='';
		}
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
      wepy.setStorageSync('editFlag',true);
		  setTimeout(()=>{
				this.savingFlag=false;
				wx.navigateBack({
					delta: `1?id=${this.schoolId}`
				})
			},1000)

		}else {
			console.log(res.data);
			this.savingFlag=false;
			wx.showToast({
				title: res.data.message,
				icon: 'none',
				duration: 2000
			});

		}
	}


	async saveLocalImg(url){
		console.log('url');
		console.log(url);
    wx.saveImageToPhotosAlbum({
      filePath:url,
      success(res) {
      	console.log('保存到相册成功');
      	console.log(res);
      	wepy.setStorageSync('imgUrl', url);
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
      },
	    fail(){
      console.log('fail')
	    },
      complete(){
        console.log('complete');
      }
    })

	}
}