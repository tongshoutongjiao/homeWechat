
import wepy from 'wepy'
import api from '../api.js'
import Toast from 'wepy-com-toast'
export default class Index extends wepy.page {
    config = {
        navigationBarTitleText: '登录'
    }
    data = {
        phoneFocus: false, // 手机号输入框获取焦点
        passwordFocus: false, // 密码输入框获取焦点
        phoneActive: '', // 手机框边框
        passwordActive: '', // 密码边框
        phoneImg: 'phone_d', // 手机号图标
        passwordImg: 'password_d', // 密码图标
        phone: '', // 手机号
        password: '', // 密码
        phoneIcon: 'none', // 手机号清除图标
        passwordIcon: 'none', // 密码清除图标
        phoneModel: 'block', // 手机号placeholder
        passwordModel: 'block', // 密码placeholder
        btnStatus: '' // 登录按钮样式
    }
    components = {
        toast: Toast
    }
    // onload函数
    async onLoad() {
        console.log('login')
        console.log('loadbfdf....vvsdv...')
        var curTimeStamp = new Date().getTime() // 获取当前时间
        var noticeTimeStamp = wepy.getStorageSync('noticeTimeStamp') // 获取存储token的时间
        // 判断存储的时间是否存在和是否过期，存在和没有过期的话，跳转到主界面
        if (noticeTimeStamp && (curTimeStamp - noticeTimeStamp) < 7 * 24 * 3600 * 1000) {
            wepy.redirectTo({url: 'main'})
        }
    }
    // 输入框获取焦点事件
    async inputFocus(e) {
        // 判断是手机号输入框还是密码输入框
        if (e.currentTarget.dataset.type === 'phone') {
            this.phoneActive = 'active' // 修改手机号框边框
            this.phoneImg = 'phone' // 修改手机号图标
            // 手机号不为空，显示清除图标
            if (e.detail.value) {
                this.phoneIcon = 'block'
            }
        } else {
            this.passwordActive = 'active' // 修改密码框边框
            this.passwordImg = 'password' // 修改密码图标
            // 密码不为空，显示清除图标
            if (e.detail.value) {
                this.passwordIcon = 'block'
            }
        }
    }
    // 输入框输入事件
    async inputInput(e) {
        // 判断是手机号输入框还是密码输入框
        if (e.currentTarget.dataset.type === 'phone') {
            this.phone = e.detail.value // 给手机号赋值
            // 判断手机号是否为空，如果不为空，隐藏placeholder，显示清除图标，否则显示placehoder，隐藏清除图标
            if (!e.detail.value) {
                this.phoneModel = 'block'
                this.phoneIcon = 'none'
            } else {
                this.phoneModel = 'none'
                this.phoneIcon = 'block'
            }
            // 判断输入内容满足登录条件时，登录按钮变蓝
            if (this.phone.length === 11 && this.password.length > 0) {
                this.btnStatus = 'active'
            } else {
                this.btnStatus = ''
            }
        } else {
            this.password = e.detail.value // 给密码赋值

            // 判断密码是否为空，如果不为空，隐藏placeholder，显示清除图标，否则显示placehoder，隐藏清除图标
            if (!e.detail.value) {
                this.passwordModel = 'block'
                this.passwordIcon = 'none'
            } else {
                this.passwordModel = 'none'
                this.passwordIcon = 'block'
            }
            // 判断输入内容满足登录条件时，登录按钮变蓝
            if (this.phone.length === 11 && this.password.length > 0) {
                this.btnStatus = 'active'
            } else {
                this.btnStatus = ''
            }
        }
    }
    // 输入框失去焦点事件
    async inputBlur(e) {
        // 判断是手机号输入框还是密码输入框
        if (e.currentTarget.dataset.type === 'phone') {
            this.phoneIcon = 'none' // 隐藏手机号清除图标
            this.phoneFocus = false // 手机号输入框失去焦点
            if (!e.detail.value) {
                this.phoneActive = '' // 修改手机号框边框
                this.phoneImg = 'phone_d' // 修改手机号图标
            }
        } else {
            this.passwordIcon = 'none' // 隐藏密码清除图标
            this.passwordFocus = false // 密码输入框失去焦点
            if (!e.detail.value) {
                this.passwordActive = '' // 修改密码框边框
                this.passwordImg = 'password_d' // 修改密码图标
            }
        }
    }
    // 清除图标点击事件
    async inputClear(e) {
        // 判断是手机号输入框还是密码输入框
        if (e.currentTarget.dataset.type === 'phone') {
            this.phone = '' // 清空手机号输入框
            this.phoneIcon = 'none' // 清除按钮隐藏
            this.phoneModel = 'block' // 显示placeholder
            this.btnStatus = '' // 登录按钮置灰
            this.phoneFocus = true // 手机号输入框获取焦点
        } else {
            this.password = '' // 清空密码输入框
            this.passwordIcon = 'none' // 清除按钮隐藏
            this.passwordModel = 'block' // 显示placeholder
            this.btnStatus = '' // 登录按钮置灰
            this.passwordFocus = true // 密码输入框获取焦点
        }
    }
    // 登录
    async login(e) {
        if (this.btnStatus === 'active') {
            let result = await api.login({
                method: 'POST',
                data: {
                    userName: this.phone,
                    pwd: this.password
                }
            })
            if (result.data.result === 200) {
                wepy.setStorageSync('token', result.data.token)
                wepy.setStorageSync('userId', result.data.userId)
                wepy.setStorageSync('userName', result.data.userName)
                wepy.setStorageSync('noticeTimeStamp', new Date().getTime())
                await wepy.redirectTo({url: 'main'})
            } else {
                this.$invoke('toast', 'show', {
                    title: result.data.error || result.data.msg || result.data.message || '网络请求失败'
                })
            }
        }
    }
    // 忘记密码
    async forgetPassword() {
        await wepy.navigateTo({url: 'forgetPassword'})
    }
}
