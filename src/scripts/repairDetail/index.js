import wepy from 'wepy';
import api from '../api';
import uploadImg from '../components/uploadImg/uploadImg';
import * as Toolkit from '../utils/toolkit';


// http://img.967111.com/_1526623776505.jpg
// http://img.967111.com/_1526623788668.jpg
// 从后台获取前景照后景照图片时，如果照片长度大于两张，则修改添加图标的默认状态
export default class Index extends wepy.page {
  components = {
    "upload-img":uploadImg
  };
  config = {
    navigationBarTitleText: '维修'
  };
  events = {
    'take-photo': ret => {
      console.log('ret');
      console.log(ret);

      // this.$invoke('camera-com', 'toggle', false);
      // this.uploadImg(ret.src);

    },
    'getImgUrl':ret=>{
      this.repairInfo.farImgUrlList= this.repairInfo.farImgUrlList?this.repairInfo.farImgUrlList:[];
      this.repairInfo.closeImgUrlList=this.repairInfo.closeImgUrlList?this.repairInfo.closeImgUrlList:[];
      this.picType==='far'?this.repairInfo.farImgUrlList.push({url:ret.url}):this.repairInfo.closeImgUrlList.push({url:ret.url});
      if(this.repairInfo.farImgUrlList.length>=2){
        this.farIconFlag=false
      }
      if(this.repairInfo.closeImgUrlList.length>=2){
        this.closeIconFlag=false
      }
      this.$apply();
    }
  };

  data = {
    showPhoto: false,
    picType: '',
    date: {},// 日期
    curPhoto:'',
    scrollLeft:'',// 滚动条的位置


    typeList: ['faultType', 'repairPerson', 'hardware', 'faultView', 'faultReason', 'handleMeasures', 'remark'],//  故障类型，维修人员，硬件类型，故障现象，故障原因，处理措施，备注

    alertData: {

      // 终端使用状态数据
      endStatusData: {
        array: ['未使用', '在使用', '已丢失'],
        endStatusIndex: 0,
      },

      //
      endBoard: {
        array: ['V2主板', 'V3主板', 'V5主板'],
        endBoardIndex: 0

      }
    },
    repairInfo: {
      farImgUrlList:[
        {url:'http://img.967111.com/_1526623776505.jpg'},
        {url:'http://img.967111.com/_1526623788668.jpg'}
      ]
    },// 本页面维修数据
    farIconFlag:true,// 远景照图标
    closeIconFlag:true ,// 近景照图标\
    largeImgFlag:false,

  };

  methods = {
    // 接单日期
    bindStartDateChange: function (e) {
      console.log(e);
      this.date.startDate = e.detail.value;
    },

    // 维修日期
    bindRepairDateChange: function (e) {
      this.date.repairDate = e.detail.value;
    },

    // 改变终端使用状态
    bindEndStatusChange: function (e) {
      console.log(e.detail.value);
      this.alertData.endStatusData.endStatusIndex = e.detail.value;
    },

    // 故障终端主板
    bindEndBoard: function (e) {
      this.alertData.endBoard.endBoardIndex = e.detail.value;
    },

    //  跳转页面并选择对应的数据
    clickChooseOptions: function (e) {
      let type = e.currentTarget.dataset.type;
      switch (type) {
        case'faultType':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'repairPerson':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'hardware':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'faultView':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'faultReason':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'handleMeasures':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
        case 'remark':
          wepy.navigateTo({
            url: `/pages/equipTypePage?` + Toolkit.jsonToParam(e.currentTarget.dataset)
          });
          break;
      }
    },

    //  点击上传图片
    clickUploadImage: function (e) {
      console.log('执行上传图片功能');
      let picType = e.currentTarget.dataset.picType;
      this.$invoke('upload-img', 'toggle', true);
      if (picType === 'far') {
        console.log('远景照');
        this.picType = 'far';

      } else {
        console.log('近景照');
        this.picType = 'close';
      }
      this.$apply();

    },

  //   点击查看大图
    clickOperatePhoto:function (e) {
      console.log(e);
      let curPhoto=e.currentTarget.dataset.src,
        picType=e.currentTarget.dataset.picType;
      console.log('当前所有图片');
      console.log(curPhoto);
      this.curPhoto=curPhoto;
      this.largeImgFlag=true;

    //

    },

  //  取消遮罩层效果
    cancelPhotoMask:function (e) {
      this.largeImgFlag=false;
    },

  // 点击删除当前图片
    deleteCurPhoto:function () {
    //   获取到当前图片的url ,当前照片的类型，id，然后删除
      this.largeImgFlag=false;

    },

  //  左右滑动切换图片
    getSelectItem:function (e) {
     console.log('e');
     console.log(e);
     let width= wx.getSystemInfoSync().windowWidth;
      this.scrollLeft=e.detail.scrollLeft;
    },
  }
  ;
  onLoad(data) {
    // 初始化页面数据
    setTimeout(e => this.initData());
  }

  onReady() {
    console.log('ready..');
  }

  onShow() {
    console.log('show..');
    console.log(this.$parent.globalData);

    //   回显选择的globalDate中的数据
    this.echoGlobalData();
  }

  echoGlobalData() {
    //
    let data = this.$parent.globalData,
      repairInfo = this.repairInfo;

    for (let value of this.typeList) {
      repairInfo[`${value}Selected`] = data[`${value}selected`] ? data[`${value}selected`] : '';
    }
  }

  uploadImg(path) {
    console.log(path);
  }
  async initData(e) {

  }
}