import wepy from 'wepy';
import querystring from 'querystring';
import LetterIndex from '../components/letter-index/letter-index';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
  components = {
    'letter-index': LetterIndex
  }

  config = {
    navigationBarTitleText: '批量拍照-选择学校'
  }

  data = {
    schoolSets: [],
    letterIndexs: []
  }
  
  methods = {
    handleSearchSchool(){
      wx.navigateTo({
        url: `/pages/search?${querystring.stringify({page_url: '/pages/schoolAlbum'})}`,
      });
    }
  }

  events = {
    'letter-index': (e, letter) => {
      if(letter === '#'){
        letter = '';
      }
      const query = wx.createSelectorQuery();
      wx.createSelectorQuery().selectViewport().scrollOffset(scroll => {
        wx.createSelectorQuery().select(`#letter_${letter}`).boundingClientRect(ret => {
          wx.pageScrollTo({
            scrollTop: scroll.scrollTop + ret.top
          });
        }).exec();
      }).exec();
    }
  }
  async onLoad() {
    console.log('load..');
    const ret = await api.getSchoolsByUserId({data: {userId: wx.getStorageSync('userId')}});
    this.schoolSets = Toolkit.groupByFirstLetter(ret.data.data, 'schoolNameQp');
    this.$invoke('letter-index', 'set-indexs', this.schoolSets.map(s => s.label));
    this.$apply();
  
  }
  onReady() {
    console.log('ready..');

  }
  onShow() {
    console.log('show..');
  }
}