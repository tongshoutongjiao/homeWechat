import wepy from 'wepy';
import api from '../api';

const defaultPhoto = '../asset/hp_icon.png';
export default class Index extends wepy.page {
    components = {}
    config = {
        navigationBarTitleText: '添加学生'
    }
    data = {
        defaultPhoto: defaultPhoto,
        multiArray: [
            ['一年级', '二年级', '三年级', '四年级'],
            ['1.01班', '1.02班', '1.03班', '1.04班', '1.05班'],
        ],
        multiIndex: [0, 0],
        studentInfo: {
            sex: '',
            isDom: '',
            isDrop: '',
        },
        pickerFlag: false,

    }
    events = {}
    methods = {

        // picker多项选择器
        bindMultiPickerChange: function (e) {
            this.pickerFlag = true;
            this.multiIndex = e.detail.value
        },
        bindMultiPickerColumnChange: function (e) {
            this.pickerFlag = true;
            this.multiIndex[e.detail.column] = e.detail.value;

            switch (e.detail.column) {
                case 0:
                    switch (this.multiIndex[0]) {
                        case 0:
                            console.log(this.multiArray);
                            this.multiArray[1] = ['1.01班', '1.02班', '1.03班', '1.04班', '1.05班'];
                            break;
                        case 1:
                            this.multiArray[1] = ['2.01班', '2.02班', '2.03班', '2.04班', '2.05班']
                            break;
                        case 2:
                            console.log(this.multiArray);
                            this.multiArray[1] = ['3.01班', '3.02班', '3.03班', '3.04班', '3.05班'];
                            console.log(this.multiArray[1])
                            break;
                        case 3:
                            this.multiArray[1] = ['4.01班', '4.02班', '4.03班', '4.04班', '2.05班'];
                            break;
                    }
                    this.multiIndex[1] = 0;
                    break;
                case 1:
                    console.log('第一列')
                    break;
            }
        },

        // 点击选中样式
        clickSelectItem: function (e) {
            console.log(e);
            let selectClassic = e.currentTarget.dataset.classic;

            switch (selectClassic) {
                case 'sex':
                    let studentSex = e.currentTarget.dataset.sex;
                    this.studentInfo.sex = studentSex;
                    console.log(studentSex);
                    console.log(this.studentInfo.sex);
                    break;
                case 'dom':
                    let isDom = e.currentTarget.dataset.isDom;
                    this.studentInfo.isDom = isDom;
                    break;
                case'drop':
                    let isDrop = e.currentTarget.dataset.isDrop;
                    this.studentInfo.isDrop = isDrop;
                    break;

            }
        },

        // 点击上传图片
        clickUploadImg: function () {
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    console.log(res);
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    var tempFilePaths = res.tempFilePaths
                }
            })


        },
    }

    onReady(e) {
        console.log('ready..');

    }

    onShow() {
        console.log('show !');
    }
}