import wepy from 'wepy'
import api from '../api.js'
import querystring from 'querystring'

export default class Index extends wepy.page {
  config = {
    navigationBarTitleText: '终端详情'
  };
  data = {
    largeImgFlag: false,
    curPhotoList: [],

    deleteIconInfo:{
      deleteIndex:'',// 删除图片的索引

    },
    wrapperFlag:false,// 是否允许滚动页面
    scrollLeft: '',
    simNum: '11111111111',
    inputFlag: true,// 如果卡号为11个数字1时，为可编辑状态，否则不可编辑
    equipInfo: {
      farImgUrlList: [
        {
          url: 'http://img.967111.com/_1526623776505.jpg',
          index: '0',
          picType:'far',
        },
        {
          url: 'http://img.967111.com/_1526623788668.jpg',
          index: '1',
          picType:'far',
        }
      ],
      closeImgUrlList: [
        {
          url: 'http://img.967111.com/_1526623788668.jpg',
          index: '0',
          picType:'close',
        },
        {
          url: 'http://img.967111.com/_1526623776505.jpg',
          index: '1',
          picType:'close',
        }
      ]
    },

  };
  methods = {

    // 点击编辑sim卡号
    clickEditSimCard: function () {
      console.log('click edit simCard');
      this.inputFlag = true;
    },

    //   点击查看大图
    clickOperatePhoto: function (e) {
      console.log(e);
      let curPhoto = e.currentTarget.dataset.src,
        curIndex = e.currentTarget.dataset.index,
        picType = e.currentTarget.dataset.picType;
      let width = wx.getSystemInfoSync().windowWidth;

      if (picType === 'far') {
        console.log("远景照");
        console.log(curIndex);
        if(curIndex==='1'){
          this.scrollLeft=width;
          this.deleteIconInfo.deleteIndex=1;
        }else{
          this.scrollLeft=0;
          this.deleteIconInfo.deleteIndex=0;
        }
        this.deleteIconInfo.picType='far';
        this.curPhotoList = this.equipInfo.farImgUrlList;
        console.log(this.curPhotoList)
      } else {
        console.log('近景照');
        console.log(curIndex);
        if(curIndex==='1'){
          this.scrollLeft=width;
          this.deleteIconInfo.deleteIndex=1;

        }else {
          this.scrollLeft=0;
          this.deleteIconInfo.deleteIndex=0;
        }
        this.deleteIconInfo.picType='close';
        this.curPhotoList = this.equipInfo.closeImgUrlList;
      }
      this.wrapperFlag=true;
      this.largeImgFlag = true;
    },

    //  取消遮罩层效果
    cancelPhotoMask: function (e) {
      this.largeImgFlag = false;
      this.wrapperFlag=false;
    },

    // 点击删除当前图片
    deleteCurPhoto: function (e) {
      //   获取到当前图片的url ,当前照片的类型，id，然后删除
       this.largeImgFlag = false;
      this.wrapperFlag=false;
      let {picType,deleteIndex}=this.deleteIconInfo;

      // 判断是远景还是近景

      if(picType==='far'){
        deleteIndex===0?this.equipInfo.farImgUrlList.shift():this.equipInfo.farImgUrlList.pop()

      }else {
        deleteIndex===0?this.equipInfo.closeImgUrlList.shift():this.equipInfo.closeImgUrlList.pop()
      }

      console.log(this.deleteIconInfo);
    },

    //  左右滑动切换图片
    getSelectItem: function (e) {
      let width = wx.getSystemInfoSync().windowWidth;
      console.log('滑动距离');
      let curLeft=e.detail.scrollLeft;
     if(curLeft<width/2){
       console.log('第一张');
       this.deleteIconInfo.deleteIndex=0;
     }else {
       console.log('第二张');
       this.deleteIconInfo.deleteIndex=1;
     }
    },

  };

  async onLoad(e) {
    console.log(e);

  }

  onShow() {

  }

}
