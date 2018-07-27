import api from '../api';
import wepy from "wepy";

// 根据设备id查询设备信息
export async function getEquipById(id) {
  let resData;
  let res = await api.getEquipInfoById({
    method: 'POST',
    data: {
      id
    }
  });
  if (res.statusCode === 200) {
    resData = res.data;
    return resData;
  } else {
    wepy.showToast({
      title: res.data.message,
      icon: 'none',
      duration: 1000
    });
    return;
  }
}

//  图片信息处理
export function handleImgUrlInfo(self) {
  // 初始化提交数据
  console.log('处理图片信息');
  self.imgUrlList.submitData = {};
  console.log(self.imgUrlList.submitData);
  let tempArray = [],
    submitData = self.imgUrlList.submitData;

  [self.imgUrlList.closeImgUrlList, self.imgUrlList.farImgUrlList].forEach(function (item, index) {
    if (index === 0) {
      item.forEach(function (spec, specIndex) {
        specIndex++;
        submitData[`imgUrl${specIndex}`] = spec.url;
      })
    } else {
      item.forEach(function (spec, specIndex) {
        specIndex += 3;
        submitData[`imgUrl${specIndex}`] = spec.url;
      })
    }
  });
  tempArray = self.imgUrlList.closeImgUrlList.concat(self.imgUrlList.farImgUrlList);
  submitData.imgnum = tempArray.length;
  submitData.imgId = self.imgId;
  tempArray = null;
  self.$apply();
}

// 维修页面及安装页面处理上传图片的操作
export function getImgUrl(ret, picType, self) {
  let farImgUrlArray = self.imgUrlList.farImgUrlList,
    closeImgUrlArray = self.imgUrlList.closeImgUrlList;

  if (picType === 'far') {
    farImgUrlArray = farImgUrlArray || [];
    farImgUrlArray.push({url: ret});
    farImgUrlArray.forEach(function (item, index) {
      item.index = index;
      item.picType = 'far';
    });
  } else {
    closeImgUrlArray = closeImgUrlArray || [];
    closeImgUrlArray.push({url: ret});
    closeImgUrlArray.forEach(function (item, index) {
      item.index = index;
      item.picType = 'close';
    });
  }
  self.$apply();
}

// 点击实现上传图片功能

export function uploadEquipImage(e, self) {


  let picType = e.currentTarget.dataset.picType;
  wx.chooseImage({
    count: 1, // 默认9
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      let tempFilePaths = res.tempFilePaths;
      this.uploadImg(tempFilePaths, picType, self);
    }
  });
  if (picType === 'far') {
    console.log('远景照');
    self.picType = 'far';

  } else {
    console.log('近景照');
    self.picType = 'close';
  }
  self.$apply();

}

// 上传图片
export async function uploadImg(paths, picType, self) {
  console.log('点击上传图片');
  let localSrc = typeof paths == 'object' ? paths[0] : paths;
  const uploadRes = await api.addStudentPhoto({
    filePath: localSrc,
    name: 'imgfile',
    formData: {},
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
  this.getImgUrl(photoRes.data[0].imgUrl, picType, self);
  self.showPhoto = false;
}

// 左右切换大图
export function slideLargeImg(e, self) {
  let width = wx.getSystemInfoSync().windowWidth,
    curLeft = e.detail.scrollLeft;
  curLeft < (width / 2) ? self.deleteIconInfo.deleteIndex = 0 : self.deleteIconInfo.deleteIndex = 1;
  self.$apply();
}

// 删除大图
export function deleteCurPhoto(self) {
  self.largeImgFlag = false;
  let {picType, deleteIndex} = self.deleteIconInfo;

  // 判断是远景还是近景
  if (picType === 'far') {
    deleteIndex === 0 ? self.imgUrlList.farImgUrlList.shift() : self.imgUrlList.farImgUrlList.pop();
  } else {
    deleteIndex === 0 ? self.imgUrlList.closeImgUrlList.shift() : self.imgUrlList.closeImgUrlList.pop();
  }
  self.$apply();

}

// 点击查看大图
export function clickCheckImg(e, self) {
  let curIndex = e.currentTarget.dataset.index,
    picType = e.currentTarget.dataset.picType,
    width = wx.getSystemInfoSync().windowWidth;
  if (picType === 'far') {
    if (curIndex == '1') {
      console.log('大图移动距离width');
      console.log(width);
      self.scrollLeft = width+5;
      self.deleteIconInfo.deleteIndex = 1;
    } else {
      self.scrollLeft = 0;
      self.deleteIconInfo.deleteIndex = 0;
    }
    self.deleteIconInfo.picType = 'far';
    self.curPhotoList = self.imgUrlList.farImgUrlList;
  } else {
    if (curIndex == '1') {
      self.scrollLeft = width+5;
      self.deleteIconInfo.deleteIndex = 1;
    } else {
      self.scrollLeft = 0;
      self.deleteIconInfo.deleteIndex = 0;
    }
    self.deleteIconInfo.picType = 'close';
    self.curPhotoList = self.imgUrlList.closeImgUrlList;
  }
  self.largeImgFlag = true;
  self.$apply()


}

// 根据学校id查询到学校的年级以及班级信息
export async function getBussinessList(self) {
  let list = await api.schoolBusinessList({
    showLoading: false,
    method: 'POST',
    data: {
      schoolId: self.schoolId
    }
  });
  if(list.data.result===200){
   return   list.data.schoolBusinessList;
  }
}


// 批量上传学生照片
export async function batchUploadPhoto(data,self,callback){
  console.log('批处理学生的照片信息');
  let tempArray=[];

  for(let i=0,curItem;i<data.length;i++) {
    curItem = data[i];
    let rate=(i+1)/(data.length);
    let percent=((rate.toFixed(2))*100).toFixed()+'%';

    console.log('rate:',rate);
    console.log('rate取两位小数',rate.toFixed(2));
    console.log('percent',percent);




    wx.showLoading({
      title:`上传进度 `+String(percent),
      icon: 'loading',
      mask:true
    });
    let uploadRes = await api.uploadStudentPhoto({
      filePath: curItem.imgUrl,
      name: 'imgfile',
      formData: {
        studentId: curItem.studentId
      },
    });
    // 如果当前图片上传成功，直接清除上传照片的数据
    let photoRes = JSON.parse(uploadRes.data);
    if(!photoRes.data || !photoRes.data[0]){
      // 如果单张照片上传失败的话，保存当前照片的信息
      tempArray.push(curItem)
    }
    else {
      data.splice(i,1);
      i--;
      self.localPhotoNumber=data.length;
      self.$apply();
    }
  }
  if(!tempArray.length){
    wx.hideLoading();
    setTimeout(function(){
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 1000
      });
    },1000)
  }else {
    wx.showToast({
      title: `有${tempArray.length}张照片未上传，请重新上传`,
      icon: 'none',
    })
  }
  callback(tempArray,self)
}

