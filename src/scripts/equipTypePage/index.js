import wepy from 'wepy';

export default class Index extends wepy.page {
  components = {};
  config = {
    navigationBarTitleText: '设备管理选择页面'
  };

  data = {
    type: '',
    iconFlag: true,
    selectInfo: [],
    personList: [],
    inputValue:'',
    inputFlag:false
  };

  methods = {

    // 点击选择对应的选项
    clickSelectType: function (e) {
      let index = e.currentTarget.dataset.index,
        type = this.type,
        curType = this.selectInfo[index];
      curType.selected = !curType.selected;
      this.$parent.globalData[`${type}`] = this.selectInfo;
      this.$apply();
    },

    //  点击保存按钮，将选中信息存储在全局变量中
    clickSaveSelected: function () {
      let selectItem = [];
      selectItem = this.selectInfo.filter(function (item) {
        return item.selected === true;
      });
      selectItem.forEach( (item)=> {
        if(item.name==='自定义'){
          item.customName=this.inputValue||item.customName;
        }
      });
      wepy.navigateBack({
        delta: 1
      })
    },

    // 点击输入自定义内容
    clickInputContent: function (e) {
      console.log('输入内容');
      console.log(e);
    },

  //  input 框中的内容
    getInputValue(e) {
      this.inputValue = e.detail.value;
      this.inputFlag=true;
    },

  };

  async onLoad(option) {
    this.type = option.type;
    console.log(this.$parent.globalData);
    this.handleData();
  }

  handleData() {
    let type = this.type,
      globalData = this.$parent.globalData;
    globalData[`${type}`] && (this.selectInfo = globalData[`${type}`]);
    this.$apply();
  }

}