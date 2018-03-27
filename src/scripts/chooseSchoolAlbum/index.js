import wepy from 'wepy';

import LetterIndex from '../components/letter-index/letter-index';

export default class Index extends wepy.page {
  components = {
    'letter-index': LetterIndex
  }

  config = {
    navigationBarTitleText: '批量上传-选择学校'
  }

  data = {
    schoolSets: []
  }
  
  methods = {
    handleSearchSchool(){
      wx.navigateTo({
        url: '/pages/search'
      });
    }
  }

  events = {
    'letter-index': (e, letter) => {
      console.log(letter)

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
  onLoad() {
    console.log(this);
    this.schoolSets = [
        {
          label: 'A',
          list: [
            {id:"1", name:"北京邮电大学"},
            {id:"2", name:"北京邮电大学"},
            {id:"3", name:"北京邮电大学"},
            {id:"4", name:"北京邮电大学"},
            {id:"5", name:"北京邮电大学"},
            {id:"6", name:"北京邮电大学"},
            {id:"12", name:"北京邮电大学"},
            {id:"23", name:"北京邮电大学"},
            {id:"34", name:"北京邮电大学"},
            {id:"45", name:"北京邮电大学"},
            {id:"56", name:"北京邮电大学"},
            {id:"67", name:"北京邮电大学"},
          ]
        },
        {
          label: 'B',
          list: [
            {id:"11", name:"北京邮电大学"},
            {id:"22", name:"北京邮电大学"},
            {id:"33", name:"北京邮电大学"},
            {id:"44", name:"北京邮电大学"},
            {id:"55", name:"北京邮电大学"},
            {id:"66", name:"北京邮电大学"},
            {id:"661", name:"北京邮电大学"},
            {id:"662", name:"北京邮电大学"},
            {id:"663", name:"北京邮电大学"},
            {id:"664", name:"北京邮电大学"},
            {id:"665", name:"北京邮电大学"},
            {id:"667", name:"北京邮电大学"},
            {id:"668", name:"北京邮电大学"},
            {id:"669", name:"北京邮电大学"},
          ]
        },
        {
          label: 'C',
          list: [
            {id:"111", name:"北京邮电大学"},
            {id:"222", name:"北京邮电大学"},
            {id:"333", name:"北京邮电大学"},
            {id:"444", name:"北京邮电大学"},
            {id:"555", name:"北京邮电大学"},
            {id:"666", name:"北京邮电大学"},
          ]
        }
      ];
    this.$apply();
  
  }
  onReady() {
    console.log('ready..');

  }
  onShow() {
    console.log('show !');
  }
}