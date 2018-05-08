import wepy from 'wepy'
import api from '../api.js'
import Toast from 'wepy-com-toast'
import util from '../utils/util'
export default class Index extends wepy.page {
    config = {
        navigationBarTitleText: '重置密码'
    }
    data = {
        phoneActive: '', // 手机号边框
        phone: '', // 手机号
        phoneFocus: false, // 手机号输入框获取焦点
        phoneModel: 'block', // 手机号placeholder
        phoneIcon: 'none', // 手机号清除图标
        vCodeActive: '', // 验证码边框
        vCode: '', // 验证码
        vCodeFocus: false, // 验证码输入框获取焦点
        vCodeModel: 'block', // 验证码placeholder
        vCodeIcon: 'none', // 验证码清除图标
        passwordActive: '', // 密码边框
        password: '', // 密码
        passwordFocus: false, // 密码输入框获取焦点
        passwordModel: 'block', // 密码placeholder
        passwordIcon: 'none', // 密码清除图标
        rePasswordActive: '', // 密码边框
        rePassword: '', // 密码
        rePasswordFocus: false, // 密码输入框获取焦点
        rePasswordModel: 'block', // 密码placeholder
        rePasswordIcon: 'none', // 密码清除图标
        vCodeStatus: 'active', // 获取验证码按钮样式
        vCodeText: '获取验证码', // 获取验证码按钮样式
        wait: 60,
        btnStatus: '' // 登录按钮样式
    }
    components = {
        toast: Toast
    }
    // 输入框获取焦点事件
    async inputFocus(e) {
        // 判断输入框类型
        if (e.currentTarget.dataset.type === 'phone') {
            this.phoneActive = 'active' // 修改手机号边框
            // 手机号不为空，显示清除图标
            if (e.detail.value) {
                this.phoneIcon = 'block'
            }
        } else if (e.currentTarget.dataset.type === 'vCode') {
            this.vCodeActive = 'active' // 修改验证码边框
            // 验证码不为空，显示清除图标
            if (e.detail.value) {
                this.vCodeIcon = 'block'
            }
        } else if (e.currentTarget.dataset.type === 'password') {
            this.passwordActive = 'active' // 修改密码边框
            // 密码不为空，显示清除图标
            if (e.detail.value) {
                this.passwordIcon = 'block'
            }
        } else {
            this.rePasswordActive = 'active' // 修改再次输入密码边框
            // 再次输入密码不为空，显示清除图标
            if (e.detail.value) {
                this.rePasswordIcon = 'block'
            }
        }
    }
    // 输入框输入事件
    async inputInput(e) {
        // 判断输入框类型
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
            if (this.phone.length === 11 && this.vCode.length === 6 && this.password.length >= 6 && this.rePassword.length >= 6) {
                this.btnStatus = 'active'
            } else {
                this.btnStatus = ''
            }
        } else if (e.currentTarget.dataset.type === 'vCode') {
            this.vCode = e.detail.value // 给验证码赋值
            // 判断验证码是否为空，如果不为空，隐藏placeholder，显示清除图标，否则显示placehoder，隐藏清除图标
            if (!e.detail.value) {
                this.vCodeModel = 'block'
                this.vCodeIcon = 'none'
            } else {
                this.vCodeModel = 'none'
                this.vCodeIcon = 'block'
            }
            // 判断输入内容满足登录条件时，登录按钮变蓝
            if (this.phone.length === 11 && this.vCode.length === 6 && this.password.length >= 6 && this.rePassword.length >= 6) {
                this.btnStatus = 'active'
            } else {
                this.btnStatus = ''
            }
        } else if (e.currentTarget.dataset.type === 'password') {
            this.password = e.detail.value // 给验证码赋值
            // 判断密码是否为空，如果不为空，隐藏placeholder，显示清除图标，否则显示placehoder，隐藏清除图标
            if (!e.detail.value) {
                this.passwordModel = 'block'
                this.passwordIcon = 'none'
            } else {
                this.passwordModel = 'none'
                this.passwordIcon = 'block'
            }
            // 判断输入内容满足登录条件时，登录按钮变蓝
            if (this.phone.length === 11 && this.vCode.length === 6 && this.password.length >= 6 && this.rePassword.length >= 6) {
                this.btnStatus = 'active'
            } else {
                this.btnStatus = ''
            }
        } else if (e.currentTarget.dataset.type === 'rePassword') {
            this.rePassword = e.detail.value // 给验证码赋值
            // 判断再次输入密码是否为空，如果不为空，隐藏placeholder，显示清除图标，否则显示placehoder，隐藏清除图标
            if (!e.detail.value) {
                this.rePasswordModel = 'block'
                this.rePasswordIcon = 'none'
            } else {
                this.rePasswordModel = 'none'
                this.rePasswordIcon = 'block'
            }
            // 判断输入内容满足登录条件时，登录按钮变蓝
            if (this.phone.length === 11 && this.vCode.length === 6 && this.password.length >= 6 && this.rePassword.length >= 6) {
                this.btnStatus = 'active'
            } else {
                this.btnStatus = ''
            }
        }
    }
    // 输入框失去焦点事件
    async inputBlur(e) {
        // 判断输入框类型
        if (e.currentTarget.dataset.type === 'phone') {
            this.phoneIcon = 'none' // 隐藏手机号清除图标
            this.phoneFocus = false // 手机号输入框失去焦点
            if (!e.detail.value) {
                this.phoneActive = '' // 修改手机号边框
            }
        } else if (e.currentTarget.dataset.type === 'vCode') {
            this.vCodeIcon = 'none' // 隐藏验证码清除图标
            this.vCodeFocus = false // 验证码输入框失去焦点
            if (!e.detail.value) {
                this.vCodeActive = '' // 修改验证码边框
            }
        } else if (e.currentTarget.dataset.type === 'password') {
            this.passwordIcon = 'none' // 隐藏密码清除图标
            this.passwordFocus = false // 密码输入框失去焦点
            if (!e.detail.value) {
                this.passwordActive = '' // 修改密码边框
            }
        } else if (e.currentTarget.dataset.type === 'rePassword') {
            this.rePasswordIcon = 'none' // 隐藏再次输入密码清除图标
            this.rePasswordFocus = false // 再次输入密码输入框失去焦点
            if (!e.detail.value) {
                this.rePasswordActive = '' // 修改再次输入密码边框
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
            this.btnStatus = 'btn-default' // 登录按钮置灰
            this.phoneFocus = true // 手机号输入框获取焦点
        } else if (e.currentTarget.dataset.type === 'vCode') {
            this.vCode = '' // 清空验证码输入框
            this.vCodeIcon = 'none' // 清除按钮隐藏
            this.vCodeModel = 'block' // 显示placeholder
            this.btnStatus = 'btn-default' // 登录按钮置灰
            this.vCodeFocus = true // 验证码输入框获取焦点
        } else if (e.currentTarget.dataset.type === 'password') {
            this.password = '' // 清空密码输入框
            this.passwordIcon = 'none' // 清除按钮隐藏
            this.passwordModel = 'block' // 显示placeholder
            this.btnStatus = 'btn-default' // 登录按钮置灰
            this.passwordFocus = true // 密码输入框获取焦点
        } else if (e.currentTarget.dataset.type === 'rePassword') {
            this.rePassword = '' // 清空再次输入密码输入框
            this.rePasswordIcon = 'none' // 清除按钮隐藏
            this.rePasswordModel = 'block' // 显示placeholder
            this.btnStatus = 'btn-default' // 登录按钮置灰
            this.rePasswordFocus = true // 再次输入密码输入框获取焦点
        }
    }
    // 获取验证码
    async getVcode() {
        if (this.vCodeStatus === '') {
            return false
        } else {
            if (!util.vailPhone(this.phone)) {
                this.$invoke('toast', 'show', {
                    title: '请输入正确的手机号'
                })
                return false
            }
            let _this = this
            _this.vCodeStatus = ''
            _this.vCodeText = _this.wait + 's'
            _this.wait--
            let time = setInterval(function() {
                if (_this.wait === 0) {
                    _this.vCodeStatus = 'active'
                    _this.vCodeText = '再次获取验证码'
                    _this.wait = 60
                    clearInterval(time) // 停止计时器
                } else {
                    _this.vCodeStatus = ''
                    _this.vCodeText = _this.wait + 's'
                    _this.wait--
                }
                _this.$apply()
            }, 1000)
            // 访问发送验证码接口
            await api.sms({
                method: 'POST',
                data: {
                    telNum: this.phone
                }
            })
        }
    }
    // 重置密码
    async reset(e) {
        if (this.btnStatus === 'active') {
            if (this.password !== this.rePassword) {
                this.$invoke('toast', 'show', {
                    title: '两次输入的密码不一致'
                })
                return false
            }
            let result = await api.findPwd({
                method: 'POST',
                data: {
                    telNum: this.phone,
                    pwd: this.password,
                    sms: this.vCode
                }
            })
            this.$invoke('toast', 'show', {
                title: result.data.error || result.data.msg || result.data.message || '网络请求失败'
            })
            if (result.data.result === 200) {
                await wepy.redirectTo({url: 'forgetPassword'})
            }
        }
    }
}