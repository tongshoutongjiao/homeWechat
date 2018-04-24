import wepy from 'wepy';
// import Toast from 'wepy-com-toast';
import * as toolkit from '../utils/toolkit';
import api from '../api';
import ECharts from '../components/ec-canvas/ec-canvas';
import FilterSlider from '../components/slider-filter/slider-filter';


export default class Index extends wepy.page {
    components = {
        echarts: ECharts,
        'filter-slider': FilterSlider,
    }
    config = {
        navigationBarTitleText: '学生管理'
    }
    data = {
        studentName: '请输入学生姓名搜索', // 学生名称
        selected: '0',// 默认选中的年级样式,
        gradesInfo: [],
        trangleDown: true,
        classInfo: [],// 班级列表信息
    }
    events = {}
    methods = {
        handleSearch() {
            console.log('input 点击事件')
            wx[this.schoolId ? 'redirectTo' : 'navigateTo']({
                url: "/pages/search?page=1&page_url=/pages/businessOpen"
            })
        },
        selectGrade: function (e) {
            let index = e.currentTarget.dataset.id;
            console.log(e)
            console.log(index);
            this.selected = index;


        },

        // 点击展开年级列表
        toggleTrangle: function (e) {
            let index = e.currentTarget.dataset.index;
            this.classInfo[index].flag = !this.classInfo[index].flag;
            this.trangleDown = !this.trangleDown;
        },
    }

    initData() {
        console.log('初始化页面数据')
        this.studentName = '请输入学生姓名',
            this.gradesInfo = [
                {
                    gradeName: '全部',
                    id: '0'
                },
                {
                    gradeName: '1年级',
                    id: '1'
                },
                {
                    gradeName: '2年级',
                    id: '2'
                },
                {
                    gradeName: '3年级',
                    id: '3'
                },
                {
                    gradeName: '4年级',
                    id: '4'
                },
                {
                    gradeName: '5年级',
                    id: '5'
                },
                {
                    gradeName: '6年级',
                    id: '6'
                },
            ]

        this.classInfo = [
            {
                gradeName: '1.01班',
                percentage: '20/50',
                gradeId: '1',
                index: '0',
                studentList: [
                    {
                        studentName: '何小炅',
                        isResidence: false,
                        status: true,
                        tel: '15329507348',
                        id: '1',
                        headImg: 'https://www.baidu.com/img/bd_logo1.png'
                    }
                ]
            },
            {
                gradeName: '1.01班',
                percentage: '10/50',
                gradeId: '1',
                index: '1',
                studentList: [
                    {
                        studentName: '何小炅',
                        isResidence: 'false',
                        status: 'true',
                        tel: '15329507348',
                        id: '1',
                        headImg: 'https://cdn2.jianshu.io/assets/default_avatar/avatar_default-78d4d1f68984cd6d4379508dd94b4210.png'
                    }
                ]
            },
        ]

        this.classInfo.forEach(function (item) {
            item.flag = false
        })
    }

    onLoad() {
        console.log('学生管理页面')

        // 初始化页面数据
        setTimeout(e => this.initData());
        console.log(this.gradesInfo)

    }

    onReady() {
        console.log('ready..');
    }

    onShow() {
        console.log('show !');
    }
}