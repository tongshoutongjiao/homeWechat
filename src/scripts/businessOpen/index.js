import wepy from 'wepy'
import api from '../api.js'
import Toast from 'wepy-com-toast'
export default class Index extends wepy.page {
    config = {
        navigationBarTitleText: '业务开通'
    }
    components = {
        toast: Toast
    }
    data = {
        empty: true, // 数据是否为空
        schoolId: '', // 学校id
        schoolName: '请输入学校名字搜索', // 学校名称
        gradeIndex: 0, // 年级选中索引
        gradeObj: [], // 年级列表
        classIndex: 0, // 班级选中索引
        classObj: [], // 班级列表
        isClass: false, // 是否以班级为单位
        gradesList: [], // 年级业务开通情况
        selectClassNum: 0,
        selectPeopleNum: 0,
        selectPhoneNum: 0,
        selectAllClass: false,
        selectAllPhone: false,
        phoneTotal: 0,
        studentList: [],
        // 开通号码类型
        mode: 'selector',
        modeIndex: 1,
        modeType: ['全部', '主号', '亲情号码2', '亲情号码3'],
        modeAble: true,
        modeId: '',
        modeObj: [],
        // 开通业务类型
        businessIndex: 0,
        businessType: [],
        businessAble: true
    }
    methods = {
        handleSearch() {
            wx[this.schoolId ? 'redirectTo' : 'navigateTo']({
                url: "/pages/search?page=1&page_url=/pages/businessOpen"
            })
        },
        openBusiness() {
            if (this.modeAble === true) {
                this.$invoke('toast', 'show', {
                    title: '请选择班级'
                })
            }
        },
        openStudentBusiness() {
            let selectedFlag=false;
            let studentList=this.data.studentList;
            bk:for(let i=0,curItem;i<studentList.length;i++){
                curItem=studentList[i];
                console.log('当前studentInfo');
                console.log(curItem);
                console.log(curItem.phoneInfo);
                for(let j=0,curInfo;j<curItem.phoneInfo.length;j++){
                    curInfo=curItem.phoneInfo[j];
                    if(curInfo.selected){
                        selectedFlag=true;
                        break bk;
                    }
                }
            }
            if (!selectedFlag&&this.businessAble === true) {
                this.$invoke('toast', 'show', {
                    title: '请选择手机号'
                })
            }
        },
        chooseClass(e) {
            const gradeIndex = e.currentTarget.dataset.gradeindex
            const classIndex = e.currentTarget.dataset.classindex
            const selected = this.gradesList[gradeIndex].list[classIndex].selected
            this.gradesList[gradeIndex].list[classIndex].selected = !selected
            if (!selected) {
                var maxClass = 0
                for (var i = 0; i < this.gradesList[gradeIndex].list.length; i++) {
                    if (this.gradesList[gradeIndex].list[i].selected) {
                        maxClass++
                    }
                }
                if (maxClass === this.gradesList[gradeIndex].list.length) {
                    this.gradesList[gradeIndex].selected = !selected
                }
                var maxGrade = 0
                for (var j = 0; j < this.gradesList.length; j++) {
                    if (this.gradesList[j].selected === !selected) {
                        maxGrade++
                    }
                }
                if (maxGrade === this.gradesList.length) {
                    this.selectAllClass = !selected
                }
            } else {
                this.gradesList[gradeIndex].selected = !selected
                this.selectAllClass = !selected
            }
            // 获取选中班级个数
            var selectNum = 0
            for (var a = 0; a < this.gradesList.length; a++) {
                for (var b = 0; b < this.gradesList[a].list.length; b++) {
                    if (this.gradesList[a].list[b].selected) {
                        selectNum++
                    }
                }
            }
            this.selectClassNum = selectNum
            if (selectNum > 0) {
                this.modeAble = false
            } else {
                this.modeAble = true
            }
            this.$apply()
        },
        chooseGrade(e) {
            const gradeIndex = e.currentTarget.dataset.gradeindex
            const selected = this.gradesList[gradeIndex].selected
            this.gradesList[gradeIndex].selected = !selected
            for (var i = 0; i < this.gradesList[gradeIndex].list.length; i++) {
                this.gradesList[gradeIndex].list[i].selected = !selected
            }
            if (!selected) {
                var maxGrade = 0
                for (var j = 0; j < this.gradesList.length; j++) {
                    if (this.gradesList[j].selected === !selected) {
                        maxGrade++
                    }
                }
                if (maxGrade === this.gradesList.length) {
                    this.selectAllClass = !selected
                }
            } else {
                this.gradesList[gradeIndex].selected = !selected
                this.selectAllClass = !selected
            }
            // 获取选中班级个数
            var selectNum = 0
            for (var a = 0; a < this.gradesList.length; a++) {
                for (var b = 0; b < this.gradesList[a].list.length; b++) {
                    if (this.gradesList[a].list[b].selected) {
                        selectNum++
                    }
                }
            }
            this.selectClassNum = selectNum
            if (selectNum > 0) {
                this.modeAble = false
            } else {
                this.modeAble = true
            }
            this.$apply()
        },
        chooseAllClass(e) {
            let selectAllClass = this.data.selectAllClass
            if (selectAllClass) {
                this.selectAllClass = false
                for (var i = 0; i < this.gradesList.length; i++) {
                    this.gradesList[i].selected = false
                    for (var j = 0; j < this.gradesList[i].list.length; j++) {
                        this.gradesList[i].list[j].selected = false
                    }
                }
            } else {
                this.selectAllClass = true
                for (var m = 0; m < this.gradesList.length; m++) {
                    this.gradesList[m].selected = true
                    for (var n = 0; n < this.gradesList[m].list.length; n++) {
                        this.gradesList[m].list[n].selected = true
                    }
                }
            }
            // 获取选中班级个数
            var selectNum = 0
            for (var a = 0; a < this.gradesList.length; a++) {
                for (var b = 0; b < this.gradesList[a].list.length; b++) {
                    if (this.gradesList[a].list[b].selected) {
                        selectNum++
                    }
                }
            }
            this.selectClassNum = selectNum
            if (selectNum > 0) {
                this.modeAble = false
            } else {
                this.modeAble = true
            }
            this.$apply()
        },
        openGrade(e) {
            const id = e.currentTarget.dataset.id
            const state = this.gradesList[id].state
            this.gradesList[id].state = !state
            this.$apply()
        },
        choosePhone(e) {
            const studentIndex = e.currentTarget.dataset.studentindex;
            const phoneIndex = e.currentTarget.dataset.phoneindex;
            const selected = this.studentList[studentIndex].phoneInfo[phoneIndex].selected;
            this.studentList[studentIndex].phoneInfo[phoneIndex].selected = !selected;
            if (!selected) {
                var maxPhone = 0
                for (var i = 0; i < this.studentList.length; i++) {
                    for (var j = 0; j < this.studentList[i].phoneInfo.length; j++) {
                        if (this.studentList[i].phoneInfo[j].selected === !selected) {
                            maxPhone++
                        }
                    }
                }
                if (maxPhone === this.phoneTotal) {
                    this.selectAllPhone = !selected
                }
            } else {
                this.selectAllPhone = !selected
            }
            // 获取选中的人和手机号个数
            var selectPeopleNum = 0
            var selectPhoneNum = 0
            for (var a = 0; a < this.studentList.length; a++) {
                var isflag = false
                for (var b = 0; b < this.studentList[a].phoneInfo.length; b++) {
                    if (this.studentList[a].phoneInfo[b].selected) {
                        selectPhoneNum++
                        isflag = true
                    }
                }
                if (isflag) {
                    selectPeopleNum++
                }
            }
            this.selectPeopleNum = selectPeopleNum
            this.selectPhoneNum = selectPhoneNum
            if (selectPhoneNum > 0) {
                this.businessAble = false
            } else {
                this.businessAble = true
            }
            this.$apply()
        },
        chooseAllPhone(e) {
            let selectAllPhone = this.data.selectAllPhone
            if (selectAllPhone) {
                this.selectAllPhone = false
                for (var i = 0; i < this.studentList.length; i++) {
                    for (var j = 0; j < this.studentList[i].phoneInfo.length; j++) {
                        this.studentList[i].phoneInfo[j].selected = false
                    }
                }
            } else {
                this.selectAllPhone = true
                for (var m = 0; m < this.studentList.length; m++) {
                    for (var n = 0; n < this.studentList[m].phoneInfo.length; n++) {
                        this.studentList[m].phoneInfo[n].selected = true
                    }
                }
            }
            // 获取选中的人和手机号个数
            var selectPeopleNum = 0
            var selectPhoneNum = 0
            for (var a = 0; a < this.studentList.length; a++) {
                var isflag = false
                for (var b = 0; b < this.studentList[a].phoneInfo.length; b++) {
                    if (this.studentList[a].phoneInfo[b].selected) {
                        selectPhoneNum++
                        isflag = true
                    }
                }
                if (isflag) {
                    selectPeopleNum++
                }
            }
            this.selectPeopleNum = selectPeopleNum
            this.selectPhoneNum = selectPhoneNum
            if (selectPhoneNum > 0) {
                this.businessAble = false
            } else {
                this.businessAble = true
            }
            this.$apply()
        },
        bindVcode(e) {
            this.studentList[e.currentTarget.dataset.studentindex].phoneInfo[e.currentTarget.dataset.phoneindex].vcode = e.detail.value;
        },
        focusVode(e) {
            // this.studentList[e.currentTarget.dataset.studentindex].phoneInfo[e.currentTarget.dataset.phoneindex].selected = true;
            this.methods.choosePhone.call(this,e);
            this.$apply()
        }
    }
    async onLoad(e) {
        if (e.id) {
            this.schoolId = e.id
            this.schoolName = decodeURI(e.name)
        }
        if (this.schoolId !== undefined && this.schoolId !== '') {
            let garde = await api.queryGrade({
                method: 'POST',
                data: {
                    schoolId: this.schoolId
                }
            })
            if (garde.data.result === 200) {
                this.gradeObj.push({
                    gradeName: '全部年级',
                    schoolId: this.schoolId
                })
                for (var b = 0; b < garde.data.gradeList.length; b++) {
                    this.gradeObj.push(garde.data.gradeList[b])
                }
            }
            let classes = await api.queryClass({
                method: 'POST',
                data: {
                    schoolId: this.schoolId
                }
            })
            if (classes.data.result === 200) {
                this.classObj.push({
                    className: '全部班级',
                    schoolId: this.schoolId
                })
            }
            let list = await api.schoolBusinessList({
                showLoading: true,
                method: 'POST',
                data: {
                    schoolId: this.schoolId
                }
            })
            if (list.data.result === 200) {
                for (var i = 0; i < list.data.schoolBusinessList.length; i++) {
                    list.data.schoolBusinessList[i].selected = 0
                    list.data.schoolBusinessList[i].state = false
                    if (i === 0) {
                        list.data.schoolBusinessList[i].state = true
                    }
                    for (var j = 0; j < list.data.schoolBusinessList[i].list.length; j++) {
                        list.data.schoolBusinessList[i].list[j].selected = 0
                    }
                }
                this.gradesList = list.data.schoolBusinessList
            }
            this.empty = false
            // 获取学校业务类型
            let type = await api.businessList({
                method: 'POST',
                data: {
                    schoolId: this.schoolId
                }
            })
            if (type.data.result === 200) {
                if (type.data.businessList.length === 1) {
                    this.mode = 'selector'
                    this.modeId = type.data.businessList[0].productId
                } else {
                    this.mode = 'multiSelector'
                    var modeType = this.modeType
                    this.modeType = []
                    this.modeType[0] = modeType
                    this.modeType[1] = []
                    for (var d = 0; d < type.data.businessList.length; d++) {
                        this.modeType[1].push(type.data.businessList[d].productFee)
                    }
                    this.modeObj = type.data.businessList
                }
                this.businessType = type.data.businessList
            }
            this.$apply()
        }
    }
    async onUnload() {
        //let pageInstance = getCurrentPages().length
        //if (pageInstance > 1) {
        //  wepy.navigateBack({
        //    delta: pageInstance - 1
        //  })
        //}
    }
    async changeGrade(e) {
        this.isClass = false
        this.gradeIndex = e.detail.value
        var data = {}
        if (this.gradeIndex === 0 || this.gradeIndex === '0') {
            data.schoolId = this.schoolId
        } else {
            data.gradeId = this.gradeObj[e.detail.value].id
        }
        let classes = await api.queryClass({
            method: 'POST',
            data: data
        })
        this.classObj = []
        if (classes.data.result === 200) {
            this.classObj.push({
                className: '全部班级',
                gradeId: data.gradeId
            })
            if (this.gradeIndex !== 0 && this.gradeIndex !== '0') {
                for (var i = 0; i < classes.data.classList.length; i++) {
                    this.classObj.push(classes.data.classList[i])
                }
            }
        }
        this.classIndex = 0
        data.schoolId = this.schoolId
        this.initData(data)
        this.$apply()
    }
    async changeClass(e) {
        this.classIndex = e.detail.value
        var data = {}
        if (this.classIndex === '0' || this.classIndex === 0) {
            this.isClass = false
            data.gradeId = this.gradeObj[e.detail.value].gradeId
        } else {
            this.isClass = true
            data.classId = this.classObj[e.detail.value].id
        }
        data.schoolId = this.schoolId
        this.initData(data)
    }
    async initData(data) {
        // 全选重置为false，已选班级和已选人数重置为0
        this.selectAllClass = false
        this.selectClassNum = 0
        this.selectPeopleNum = 0
        this.selectPhoneNum = 0
        if (!this.isClass) {
            var list = await api.schoolBusinessList({
                showLoading: true,
                method: 'POST',
                data: data
            })
        } else {
            var student = await api.studentBusinessList({
                showLoading: true,
                method: 'POST',
                data: data
            })
        }
        if (list && list.data.result === 200) {
            for (var i = 0; i < list.data.schoolBusinessList.length; i++) {
                list.data.schoolBusinessList[i].selected = 0
                list.data.schoolBusinessList[i].state = false
                if (i === 0) {
                    list.data.schoolBusinessList[i].state = true
                }
                for (var j = 0; j < list.data.schoolBusinessList[i].list.length; j++) {
                    list.data.schoolBusinessList[i].list[j].selected = 0
                }
            }
            this.gradesList = list.data.schoolBusinessList
        }
        if (student && student.data.result === 200) {
            var phoneNum = 0
            for (var a = 0; a < student.data.studentList.length; a++) {
                if (!student.data.studentList[a].studentImg) {
                    student.data.studentList[a].studentImg = '/images/icon_img.png'
                }
                student.data.studentList[a].selected = 0
                student.data.studentList[a].phoneInfo = []
                for (var b = 1; b < 4; b++) {
                    if (student.data.studentList[a]['PHONE' + b]) {
                        if (student.data.studentList[a]['phone' + b + '_state'] === '') {
                            phoneNum++
                        }
                        student.data.studentList[a].phoneInfo.push({
                            phone: student.data.studentList[a]['PHONE' + b],
                            phone_state: student.data.studentList[a]['phone' + b + '_state'],
                            selected: 0,
                            phoneType: b
                        })
                    }
                }
            }
            this.phoneTotal = phoneNum
            this.studentList = student.data.studentList
        }
        this.$apply()
    }
    async selectModeType(e) {
        var phoneNumType
        var productId
        if (e.detail.value instanceof Array) {
            phoneNumType = e.detail.value[0]
            productId = this.modeObj[e.detail.value[1]].productId
        } else {
            phoneNumType = e.detail.value
            productId = this.modeId
        }
        // 获取选中班级个数
        var classIds = ''
        for (var a = 0; a < this.gradesList.length; a++) {
            for (var b = 0; b < this.gradesList[a].list.length; b++) {
                if (this.gradesList[a].list[b].selected) {
                    if (classIds === '') {
                        classIds += this.gradesList[a].list[b].classId
                    } else {
                        classIds += ',' + this.gradesList[a].list[b].classId
                    }
                }
            }
        }
        let openResult = await api.openProduct({
            showLoading: true,
            method: 'POST',
            data: {
                schoolId: this.schoolId,
                userId: wepy.getStorageSync('userId'),
                phoneNumType: phoneNumType,
                productId: productId,
                classIds: classIds
            }
        })
        this.$invoke('toast', 'show', {
            title: openResult.data.message || openResult.data.msg
        })
        if (openResult.data.result === 200) {
            var data = {}
            if (this.classIndex === '0' || this.classIndex === 0) {
                this.isClass = false
                data.gradeId = this.gradeObj[this.gradeIndex].gradeId
            } else {
                this.isClass = true
                data.classId = this.classObj[this.classIndex].id
            }
            data.schoolId = this.schoolId
            this.initData(data)
        }
    }
    async selectBusinessType(e) {
        var productId = this.businessType[e.detail.value].productId
        var ids = ''
        var tels = ''
        var codes = ''
        var phoneTypes = ''
        for (var a = 0; a < this.studentList.length; a++) {
            for (var b = 0; b < this.studentList[a].phoneInfo.length; b++) {
                if (this.studentList[a].phoneInfo[b].selected) {
                    if (this.studentList[a].phoneInfo[b].vcode === undefined || this.studentList[a].phoneInfo[b].vcode.length !== 6) {
                        this.studentList[a].phoneInfo[b].vcode = '#'
                    }
                    if (ids === '') {
                        ids += this.studentList[a].ID
                    } else {
                        ids += ',' + this.studentList[a].ID
                    }
                    if (tels === '') {
                        tels += this.studentList[a].phoneInfo[b].phone
                    } else {
                        tels += ',' + this.studentList[a].phoneInfo[b].phone
                    }
                    if (codes === '') {
                        codes += this.studentList[a].phoneInfo[b].vcode
                    } else {
                        codes += ',' + this.studentList[a].phoneInfo[b].vcode
                    }
                    if (phoneTypes === '') {
                        phoneTypes += this.studentList[a].phoneInfo[b].phoneType
                    } else {
                        phoneTypes += ',' + this.studentList[a].phoneInfo[b].phoneType
                    }
                }
            }
        }
        let openResult = await api.openProduct({
            showLoading: true,
            method: 'POST',
            data: {
                schoolId: this.schoolId,
                userId: wepy.getStorageSync('userId'),
                productId: productId,
                ids: ids,
                tels: tels,
                codes: codes,
                phoneTypes: phoneTypes
            }
        })
        this.$invoke('toast', 'show', {
            title: openResult.data.message || openResult.data.msg
        })
        if (openResult.data.result === 200) {
            var data = {}
            if (this.classIndex === '0' || this.classIndex === 0) {
                this.isClass = false
                data.gradeId = this.gradeObj[this.gradeIndex].gradeId
            } else {
                this.isClass = true
                data.classId = this.classObj[this.classIndex].id
            }
            data.schoolId = this.schoolId
            this.initData(data)
        }
    }
}
