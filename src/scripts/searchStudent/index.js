import wepy from 'wepy';
import api from '../api';
import ECharts from '../components/ec-canvas/ec-canvas';
import FilterSlider from '../components/slider-filter/slider-filter';


export default class Index extends wepy.page {
    components = {
        echarts: ECharts,
        'filter-slider': FilterSlider,
    }
    config = {
        navigationBarTitleText: '搜索学生'
    }
    data = {
        studentName: '请输入学生姓名搜索', // 学生名称
        selected: '0',// 默认选中的年级样式,
        gradesInfo: [],
        trangleDown: true,
        classData: [],
        classInfo: [],// 班级列表信息
        schoolId: '',
        schoolName: '',
        studentList: []
    }
    events = {}
    methods = {
        searchValueInput(e) {
            var value = e.detail.value
            if (value !== '') {
                this.search(value)
            }
        },

    }

    async search(e) {
        console.log('搜索设置搜索设置')
        let result = await api.searchSchool({
            method: 'POST',
            data: {
                userId: wepy.getStorageSync('userId'),
                keywords: e,
                operaType: 6
            }
        })
        if (result.data.result === 200) {
            if (result.data.schoolList.length > 0) {
                this.empty = false
                if (result.data.schoolList.length > 5) {
                    this.schoolList = result.data.schoolList.slice(0, 5)
                } else {
                    this.schoolList = result.data.schoolList
                }
            } else {
                this.empty = true
            }
            this.$apply()
        }
    }




    async initData() {

    }

    async onLoad(e) {
        this.schoolId = e.id;
        this.schoolName = e.name;

        // 初始化页面数据
        setTimeout(e => this.initData());
    }

    onReady() {
        console.log('ready..');
    }

    onShow() {
        console.log('show !');
    }
}
