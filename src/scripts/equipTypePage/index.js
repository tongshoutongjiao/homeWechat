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
    inputValue: '',
    inputFlag: false
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
      selectItem.forEach((item) => {
        if (item.name === '自定义') {
          item.customName = this.inputValue || item.customName;
        }
      });
      this.handleCustomData();
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
      let type = this.type;
      console.log('获取自定义输入框中的内容，只要其中内容为空，就取消当前项的选择');

      let value = e.detail.value;
      value = value.replace(/(^\s*)|(\s*$)/g, '');


      this.inputValue = value;
      this.inputFlag = true;
      value === '' ? this.selectInfo[0].selected = false : this.selectInfo[0].selected = true;
      this.$parent.globalData[`${type}`] = this.selectInfo;
      this.handleCustomData();
      this.$apply();
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

  // 处理自定义项中的数据
  handleCustomData() {
    let type = this.type,
      data = this.$parent.globalData;
    // 提交判断一下如果当前input框中的数值为空时，直接将当前自定义项中选择
    console.log(this.selectInfo);
    if (this.selectInfo[0].name === '自定义' && this.selectInfo[0].selected == false) {
      this.selectInfo[0].customName = '';
      this.inputValue = '';
      this.$apply();
    }
    if (this.selectInfo[0].name === '自定义' && (this.inputValue === '' && this.selectInfo[0].customName == '')) {
      for (let key in data) {
        if (key === type) {
          data[key][0].selected = false;
        }
      }
      this.$apply()
    }


  }
}